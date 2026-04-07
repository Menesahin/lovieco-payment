# Project Constitution

> Governing principles for the LovePay P2P Payment Request application.
> This document is the source of truth for all coding standards, architectural rules, and quality gates.

---

## 1. Code Quality

- TypeScript strict mode enabled, `any` is forbidden — use `unknown` + type guards
- Named exports only, no default exports
- Absolute imports with `@/` path alias
- ESLint + Prettier enforced on every commit
- Early return pattern — guard clauses first, happy path last
- Constants over magic numbers — define named constants for thresholds, limits, durations
- Prefer `const` assertions for literal types
- Catch `unknown` errors, narrow with `instanceof`
- Async: always handle rejections, no fire-and-forget promises

---

## 2. Next.js 16.2 Best Practices

- **Server Components by default** — add `'use client'` only for leaf-level interactive UI (hooks, event handlers, browser APIs)
- Keep Client Components **leaf-level** to minimize shipped JavaScript bundle
- **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` are all async — must be `await`ed
- **Server Actions** are treated as untrusted endpoints — validate every input, keep in dedicated files
- Server Actions are **POST-only** — CSRF protection via SameSite cookies + Origin header verification
- `redirect()` is called **after** `revalidatePath()`/`revalidateTag()` and **outside** try/catch (it throws internally)
- Expected errors in Server Actions → return structured value `{ error: string }`; unexpected → throw
- `useActionState` (React 19) for pending states and optimistic updates
- **Caching is explicit opt-in**: use `use cache` directive for cacheable components/functions/routes — no implicit caching
- `updateTag()` in Server Actions for read-your-writes semantics
- `revalidateTag()` with `cacheLife` profile for SWR behavior
- Convention files required: `loading.tsx`, `error.tsx`, `not-found.tsx` for each route group
- **`proxy.ts`** instead of `middleware.ts` for network boundary logic (Node.js runtime only)
- **Turbopack is default** — no custom webpack configs, 2-5x faster builds
- **React Compiler is stable** and built-in — no manual memoization needed
- Dynamic import for components >50KB that are not above-the-fold
- `next/image` for all images (auto WebP, lazy loading, responsive sizes — width/height optional for remote)
- `next/font` for self-hosted fonts (no external font requests)
- `output: "standalone"` in `next.config.ts` for Docker deployment
- **Node.js 20.9+** required, TypeScript 5.1.0+

---

## 3. Prisma Best Practices

- **Singleton pattern** via `globalThis` — prevents connection pool exhaustion on hot-reload
- Never call `$disconnect()` after requests — reuse connections across warm invocations
- **`$transaction()`** for all multi-step operations — automatic rollback on failure
- Transactions must be **short** — no network I/O or slow queries inside `$transaction`
- Use `select` to fetch only needed fields — reduce payload, improve performance
- Use `include` judiciously for relations — avoid N+1 with explicit nested includes
- Handle `PrismaClientKnownRequestError` by error code:
  - `P2002` — unique constraint violation
  - `P2025` — record not found
  - `P2003` — foreign key constraint failure
- Pagination: always use `skip`/`take` — never fetch entire tables
- Schema indexes (`@@index`) on all frequently queried fields
- Raw queries only when ORM cannot express the query — always use parameterized placeholders

---

## 4. Fintech Transaction Rules

- **Atomicity**: Every financial state change wrapped in `prisma.$transaction()`
- **Idempotency**: Payment operations include idempotency key (UUID v4) — duplicate submissions return previous result without re-processing
- **Concurrency control**: Concurrent pay attempts on same request → pessimistic locking with `isolationLevel: 'Serializable'`
- **Validate inside transaction**: Status and expiration checks happen **within** the transaction, not before it
- **Integer cents**: All monetary values stored as `Int` (1599 = $15.99) — float arithmetic on money is forbidden
- **Zod validation**: Every Server Action input validated at entry point
- **Amount boundaries**: Minimum $0.01 (1 cent), Maximum $100,000.00 (10,000,000 cents)
- **Self-request prevention**: Sender cannot request money from their own email

---

## 5. Error Handling

- **Early return** — check error conditions first, return/throw immediately, keep happy path unindented
- Server Actions: `try/catch` mandatory
  - Expected errors → return `{ success: false, error: "User-friendly message" }`
  - Unexpected errors → throw (caught by error boundary)
- Prisma errors: map error codes to user-friendly messages — never expose raw DB errors
- React error boundaries: `error.tsx` catches rendering errors, displays fallback UI
- Stack traces and database details are **never** exposed to the client
- Retry logic: exponential backoff for transient network/DB errors
- Validation errors: return all field errors at once (not one at a time)

---

## 6. Logging (Pino)

- **Structured JSON logging** via Pino (5-8x faster than Winston, NDJSON format)
- Every log entry includes: `level`, `timestamp`, `pid`, `msg`, structured context

### What to Log
- Authentication events (sign-in, sign-out, session creation)
- All financial transactions (amount, status change, actor, result)
- Error events with stack traces and request context
- Rate limit violations
- Database errors and retry attempts

### What NOT to Log
- Passwords, API keys, auth tokens
- Raw email addresses in bulk (individual transaction logs are OK)
- Full request/response bodies containing sensitive data

### Audit Log (Separate)
- Immutable audit trail for every financial state change
- Fields: `actor`, `action`, `resource`, `timestamp`, `previousState`, `newState`
- Stored separately from application logs

### Log Levels
- `info` — transactions, auth events, state changes
- `warn` — validation failures, rate limits, retries
- `error` — exceptions, failed transactions, database errors
- `debug` — flow tracing (development environment only)

---

## 7. Security

- All Server Action inputs validated with Zod schemas
- Sensitive data lives only in Server Components — never shipped to client bundle
- `.env` files are never committed — `.env.example` provided with placeholder values
- CSRF protection: POST-only Server Actions + SameSite cookies + Origin header validation
- Rate limiting on payment endpoints — prevent brute-force and abuse
- Authorization check (`requireAuth()`) as the **first line** of every Server Action
- Shareable tokens are separate from internal IDs — prevents enumeration
- HTML output auto-escaped by React — no manual XSS prevention needed for JSX
- User input stored as plain text, rendered with React (no `dangerouslySetInnerHTML`)

---

## 8. Testing

- **Playwright E2E** for all critical user paths — video recording enabled (`video: "on"`)
- Test auth bypass: `NODE_ENV=test` activates CredentialsProvider (no magic link in tests)
- **Arrange-Act-Assert** pattern for all tests
- Each test is **isolated** — no interdependencies, each test sets up its own data
- Descriptive test names: `"should [expected behavior] when [condition]"`
- Test factories for data creation: `createTestUser()`, `createTestPaymentRequest()`
- Test **behavior**, not implementation details
- Coverage: focus on critical financial paths, not 100% line coverage
- Mobile + Desktop viewport projects in Playwright config

---

## 9. UX

- **Responsive-first** design — works on mobile (375px) and desktop (1440px)
- **WCAG 2.1 AA** accessibility — semantic HTML, aria labels on interactive elements, keyboard navigation
- Loading states for **all** async operations — skeleton screens or spinners
- Confirmation dialogs before **all** destructive actions (Pay, Decline, Cancel)
- Toast notifications on success and error
- Form validation: inline errors shown immediately, all errors at once (not sequential)
- Currency display: always formatted with $ prefix, two decimal places ($25.00, not $25)
- Status badges: color-coded (Pending=yellow, Paid=green, Declined=red, Cancelled=gray, Expired=dark red)

---

## 10. Process

- **Conventional commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- `specs/` directory is the **source of truth** — code follows specs, not the other way around
- Every architectural decision documented as an **ADR** in `specs/adr/`
- Code changes that contradict specs require a spec update first
- PR descriptions reference the relevant spec section

---

## 11. SOLID Principles (TypeScript Adaptation)

- **S — Single Responsibility**: Each file/function has one reason to change. Server Action = mutation only. Query function = read only. Component = UI render only.
- **O — Open/Closed**: Extend behavior through composition, not modification. New status type → extend state machine, don't modify existing transitions.
- **L — Liskov Substitution**: All implementations of an interface honor the full contract. Every `PaymentAction` function returns the same `ActionResult` type.
- **I — Interface Segregation**: Small, focused interfaces. `UserProfile` vs `UserAuth` vs `UserPayment` — not one monolithic `User` interface.
- **D — Dependency Inversion**: Upper modules depend on abstractions, not concretions. Database access goes through repository interfaces, not direct Prisma calls in actions.

---

## 12. Design Patterns

- **Repository Pattern** (`src/lib/repositories/`): All database access abstracted behind repository interfaces. Server Actions call repositories, never Prisma directly. Enables testability and single point of change for queries.
- **DTO Pattern**: Prisma models are never returned directly to the client. Map to DTOs via transformer functions (`toRequestDTO()`, `toUserDTO()`). Controls what data leaves the server boundary.
- **Factory Pattern**: Test data creation through factory functions (`createTestUser()`, `createTestPaymentRequest()`). Consistent, reusable test data with sensible defaults and overrides.
- **Strategy Pattern**: Validation logic composed from independent strategies. Email validation, amount validation, expiration validation — each a separate pure function, composed in Server Actions.
- **Guard Pattern**: Authorization and validation as guard functions with early return. `requireAuth()`, `requirePending()`, `requireNotExpired()`, `requireOwnership()` — composable, reusable, fail-fast.
