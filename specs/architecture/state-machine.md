# Payment Request State Machine

> Formal definition of all status transitions for LovePay PaymentRequest
> Last updated: 2026-04-07

---

## State Diagram

```
                         ┌─────────────────────────────────┐
                         │                                  │
              create()   │           PENDING                │
           ─────────────►│                                  │
                         │  - Default state on creation     │
                         │  - Mutable: can transition to    │
                         │    any terminal state            │
                         │  - Has expiresAt (createdAt+7d)  │
                         │                                  │
                         └────┬──────┬──────┬───────────────┘
                              │      │      │
                              │      │      │
              ┌───────────────┘      │      └────────────────┐
              │                      │                       │
              ▼                      ▼                       ▼
   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │                  │   │                  │   │                  │
   │      PAID        │   │    DECLINED      │   │   CANCELLED      │
   │                  │   │                  │   │                  │
   │  Actor: Recipient│   │  Actor: Recipient│   │  Actor: Sender   │
   │  Action: pay()   │   │  Action: decline │   │  Action: cancel()│
   │  Sets: paidAt    │   │  Sets: declinedAt│   │  Sets: cancelAt  │
   │                  │   │                  │   │                  │
   │  ■ TERMINAL      │   │  ■ TERMINAL      │   │  ■ TERMINAL      │
   └──────────────────┘   └──────────────────┘   └──────────────────┘


                         ┌──────────────────┐
                         │                  │
         check-on-read   │    EXPIRED       │
         (system auto)   │                  │
         ───────────────►│  Actor: System   │
                         │  Trigger: read   │
                         │  Condition:      │
                         │  expiresAt < now │
                         │                  │
                         │  ■ TERMINAL      │
                         └──────────────────┘
```

---

## States

| State | Description | Mutable | Entry Condition |
|-------|-------------|---------|-----------------|
| **PENDING** | Request created, awaiting action | Yes | `createRequest()` |
| **PAID** | Recipient fulfilled the payment | No (terminal) | `payRequest()` by recipient |
| **DECLINED** | Recipient rejected the request | No (terminal) | `declineRequest()` by recipient |
| **CANCELLED** | Sender withdrew the request | No (terminal) | `cancelRequest()` by sender |
| **EXPIRED** | 7-day TTL exceeded without action | No (terminal) | `markExpiredOnRead()` by system |

---

## Transitions

| # | From | To | Trigger | Actor | Preconditions | Side Effects |
|---|------|----|---------|-------|---------------|-------------|
| T1 | (none) | PENDING | `createRequest()` | Sender | Valid inputs, sender ≠ recipient | Set `expiresAt = now + 7d`, generate `shareableToken` |
| T2 | PENDING | PAID | `payRequest()` | Recipient | `recipientId === userId`, `status === PENDING`, `expiresAt > now` | Set `paidAt`, `revalidatePath('/dashboard')` |
| T3 | PENDING | DECLINED | `declineRequest()` | Recipient | `recipientId === userId`, `status === PENDING` | Set `declinedAt`, `revalidatePath('/dashboard')` |
| T4 | PENDING | CANCELLED | `cancelRequest()` | Sender | `senderId === userId`, `status === PENDING` | Set `cancelledAt`, `revalidatePath('/dashboard')` |
| T5 | PENDING | EXPIRED | `markExpiredOnRead()` | System | `status === PENDING`, `expiresAt < now` | Persisted on next DB read |

---

## Invalid Transitions (Rejected)

Any transition from a **terminal state** is rejected. The system returns an appropriate error message.

| Attempted From | Attempted To | Error Code | Error Message |
|----------------|-------------|------------|---------------|
| PAID | Any | `already_paid` | "This request has already been paid." |
| DECLINED | Any | `already_declined` | "This request has already been declined." |
| CANCELLED | Any | `already_cancelled` | "This request was cancelled by the sender." |
| EXPIRED | PAID | `expired` | "This request has expired and can no longer be paid." |
| EXPIRED | DECLINED | `expired` | "This request has expired." |
| EXPIRED | CANCELLED | `expired` | "This request has expired." |
| PENDING (expired) | PAID | `expired` | "This request has expired and can no longer be paid." |

---

## Guard Functions

Guards are composable functions that validate preconditions. Each returns early with an error or passes through.

```
requireAuth()          → Verifies user is authenticated
                         Error: redirect to /sign-in

requirePending(req)    → Verifies request.status === PENDING
                         Error: { error: 'already_{status}' }

requireNotExpired(req) → Verifies request.expiresAt > now
                         Error: { error: 'expired' }

requireRecipient(req, userId)  → Verifies request.recipientId === userId
                                  Error: { error: 'unauthorized' }

requireSender(req, userId)     → Verifies request.senderId === userId
                                  Error: { error: 'unauthorized' }
```

### Guard Composition per Action

| Action | Guards (in order) |
|--------|-------------------|
| `payRequest` | `requireAuth` → `requireRecipient` → `requirePending` → `requireNotExpired` |
| `declineRequest` | `requireAuth` → `requireRecipient` → `requirePending` |
| `cancelRequest` | `requireAuth` → `requireSender` → `requirePending` |

---

## Concurrency Matrix

What happens when two actions target the same PENDING request simultaneously?

| Action A | Action B | Winner | Loser Gets |
|----------|----------|--------|------------|
| Pay | Pay | First to commit | `{ error: 'already_paid' }` |
| Pay | Decline | First to commit | Error reflecting winner's state |
| Pay | Cancel | First to commit | Error reflecting winner's state |
| Pay | Expire | Pay wins (if before expiry) | Expire is no-op |
| Decline | Cancel | First to commit | Error reflecting winner's state |
| Decline | Expire | Decline wins | Expire is no-op |
| Cancel | Expire | Cancel wins | Expire is no-op |

All concurrent conflicts are resolved by PostgreSQL's **Serializable Snapshot Isolation** (see ADR-010). Exactly one transaction succeeds; others receive serialization failure and return structured errors to the client.

---

## Timestamps per State

| State | `createdAt` | `expiresAt` | `paidAt` | `declinedAt` | `cancelledAt` |
|-------|-------------|-------------|----------|-------------|---------------|
| PENDING | ✓ Set | ✓ Set (+7d) | null | null | null |
| PAID | ✓ Set | ✓ Set | ✓ Set | null | null |
| DECLINED | ✓ Set | ✓ Set | null | ✓ Set | null |
| CANCELLED | ✓ Set | ✓ Set | null | null | ✓ Set |
| EXPIRED | ✓ Set | ✓ Set (past) | null | null | null |

---

## Enum Definition (Prisma)

```prisma
enum RequestStatus {
  PENDING
  PAID
  DECLINED
  CANCELLED
  EXPIRED
}
```

---

## Visual: Allowed vs Blocked Transitions

```
         PENDING ──────► PAID       ✓
         PENDING ──────► DECLINED   ✓
         PENDING ──────► CANCELLED  ✓
         PENDING ──────► EXPIRED    ✓ (auto, on-read)

         PAID ────────► *          ✗ BLOCKED
         DECLINED ────► *          ✗ BLOCKED
         CANCELLED ───► *          ✗ BLOCKED
         EXPIRED ─────► *          ✗ BLOCKED

         PENDING (expired) ► PAID  ✗ BLOCKED (expiresAt < now)
```
