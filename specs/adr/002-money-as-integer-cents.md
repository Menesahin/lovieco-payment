# ADR-002: Store Money as Integer Cents

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

LovePay handles monetary values in payment requests. Financial applications must guarantee exact arithmetic — rounding errors on money are unacceptable. JavaScript's `Number` type uses IEEE 754 double-precision floating-point, which causes well-known precision issues:

```
0.1 + 0.2 = 0.30000000000000004  // wrong
0.1 * 3   = 0.30000000000000004  // wrong
```

We need a strategy to store, transmit, and display money safely throughout the stack (client, server, database).

## Decision

All monetary values are stored and processed as **integer cents** (also known as "minor units").

- `$25.00` is stored as `2500`
- `$0.01` is stored as `1`
- `$100,000.00` is stored as `10000000`
- Database column: `amountCents Int` (Prisma) → `INTEGER` (PostgreSQL)
- All arithmetic (addition, subtraction, comparison) happens on integers only
- Conversion to display format (`$25.00`) happens **only** at the UI layer via a `formatCents()` utility
- Conversion from user input to cents happens **only** at the form submission boundary via `Math.round(dollarAmount * 100)`

## Consequences

### Positive
- **Zero precision errors**: Integer arithmetic in JavaScript is exact for values up to `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991) — that's $90 trillion, far beyond our needs
- **Database exact**: PostgreSQL `INTEGER` is exact, no rounding
- **Simple comparisons**: `amountCents >= 1` is cleaner than `amount >= 0.01`
- **Industry standard**: Stripe, Revolut, Square all use integer cents internally
- **No extra dependencies**: No need for Decimal.js, Big.js, or Dinero.js

### Negative
- **Developer discipline**: Team must remember to always work in cents, never accidentally mix dollars and cents
- **Display conversion needed**: Every UI display requires `(amountCents / 100).toFixed(2)` — mitigated by centralized `formatCents()` utility
- **Input conversion needed**: Form input accepts dollars, must convert to cents before server action

### Safeguards
- Prisma schema enforces `Int` type — Prisma rejects float values at the ORM level
- Zod validation enforces `z.number().int().min(1).max(10000000)` on server
- TypeScript branded type `type Cents = number & { __brand: 'cents' }` (optional, for extra safety)
- `formatCents()` and `toCents()` are the only conversion functions — centralized, tested

## Alternatives Considered

### JavaScript Float (Number)
- **Pros**: Native, no conversion needed
- **Cons**: `0.1 + 0.2 !== 0.3`. Completely unacceptable for financial applications.
- **Why rejected**: Precision errors are a hard blocker for any fintech application.

### Decimal.js / Big.js Library
- **Pros**: Arbitrary precision decimal arithmetic
- **Cons**: Extra dependency (~100KB for Decimal.js), performance overhead for simple operations, must wrap every operation in library calls
- **Why rejected**: Overkill for our use case. We only do add, subtract, compare — no interest calculation, amortization, or compound math. Integer cents is simpler and equally precise.

### PostgreSQL NUMERIC/DECIMAL Column
- **Pros**: Database-level decimal precision
- **Cons**: Prisma maps `Decimal` to a special type that requires `.toNumber()` conversions, adds complexity to every query result handling
- **Why rejected**: Adds ORM complexity without benefit when the application layer uses integers.

### Dinero.js (Money Pattern Library)
- **Pros**: Martin Fowler's Money Pattern, handles currency, formatting, and allocation
- **Cons**: Additional dependency, learning curve, overkill for single-currency application
- **Why rejected**: We are single-currency (USD) with basic operations. Dinero.js shines for multi-currency and complex allocation — not our use case.
