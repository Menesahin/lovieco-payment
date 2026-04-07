# ADR-005: Shareable Token Separate from Internal ID

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

Payment requests need a **shareable link** that allows anyone (including unauthenticated users) to view request details. The task requirement states: "Creates a payment request with unique ID and shareable link."

We need to decide what identifier to use in the public URL. Using the internal database ID directly has security implications.

## Decision

We use a **separate `shareableToken`** (CUID) for public URLs, distinct from the internal `id` (also CUID).

### Schema
```prisma
model PaymentRequest {
  id             String  @id @default(cuid())          // Internal, never in URLs
  shareableToken String  @unique @default(cuid())      // Public, used in /r/{token}
}
```

### URL Patterns
- **Authenticated detail**: `/requests/{id}` — internal ID, requires auth + ownership
- **Public shareable**: `/r/{shareableToken}` — public token, accessible by anyone

### Why Two Identifiers
- The `id` is used in server-side queries, relations, and authenticated routes
- The `shareableToken` is the only identifier exposed in public URLs
- Even though both are CUIDs (non-sequential), separating them adds defense-in-depth

## Consequences

### Positive
- **No ID enumeration**: Knowing a valid `shareableToken` doesn't reveal the internal `id`, preventing access to authenticated endpoints
- **Revocable**: If a shareable link is compromised, the `shareableToken` could be rotated without changing the internal `id` or breaking relations (future enhancement)
- **SEO-safe**: Public URLs use a token that has no relation to business data
- **Defense-in-depth**: Even if one identifier leaks, the other remains protected

### Negative
- **Two identifiers per record**: Slightly more complex data model
- **Index overhead**: Additional unique index on `shareableToken` — negligible for our scale
- **Developer confusion**: Must remember which identifier to use where — mitigated by clear naming

### Safeguards
- `shareableToken` has a `@unique` constraint — no duplicates
- Indexed for fast lookup: `@@index([shareableToken])`
- Authenticated routes always use `id` and verify ownership
- Public routes always use `shareableToken` and apply appropriate access rules

## Alternatives Considered

### Use Internal ID in Public URLs
- **Pros**: Simpler — one identifier for everything
- **Cons**: Exposes internal ID. Even with CUIDs (non-sequential), reduces defense-in-depth. An attacker who obtains a valid ID could attempt authenticated endpoints.
- **Why rejected**: Security best practice is to avoid exposing internal identifiers in public URLs.

### UUID v4 as Both ID and Token
- **Pros**: UUIDs are random and unguessable
- **Cons**: Same issue as above — the public URL reveals the internal ID. Also, UUIDs are longer in URLs.
- **Why rejected**: Still conflates internal and public identifiers.

### Signed URLs (HMAC)
- **Pros**: Tamper-proof, can include expiration in the URL itself
- **Cons**: More complex to generate and verify. URL becomes very long. Cannot be stored as a simple column.
- **Why rejected**: Over-engineered for our needs. The token lookup approach is simpler and sufficient.

### Short Slugs (e.g., "abc123")
- **Pros**: Short, user-friendly URLs
- **Cons**: Higher collision probability, requires custom generation logic, potential for brute-force enumeration
- **Why rejected**: Security risk outweighs cosmetic benefit. CUIDs are long enough to be unguessable.
