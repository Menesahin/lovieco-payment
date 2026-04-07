# Data Flow Diagrams

> All data flows for LovePay P2P Payment Request Application
> Last updated: 2026-04-07

---

## 1. Authentication Flow (Magic Link)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────┐     ┌──────────┐
│  User    │     │  Sign-In     │     │  NextAuth    │     │ Resend │     │  User's  │
│ (Browser)│     │  Page        │     │  Server      │     │ (Email)│     │  Inbox   │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └───┬────┘     └────┬─────┘
     │                  │                     │                 │               │
     │  1. Navigate     │                     │                 │               │
     │  to /sign-in     │                     │                 │               │
     │─────────────────►│                     │                 │               │
     │                  │                     │                 │               │
     │  2. Enter email  │                     │                 │               │
     │  Submit form     │                     │                 │               │
     │─────────────────►│                     │                 │               │
     │                  │  3. POST            │                 │               │
     │                  │  /api/auth/signin   │                 │               │
     │                  │  {email}            │                 │               │
     │                  │────────────────────►│                 │               │
     │                  │                     │                 │               │
     │                  │                     │  4. Generate    │               │
     │                  │                     │  magic link     │               │
     │                  │                     │  token          │               │
     │                  │                     │                 │               │
     │                  │                     │  5. Store token │               │
     │                  │                     │  in DB          │               │
     │                  │                     │ (VerifyToken)   │               │
     │                  │                     │                 │               │
     │                  │                     │  6. Send email  │               │
     │                  │                     │────────────────►│               │
     │                  │                     │                 │  7. Deliver   │
     │                  │                     │                 │──────────────►│
     │                  │                     │                 │               │
     │                  │  8. Redirect to     │                 │               │
     │  9. Show         │  /verify-request    │                 │               │
     │  "Check email"   │◄────────────────────│                 │               │
     │◄─────────────────│                     │                 │               │
     │                  │                     │                 │               │
     │  10. User clicks magic link in email   │                 │               │
     │───────────────────────────────────────►│                 │               │
     │                  │                     │                 │               │
     │                  │                     │  11. Verify     │               │
     │                  │                     │  token in DB    │               │
     │                  │                     │                 │               │
     │                  │                     │  12. Create/    │               │
     │                  │                     │  find User      │               │
     │                  │                     │                 │               │
     │                  │                     │  13. Create     │               │
     │                  │                     │  Session        │               │
     │                  │                     │                 │               │
     │                  │                     │  14. ORPHAN     │               │
     │                  │                     │  CLAIM:         │               │
     │                  │                     │  UPDATE requests │               │
     │                  │                     │  SET recipientId │               │
     │                  │                     │  WHERE email     │               │
     │                  │                     │  AND recip=NULL  │               │
     │                  │                     │                 │               │
     │  15. Set session │                     │                 │               │
     │  cookie +        │                     │                 │               │
     │  redirect to     │                     │                 │               │
     │  /dashboard      │                     │                 │               │
     │◄──────────────────────────────────────│                 │               │
     │                  │                     │                 │               │
```

---

## 2. Create Payment Request Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  User    │     │  Create Form │     │  Server      │     │  Repository  │     │PostgreSQL│
│ (Browser)│     │  (Client)    │     │  Action      │     │  Layer       │     │          │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                     │                    │                   │
     │  1. Fill form    │                     │                    │                   │
     │  - email         │                     │                    │                   │
     │  - amount        │                     │                    │                   │
     │  - note          │                     │                    │                   │
     │─────────────────►│                     │                    │                   │
     │                  │                     │                    │                   │
     │                  │  2. Client-side     │                    │                   │
     │                  │  Zod validation     │                    │                   │
     │                  │  ┌───────────┐      │                    │                   │
     │                  │  │ email ok? │      │                    │                   │
     │                  │  │ amount ok?│      │                    │                   │
     │                  │  │ note ok?  │      │                    │                   │
     │                  │  └───────────┘      │                    │                   │
     │                  │                     │                    │                   │
     │  ✗ Validation    │                     │                    │                   │
     │  error shown     │  [If invalid:       │                    │                   │
     │  inline          │   show inline       │                    │                   │
     │◄─────────────────│   errors, STOP]     │                    │                   │
     │                  │                     │                    │                   │
     │                  │  3. Submit form     │                    │                   │
     │                  │  (useActionState)   │                    │                   │
     │                  │────────────────────►│                    │                   │
     │                  │                     │                    │                   │
     │                  │                     │  4. requireAuth()  │                   │
     │                  │                     │  → get user.id     │                   │
     │                  │                     │                    │                   │
     │                  │                     │  5. Server-side    │                   │
     │                  │                     │  Zod validation    │                   │
     │                  │                     │  (double check)    │                   │
     │                  │                     │                    │                   │
     │                  │                     │  6. Guard:         │                   │
     │                  │                     │  sender ≠ recipient│                   │
     │                  │                     │                    │                   │
     │                  │                     │  7. toCents(amount)│                   │
     │                  │                     │  $25.00 → 2500    │                   │
     │                  │                     │                    │                   │
     │                  │                     │  8. Find recipient │                   │
     │                  │                     │────────────────────►                   │
     │                  │                     │                    │  SELECT user      │
     │                  │                     │                    │  WHERE email=X    │
     │                  │                     │                    │──────────────────►│
     │                  │                     │                    │                   │
     │                  │                     │                    │  user | null      │
     │                  │                     │◄───────────────────│◄──────────────────│
     │                  │                     │                    │                   │
     │                  │                     │  9. Create request │                   │
     │                  │                     │────────────────────►                   │
     │                  │                     │                    │  INSERT INTO      │
     │                  │                     │                    │  payment_requests │
     │                  │                     │                    │  (amountCents,    │
     │                  │                     │                    │   status=PENDING, │
     │                  │                     │                    │   senderId,       │
     │                  │                     │                    │   recipientId?,   │
     │                  │                     │                    │   recipientEmail, │
     │                  │                     │                    │   expiresAt,      │
     │                  │                     │                    │   shareableToken) │
     │                  │                     │                    │──────────────────►│
     │                  │                     │                    │                   │
     │                  │                     │                    │  ✓ request created│
     │                  │                     │◄───────────────────│◄──────────────────│
     │                  │                     │                    │                   │
     │                  │                     │  10. revalidatePath│                   │
     │                  │                     │  ('/dashboard')    │                   │
     │                  │                     │                    │                   │
     │                  │                     │  11. redirect      │                   │
     │  12. Navigate    │                     │  ('/requests/{id}')│                   │
     │  to detail page  │◄────────────────────│                    │                   │
     │                  │                     │                    │                   │
     │  13. Toast:      │                     │                    │                   │
     │  "Request sent!" │                     │                    │                   │
     │                  │                     │                    │                   │
```

---

## 3. Pay Request Flow (with Concurrency Control)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│Recipient │     │  Detail Page │     │  Server      │     │  Transaction │     │PostgreSQL│
│ (Browser)│     │  (Client)    │     │  Action      │     │ (Serializable│     │          │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                     │                    │                   │
     │  1. Click        │                     │                    │                   │
     │  "Pay $25.00"    │                     │                    │                   │
     │─────────────────►│                     │                    │                   │
     │                  │                     │                    │                   │
     │  2. Confirmation │                     │                    │                   │
     │  dialog appears  │                     │                    │                   │
     │◄─────────────────│                     │                    │                   │
     │                  │                     │                    │                   │
     │  3. Click        │                     │                    │                   │
     │  "Confirm"       │                     │                    │                   │
     │─────────────────►│                     │                    │                   │
     │                  │                     │                    │                   │
     │  4. Button       │  5. payRequest(id)  │                    │                   │
     │  disabled +      │  (useTransition)    │                    │                   │
     │  spinner shown   │────────────────────►│                    │                   │
     │◄─────────────────│                     │                    │                   │
     │                  │                     │  6. requireAuth()  │                   │
     │                  │                     │                    │                   │
     │                  │                     │  7. BEGIN          │                   │
     │                  │                     │  TRANSACTION       │                   │
     │                  │                     │  (Serializable)    │                   │
     │                  │                     │────────────────────►                   │
     │                  │                     │                    │  BEGIN             │
     │                  │                     │                    │  SERIALIZABLE     │
     │                  │                     │                    │──────────────────►│
     │                  │                     │                    │                   │
     │                  │                     │                    │  8. SELECT        │
     │                  │                     │                    │  request          │
     │                  │                     │                    │  WHERE id=X       │
     │                  │                     │                    │──────────────────►│
     │                  │                     │                    │                   │
     │                  │                     │  9. Guards:        │  request data     │
     │                  │                     │  ┌──────────────┐  │◄──────────────────│
     │                  │                     │  │ exists?      │  │                   │
     │                  │                     │  │ is recipient?│  │                   │
     │                  │                     │  │ is PENDING?  │  │                   │
     │                  │                     │  │ not expired? │  │                   │
     │                  │                     │  └──────────────┘  │                   │
     │                  │                     │                    │                   │
     │                  │                     │  10. Simulate      │                   │
     │                  │                     │  payment           │                   │
     │                  │                     │  (sleep 2.5s)      │                   │
     │                  │                     │                    │                   │
     │                  │                     │  11. UPDATE        │                   │
     │                  │                     │────────────────────►                   │
     │                  │                     │                    │  UPDATE            │
     │                  │                     │                    │  SET status=PAID   │
     │                  │                     │                    │  paidAt=NOW()      │
     │                  │                     │                    │──────────────────►│
     │                  │                     │                    │                   │
     │                  │                     │                    │  COMMIT            │
     │                  │                     │                    │──────────────────►│
     │                  │                     │                    │                   │
     │                  │                     │  12. revalidate    │  ✓                │
     │                  │                     │◄───────────────────│◄──────────────────│
     │                  │                     │                    │                   │
     │                  │  13. { success }    │                    │                   │
     │  14. Success     │◄────────────────────│                    │                   │
     │  screen:         │                     │                    │                   │
     │  ✓ "Payment      │                     │                    │                   │
     │  Successful!"    │                     │                    │                   │
     │◄─────────────────│                     │                    │                   │
     │                  │                     │                    │                   │


CONCURRENT SCENARIO (Race Condition Handling):
─────────────────────────────────────────────

     T1 (User A - Pay)                    T2 (User B - Cancel)
     │                                     │
     │  BEGIN SERIALIZABLE                 │  BEGIN SERIALIZABLE
     │  SELECT request (PENDING) ──────►   │  SELECT request (PENDING) ──────►
     │  sleep 2.5s...                      │  UPDATE status=CANCELLED
     │  UPDATE status=PAID                 │  COMMIT attempt...
     │  COMMIT ✓                           │  ✗ SERIALIZATION FAILURE
     │                                     │  (Row modified by T1)
     │                                     │  Return: { error: 'already_paid' }
```

---

## 4. Decline Request Flow

```
Recipient clicks "Decline"
  │
  ▼
Confirmation Dialog: "Decline this request?"
  │
  ├── Cancel → Close dialog, no action
  │
  └── "Yes, Decline"
        │
        ▼
      Server Action: declineRequest(id)
        │
        ├── requireAuth() → get user
        ├── $transaction (Serializable):
        │     ├── SELECT request
        │     ├── Guard: exists? ✓
        │     ├── Guard: user is recipient? ✓
        │     ├── Guard: status is PENDING? ✓
        │     ├── UPDATE status=DECLINED, declinedAt=NOW()
        │     └── COMMIT
        ├── revalidatePath('/dashboard')
        └── return { success: true }
              │
              ▼
            Toast: "Request declined"
            Redirect to /dashboard
```

---

## 5. Cancel Request Flow

```
Sender clicks "Cancel Request"
  │
  ▼
Confirmation Dialog: "Cancel this payment request? This cannot be undone."
  │
  ├── "Go Back" → Close dialog, no action
  │
  └── "Yes, Cancel"
        │
        ▼
      Server Action: cancelRequest(id)
        │
        ├── requireAuth() → get user
        ├── $transaction (Serializable):
        │     ├── SELECT request
        │     ├── Guard: exists? ✓
        │     ├── Guard: user is sender? ✓
        │     ├── Guard: status is PENDING? ✓
        │     ├── UPDATE status=CANCELLED, cancelledAt=NOW()
        │     └── COMMIT
        ├── revalidatePath('/dashboard')
        └── return { success: true }
              │
              ▼
            Toast: "Request cancelled"
            Redirect to /dashboard
```

---

## 6. Expiration Check-on-Read Flow

```
User loads Dashboard or Detail Page
  │
  ▼
Server Component fetches data
  │
  ▼
Repository.getIncomingRequests(userId)
  │
  ▼
Prisma query returns results
  │
  ▼
markExpiredOnRead(requests)
  │
  ├── For each request:
  │     │
  │     ├── status === PENDING && expiresAt < NOW()?
  │     │     │
  │     │     ├── YES → Collect into expiredIds[]
  │     │     │
  │     │     └── NO → Skip
  │     │
  │
  ├── expiredIds.length > 0?
  │     │
  │     ├── YES → UPDATE payment_requests
  │     │         SET status = EXPIRED
  │     │         WHERE id IN (expiredIds)
  │     │         AND status = PENDING  (idempotent guard)
  │     │
  │     └── NO → No DB write needed
  │
  ▼
Return requests with corrected statuses
  │
  ▼
UI renders EXPIRED badge + disabled Pay button

────────────────────────────────────────────

CLIENT-SIDE EXPIRATION (CountdownTimer component):

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = expiresAt - Date.now()
      if (remaining <= 0) {
        setExpired(true)        // Disable Pay button
        clearInterval(interval) // Stop counting
      } else {
        setTimeLeft(remaining)  // Update countdown display
      }
    }, 60_000) // Every 60 seconds

    return () => clearInterval(interval)
  }, [expiresAt])
```

---

## 7. Shareable Link Resolution Flow

```
User opens /r/{token}
  │
  ▼
Server Component: fetch request by shareableToken
  │
  ├── Not found → 404 page
  │
  └── Found → Check user auth status
        │
        ├── NOT authenticated
        │     │
        │     ▼
        │   Show read-only view:
        │   - Amount, note, sender name
        │   - "Sign in to pay" CTA
        │   - CTA links to /sign-in?callbackUrl=/r/{token}
        │
        └── Authenticated → Check relationship
              │
              ├── User is recipient (recipientId matches)
              │     │
              │     ▼
              │   Full detail view with Pay/Decline actions
              │
              ├── User email matches recipientEmail (but recipientId is null)
              │     │
              │     ▼
              │   Link request to user (set recipientId)
              │   Then show full detail view with actions
              │
              ├── User is sender (senderId matches)
              │     │
              │     ▼
              │   Outgoing detail view (Cancel, Share Link)
              │
              └── User is neither sender nor recipient
                    │
                    ▼
                  Read-only view:
                  - Amount, note, sender name
                  - "This request was sent to someone else"
```
