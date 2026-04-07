# ADR-004: Handling Unregistered Recipients via Orphan Claim

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

When a user creates a payment request, the recipient is identified by email. The recipient may or may not have a LovePay account. We need a strategy that allows:
1. Creating requests for any email address (registered or not)
2. Recipients without accounts to eventually see and act on requests
3. Smooth onboarding — the recipient's first sign-in should "just work"

## Decision

We use a **nullable `recipientId` with orphan claim on sign-in** pattern:

### Database Schema
```prisma
model PaymentRequest {
  recipientId    String?   // NULL if recipient has no account yet
  recipientEmail String    // ALWAYS stored, regardless of account existence
  recipient      User?     @relation(...)
}
```

### Request Creation Logic
```
1. Sender creates request with recipientEmail = "bob@example.com"
2. Look up: does a User with email "bob@example.com" exist?
   - YES → set recipientId = user.id
   - NO  → set recipientId = null
3. recipientEmail is ALWAYS set regardless
```

### Orphan Claim on Sign-In (NextAuth event)
```typescript
events: {
  async signIn({ user }) {
    if (user.id && user.email) {
      await prisma.paymentRequest.updateMany({
        where: {
          recipientEmail: user.email,
          recipientId: null,
        },
        data: {
          recipientId: user.id,
        },
      })
    }
  },
}
```

### Dashboard Queries
```
// Incoming requests: match by recipientId (after claim) OR recipientEmail (fallback)
WHERE recipientId = currentUserId
```

After sign-in, `recipientId` is set, so the standard query works. The orphan claim is the bridge.

## Consequences

### Positive
- **Frictionless**: Sender can request money from anyone with an email — no "user not found" blocker
- **Automatic linking**: Recipient creates account → all pending requests appear in their dashboard automatically
- **No invitation system**: No need for invite emails, pending invitations table, or invitation acceptance flow
- **Shareable link works**: Recipient can open `/r/{token}`, sign up, and immediately see their request with actions

### Negative
- **Nullable foreign key**: `recipientId` is optional, which means some queries need to handle the null case
- **Orphan requests in DB**: Until recipient signs up, requests have `recipientId = null`. This is correct but may look incomplete in direct DB inspection.
- **Email change edge case**: If a recipient changes their email address before signing up, orphan claim won't match. Mitigated: email changes are out of scope for v1.

### Safeguards
- `recipientEmail` column is indexed for fast orphan claim query
- `updateMany` with `WHERE recipientId IS NULL` is idempotent — safe to run multiple times
- Orphan claim runs on every sign-in (not just first), catching any requests created between sessions

## Alternatives Considered

### Require Registered Recipients Only
- **Pros**: Clean data model (recipientId always set), simpler queries
- **Cons**: Terrible UX — sender must know if recipient has an account. "User not found" error for new users.
- **Why rejected**: Fundamentally breaks the P2P request use case. Venmo/Cash App allow requests to any contact.

### Invitation System
- **Pros**: Explicit "invite to join" flow, clear audit trail
- **Cons**: Adds complexity (invitation table, email templates, acceptance flow, expiry). Significant development time for a v1 feature.
- **Why rejected**: Over-engineered. The orphan claim pattern achieves the same outcome with zero additional models or UI flows.

### Store Requests in a Separate "Pending Invitations" Table
- **Pros**: Clean separation between registered and unregistered requests
- **Cons**: Duplicated schema, migration needed when invitation is accepted, double the queries on dashboard
- **Why rejected**: Adds schema duplication and data migration complexity for no user-facing benefit.
