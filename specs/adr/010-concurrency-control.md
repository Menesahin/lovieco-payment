# ADR-010: Pessimistic Locking with Serializable Isolation for Payment Actions

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

Payment requests can be acted upon by multiple users simultaneously. Critical concurrency scenarios:

1. **Two recipients pay the same request**: If a bug or race condition allows two payment windows open, both click "Pay" at the same time
2. **Recipient pays while sender cancels**: Both actions target the same PENDING request simultaneously
3. **Recipient declines while request expires**: Decline action races with check-on-read expiration

In all cases, exactly **one** action must succeed and the others must be safely rejected. A double-payment or inconsistent state is unacceptable in a financial application.

## Decision

All payment actions (pay, decline, cancel) use **Prisma's `$transaction` with `Serializable` isolation level** — the strictest isolation level in PostgreSQL.

### Implementation Pattern
```typescript
export async function payRequest(requestId: string) {
  const user = await requireAuth()

  return await prisma.$transaction(async (tx) => {
    // 1. Read with implicit lock (Serializable prevents concurrent reads from proceeding)
    const request = await tx.paymentRequest.findUnique({
      where: { id: requestId },
    })

    // 2. Guard checks (fail-fast, early return)
    if (!request) return { error: 'not_found' }
    if (request.recipientId !== user.id) return { error: 'unauthorized' }
    if (request.status !== 'PENDING') return { error: 'already_' + request.status.toLowerCase() }
    if (request.expiresAt < new Date()) {
      await tx.paymentRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' },
      })
      return { error: 'expired' }
    }

    // 3. Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500))

    // 4. Atomic update
    await tx.paymentRequest.update({
      where: { id: requestId },
      data: { status: 'PAID', paidAt: new Date() },
    })

    return { success: true }
  }, {
    isolationLevel: 'Serializable',  // Strictest isolation
    timeout: 10000,                   // 10s timeout (includes simulated delay)
  })
}
```

### How Serializable Isolation Works
- When Transaction A reads a row, PostgreSQL tracks this read
- If Transaction B tries to modify the same row concurrently, it is serialized (waits or aborts)
- If both transactions try to update the same row, only one succeeds — the other receives a serialization failure error
- Result: impossible for two concurrent `payRequest()` calls to both succeed on the same request

### Race Scenario Resolution

**Scenario 1: Two pay attempts simultaneously**
```
T1: BEGIN SERIALIZABLE → read request (PENDING) → sleep 2.5s → UPDATE status=PAID → COMMIT ✓
T2: BEGIN SERIALIZABLE → read request (PENDING) → sleep 2.5s → UPDATE status=PAID → SERIALIZATION FAILURE ✗
T2 caller receives: { error: 'already_paid' } (on retry, status is PAID)
```

**Scenario 2: Pay + Cancel simultaneously**
```
T1 (pay):    BEGIN → read (PENDING) → sleep → UPDATE PAID → COMMIT ✓
T2 (cancel): BEGIN → read (PENDING) → UPDATE CANCELLED → SERIALIZATION FAILURE ✗
T2 caller receives: { error: 'already_paid' }
```

**Scenario 3: Decline + Expire simultaneously**
```
T1 (decline): BEGIN → read (PENDING) → UPDATE DECLINED → COMMIT ✓
T2 (expire):  markExpiredOnRead → UPDATE status=EXPIRED WHERE status=PENDING → 0 rows affected (already DECLINED)
```

## Consequences

### Positive
- **Correctness guaranteed**: Impossible to double-pay, double-decline, or have conflicting state transitions
- **Database enforced**: PostgreSQL's MVCC + Serializable Snapshot Isolation handles the locking — no application-level lock management
- **Simple code**: No manual `SELECT ... FOR UPDATE`, no explicit lock statements, no retry loops in application code
- **Fail-safe**: On conflict, the transaction aborts rather than producing incorrect state

### Negative
- **Performance overhead**: Serializable isolation is slower than Read Committed (PostgreSQL default). Each conflicting transaction must wait or retry. Acceptable for our scale (~100 concurrent users, infrequent conflicts).
- **Serialization failures require handling**: Client may see errors on concurrent actions. Mitigated: we return structured error messages, and the UI prevents most concurrent scenarios (button disabled after click).
- **Longer lock hold time**: The 2.5s simulated delay holds the transaction open longer than ideal. In a real payment system, the delay would happen outside the transaction (after locking status). For simulation purposes, keeping it inside is acceptable.

### Safeguards
- Transaction timeout: 10 seconds (prevents indefinite lock holding)
- Button disabled after click (prevents most double-submissions from the same user)
- Idempotent status check: `if (request.status !== 'PENDING')` catches already-transitioned requests
- Structured error returns: client shows "This request has already been paid" — not a generic 500

## Alternatives Considered

### Optimistic Locking (Version Column)
- **Pros**: No lock contention, better read performance
- **Cons**: Requires `version` column, retry logic on conflict, more application code. Risk: both transactions succeed their reads, but only one write wins — need retry loop.
- **Why rejected**: Serializable isolation achieves the same result with less code. Optimistic locking is better for high-contention, high-throughput systems — not our scale.

### Application-Level Lock (Redis / Mutex)
- **Pros**: Fine-grained control, can lock per-request
- **Cons**: Requires Redis or external lock service. Lock expiry/cleanup logic. Risk of orphaned locks.
- **Why rejected**: Adds infrastructure (Redis) for a problem PostgreSQL solves natively.

### Read Committed + Manual `SELECT FOR UPDATE`
- **Pros**: Standard PostgreSQL approach for row-level locking
- **Cons**: Requires raw SQL in Prisma (not supported in standard Prisma query API). More verbose.
- **Why rejected**: Prisma's `$transaction` with `isolationLevel: 'Serializable'` is cleaner and achieves the same result without raw SQL.

### No Concurrency Control (Trust UI)
- **Pros**: Simplest code
- **Cons**: Race conditions are possible. Two users could both pay the same request. Unacceptable in fintech.
- **Why rejected**: Financial correctness is non-negotiable. "It probably won't happen" is not an acceptable guarantee.
