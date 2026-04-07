# ADR-011: DB-Level Wallet & Balance Simulation

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

The original spec (§ 3.5) only required "simulate payment processing" — a status change from PENDING to PAID with a 2-3 second delay. No actual money movement. This made "Pay" meaningless — just a button that changes a label.

We need financial operations to feel real even without a payment gateway. Users should see balances, track money flow, and understand the financial impact of their actions.

## Decision

Add a **DB-level wallet system** that simulates real money transfers:

- **Wallet model**: Per-user balance stored as integer cents with CHECK constraint (non-negative)
- **Transaction model**: Immutable audit trail for every money movement
- **Atomic transfers**: Pay action deducts from payer, credits sender, in single Serializable transaction
- **Topup simulation**: Users add funds to their wallet (simulates bank transfer)

### Key Rules
- `sleep(2500)` happens OUTSIDE transaction (DB-02 compliance)
- Balance check happens INSIDE transaction (no double-spend)
- `decrement`/`increment` Prisma atomic operations prevent race conditions
- CHECK constraint is the DB-level last line of defense

## Consequences

### Positive
- Pay action has real financial meaning — balance changes visible immediately
- Insufficient funds prevention — can't pay without balance
- Full audit trail — every cent movement tracked
- Both parties see the impact on their wallets

### Negative
- Added complexity (2 new models, migration, new repository)
- Topup is simulated — no real bank integration
- CHECK constraint only catches application bugs (Zod prevents user-facing issues)

## Alternatives Considered

### Status-only simulation (original spec)
- **Why rejected**: "Pay" with no financial impact feels meaningless and doesn't demonstrate fintech depth

### Real payment gateway (Stripe)
- **Why rejected**: Out of scope for assignment. Would require real money, KYC, regulatory compliance.
