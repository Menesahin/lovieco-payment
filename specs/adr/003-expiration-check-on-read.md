# ADR-003: Request Expiration via Check-on-Read Pattern

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

Payment requests in LovePay expire after 7 days if not paid or declined. We need a mechanism to:
1. Detect when a request has expired
2. Update the status from PENDING to EXPIRED
3. Prevent payment of expired requests
4. Display accurate status on dashboards and detail pages

The question is whether to use a background process (cron, queue) or an on-demand approach.

## Decision

We use the **check-on-read** pattern: expiration is evaluated every time a PENDING request is read from the database. No background jobs, no cron, no queue workers.

### Implementation

**Query-level check — `markExpiredOnRead()`:**
```typescript
async function markExpiredOnRead(requests: PaymentRequest[]): Promise<PaymentRequest[]> {
  const expiredIds = requests
    .filter(r => r.status === 'PENDING' && r.expiresAt < new Date())
    .map(r => r.id)

  if (expiredIds.length > 0) {
    await prisma.paymentRequest.updateMany({
      where: { id: { in: expiredIds }, status: 'PENDING' },
      data: { status: 'EXPIRED' },
    })
  }

  return requests.map(r =>
    expiredIds.includes(r.id) ? { ...r, status: 'EXPIRED' } : r
  )
}
```

**Action-level check — inside `payRequest()` transaction:**
```typescript
// Inside $transaction with Serializable isolation:
const request = await tx.paymentRequest.findUnique({ where: { id } })
if (request.expiresAt < new Date()) {
  await tx.paymentRequest.update({ where: { id }, data: { status: 'EXPIRED' } })
  return { error: 'expired' }
}
```

**Client-level check — countdown timer:**
- `useEffect` + `setInterval` (every 60s) compares `expiresAt` with current time
- When countdown reaches 0, UI disables Pay button immediately (no server round-trip needed)
- Server validates definitively on any action attempt

## Consequences

### Positive
- **Zero infrastructure**: No cron daemon, no queue worker, no additional services to deploy or monitor
- **Docker simplicity**: Single container for the app — no sidecar processes
- **Idempotent**: Calling `markExpiredOnRead()` multiple times is safe — `WHERE status = 'PENDING'` guard prevents double-updates
- **Correct on every read**: User always sees accurate status — no stale data between cron runs
- **Server authoritative**: Even if client timer is inaccurate (clock skew), server validates on action

### Negative
- **Write on read**: Read operations may trigger a database write (status update). For most use cases this is negligible overhead.
- **Unread requests stay PENDING**: A request that nobody views could remain PENDING in the DB past its expiry. This is cosmetically incorrect but functionally harmless — any attempt to act on it will trigger the check.
- **Slight read latency**: The `updateMany` adds a few milliseconds to reads that encounter expired requests.

### Mitigations for Negatives
- The `updateMany` only fires when expired PENDING requests exist — no overhead on clean reads
- If eventual consistency of unread requests becomes a concern, a lightweight daily cleanup query can be added later without architectural change:
  ```sql
  UPDATE payment_requests SET status = 'EXPIRED'
  WHERE status = 'PENDING' AND expires_at < NOW();
  ```

## Alternatives Considered

### Cron Job (node-cron / system cron)
- **Pros**: Proactively updates all expired requests on schedule
- **Cons**: Requires a long-running process or separate container. Adds deployment complexity. Interval between runs means requests may still appear PENDING briefly.
- **Why rejected**: Added infrastructure burden with minimal benefit. Check-on-read is simpler and equally correct for user-visible state.

### Database Scheduled Event (pg_cron)
- **Pros**: Runs inside PostgreSQL, no application code needed
- **Cons**: Requires `pg_cron` extension (not available on all PostgreSQL hosts). Adds database-level complexity.
- **Why rejected**: Not portable across hosting providers. Ties business logic to database infrastructure.

### BullMQ / Queue Worker
- **Pros**: Reliable, retryable, scalable for high-volume scenarios
- **Cons**: Requires Redis + worker process. Massive overkill for "update a status field."
- **Why rejected**: Over-engineered for the problem scope. We have ~100 concurrent users, not millions.

### Computed Column / View
- **Pros**: PostgreSQL could compute `CASE WHEN expires_at < NOW() THEN 'EXPIRED' ELSE status END`
- **Cons**: Doesn't persist the status change. Makes querying by status more complex (can't index computed value easily). Prisma doesn't natively support computed columns.
- **Why rejected**: Requires raw SQL for queries, breaks Prisma type safety.
