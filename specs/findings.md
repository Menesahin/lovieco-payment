# QA Findings

> Observations, bugs discovered, and edge cases found during implementation
> Last updated: 2026-04-07

---

## Prisma 7 + Turbopack Compatibility

**Finding:** Prisma 7 `prisma-client` generator (ESM) uses `node:module` which Turbopack cannot bundle in client components. Even when Server Actions are passed as props, Turbopack traces the dependency tree.

**Resolution:**
- Use `prisma-client-js` generator (CJS output)
- Add `@prisma/client`, `@prisma/adapter-pg`, `pg` to `serverExternalPackages`
- PrismaPg adapter required in PrismaClient constructor (Prisma 7 removed Rust engine)
- Split `expiration.ts` into client-safe + server-only files

**ADR Impact:** Added NX-11, NX-12, DB-07, DB-08 to anti-pattern table.

---

## Server Action Import Pattern (NX-11)

**Finding:** Client Components cannot directly import Server Action files that have Prisma dependencies. Turbopack attempts to bundle the entire dependency tree including `node:module`.

**Resolution:** Pass server actions as props from Server Components (page.tsx) to Client Components. This is now a BLOCKER-level anti-pattern (NX-11).

---

## Transaction Sleep Placement (DB-02)

**Finding:** Original `payRequest()` had `sleep(2500)` inside Serializable transaction, holding locks for 2.5s.

**Resolution:** Moved sleep OUTSIDE transaction. Transaction now takes ~50ms instead of 2500ms. Lock contention eliminated.

---

## Hydration Mismatch in CountdownTimer

**Finding:** `Date.now()` differs between server and client render, causing React hydration mismatch warnings.

**Resolution:** Initialize state as `null`, compute values in `useEffect` only (client-side). Show skeleton placeholder during first render.

---

## NextAuth Redirect Behavior

**Finding:** `signIn("resend", formData)` throws internally to redirect. Calling `redirect()` after it never executes.

**Resolution:** Use `signIn("resend", { email, redirect: false })` then manual `redirect()`. For dev mode, custom `sendVerificationRequest` stores full callback URL in DB for display.

---

## Magic Link Token Hashing

**Finding:** NextAuth hashes verification tokens before storing in DB. Reading hashed token from DB and putting it in callback URL doesn't work — callback expects raw token.

**Resolution:** In dev mode `sendVerificationRequest` override, the `url` parameter contains the full callback URL with raw token. Store this URL (not the hashed DB token) for display.

---

## Shareable Link Security

**Finding:** Original spec showed payment details to unauthenticated users on shareable link page. This exposes financial information.

**Resolution:** Changed to auth-required: unauthenticated → friendly sign-in prompt (no details), unauthorized → "Access Restricted", authorized → redirect to detail page.
