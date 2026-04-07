# ADR-007: E2E Auth Test Bypass and Video Recording Strategy

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

LovePay uses magic link authentication (email-based, passwordless). This creates two challenges for E2E testing:

1. **Auth bypass**: Magic links require email delivery and link clicking — impossible to automate reliably in Playwright
2. **Screen recording**: The assignment requires "automated screen recording of E2E tests running" — Playwright supports this natively but needs configuration

## Decision

### Auth Bypass: Conditional CredentialsProvider

In **test environment only** (`NODE_ENV=test`), we add a CredentialsProvider to NextAuth that accepts an email directly — no magic link needed.

```typescript
// src/auth.ts
providers: [
  Resend({ from: "LovePay <noreply@lovepay.com>" }),
  
  // Test-only: bypass magic link for E2E tests
  ...(process.env.NODE_ENV === 'test' ? [
    Credentials({
      id: 'test-credentials',
      credentials: { email: { type: 'email' } },
      async authorize(credentials) {
        const email = credentials.email as string
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          user = await prisma.user.create({ data: { email, name: email.split('@')[0] } })
        }
        return user
      },
    }),
  ] : []),
],
```

**Test helper:**
```typescript
// e2e/helpers/auth.ts
export async function loginAs(page: Page, email: string) {
  await page.goto('/api/auth/callback/test-credentials?email=' + encodeURIComponent(email))
  await page.waitForURL('/dashboard')
}
```

### Video Recording: Playwright Config

```typescript
// playwright.config.ts
use: {
  video: 'on',              // Record ALL tests (not just failures)
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
}
```

Videos are saved to `test-results/` directory, automatically generated for every test run. These serve as the assignment's required "automated screen recording."

## Consequences

### Positive — Auth Bypass
- **Deterministic**: Tests don't depend on email delivery, DNS, or external services
- **Fast**: No waiting for emails — login is a single HTTP redirect
- **Isolated**: Test-only provider, zero production risk — `NODE_ENV=test` guard
- **Creates users on-the-fly**: No need to pre-seed auth records — test helper creates users as needed
- **Same session mechanism**: Uses real NextAuth sessions (not mocked), so middleware, session checks, and auth helpers work identically to production

### Positive — Video Recording
- **Zero extra setup**: Playwright's built-in recorder handles everything
- **Every test recorded**: `video: 'on'` captures all tests, providing comprehensive evidence
- **Assignment requirement met**: Videos in `test-results/` directly satisfy "automated screen recording"
- **Debugging aid**: Failed test videos help diagnose flaky tests

### Negative
- **Test-only code in production file**: `auth.ts` contains a conditional block for tests. Mitigated: clearly commented, guarded by `NODE_ENV`, and the Credentials provider is never registered in production.
- **Not testing real auth flow**: Magic link flow itself is untested in E2E. Mitigated: magic link is handled entirely by NextAuth + Resend — both well-tested libraries. We trust the integration.
- **Video file size**: Recording all tests generates ~50-200MB of video. Acceptable for the submission. `.gitignore` excludes `test-results/` from the repo — videos are generated on-demand by running the test suite.

### Safeguards
- `NODE_ENV === 'test'` check is strict — production never registers the Credentials provider
- Test helper `loginAs()` is in `e2e/helpers/`, not importable by application code
- Video files excluded from git via `.gitignore`

## Alternatives Considered

### Mock Email Inbox (Mailosaur / Ethereal)
- **Pros**: Tests the actual magic link flow end-to-end
- **Cons**: External service dependency, flaky (email delivery timing), adds test setup complexity, costs money (Mailosaur)
- **Why rejected**: Too fragile for CI. Email delivery can take 1-30 seconds — tests become slow and unreliable.

### Direct Cookie/Token Injection
- **Pros**: Fast, no provider needed
- **Cons**: Bypasses NextAuth entirely — session isn't properly created in DB. Middleware and auth checks may behave differently. Fragile if cookie format changes.
- **Why rejected**: Doesn't create a real session, which means auth middleware and `auth()` calls may not work correctly.

### Disable Auth in Test Environment
- **Pros**: Simplest — no auth code at all in tests
- **Cons**: Doesn't test protected route behavior, session handling, or user-specific data. Fundamentally different from production.
- **Why rejected**: We need to test that dashboards show the correct user's data, that auth guards work, and that actions are tied to the right user.

### Separate Test Auth Endpoint
- **Pros**: Cleaner separation (no production file modification)
- **Cons**: Requires a custom API route that creates sessions manually. More code to maintain. Still test-only.
- **Why rejected**: The conditional CredentialsProvider achieves the same with less code and uses NextAuth's built-in session management.
