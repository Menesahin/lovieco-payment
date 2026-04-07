# Project Roadmap

> LovePay P2P Payment Request Application
> Last updated: 2026-04-07

---

## Milestones

| # | Milestone | Phase | Depends On | Deliverable |
|---|-----------|-------|-----------|-------------|
| M0 | **Specs Complete** | Phase 0 | — | All spec docs in `specs/` |
| M1 | **Auth Working** | Phase 1 | M0 | Magic link sign-in, session, protected routes |
| M2 | **Core Flow Complete** | Phase 4 | M1 | Create request → see detail with shareable link |
| M3 | **Dashboard Live** | Phase 5 | M2 | Incoming/outgoing tabs, filter, search, pagination |
| M4 | **Actions Working** | Phase 6 | M3 | Pay (with simulation), Decline, Cancel — all actions functional |
| M5 | **Feature Complete** | Phase 8 | M4 | Shareable link, landing page, polish, responsive |
| M6 | **Deployed** | Phase 9 | M5 | Docker → VPS, publicly accessible URL |
| M7 | **Tests Passing** | Phase 10 | M5 | All E2E tests green, video recordings generated |
| M8 | **Submission Ready** | Phase 11 | M6, M7 | README, spec-kit artifacts, live demo verified |

---

## Phase Dependency Graph

```
    Phase 0 ─────► Phase 1 ───┬──► Phase 2 (UI Shell) ─────┐
    (Specs +       (DB +      │                              │
     Bootstrap)    Auth)      └──► Phase 3 (Actions) ───────┤
                                                              │
                                       ◄──────────────────────┘
                                       │
                                Phase 4 (Create Flow)
                                       │
                                Phase 5 (Dashboard)
                                       │
                                Phase 6 (Detail + Actions)
                                       │
                                Phase 7 (Shareable Link)
                                       │
                                Phase 8 (Polish)
                                      / \
                          Phase 9     Phase 10
                          (Docker)    (E2E Tests)
                                      \ /
                                Phase 11 (Docs)
```

**Parallelizable pairs:**
- Phase 2 + Phase 3 (UI Shell + Server Actions)
- Phase 9 + Phase 10 (Docker + E2E Tests)

---

## Phase Details

### Phase 0: Spec-Driven Foundation + Bootstrap
**Goal**: All documentation complete, project scaffolded, ready to code

| Task | Priority |
|------|----------|
| Git init + .gitignore | Critical |
| Create `specs/` directory structure | Critical |
| Write all spec documents (constitution, spec, ADRs, architecture, UX, roadmap, tasks) | Critical |
| `create-next-app` with TypeScript, Tailwind, ESLint, App Router | Critical |
| Install dependencies (prisma, next-auth, zod, resend, pino, shadcn) | Critical |
| Init Prisma, configure next.config.ts | Critical |
| Spec-Kit init | Important |

**Exit criteria**: All `specs/` files exist, `pnpm dev` runs without errors

---

### Phase 1: Database + Auth
**Goal**: User can sign in via magic link, sessions work, routes are protected

| Task | Priority |
|------|----------|
| Write Prisma schema (User, PaymentRequest, NextAuth models) | Critical |
| Run `prisma migrate dev --name init` | Critical |
| Create Prisma client singleton (`src/lib/db.ts`) | Critical |
| Configure NextAuth v5 with Resend + PrismaAdapter | Critical |
| Create API route handler (`api/auth/[...nextauth]`) | Critical |
| Create proxy.ts for route protection (Next.js 16 replaces middleware.ts) | Critical |
| Create auth pages (sign-in, verify-request, error) | Critical |
| Add orphan claim in signIn event | Important |
| Add test CredentialsProvider (NODE_ENV=test) | Important |
| Create `requireAuth()` helper | Critical |

**Exit criteria**: Can sign in with email, session persists, /dashboard requires auth

---

### Phase 2: UI Shell (parallel with Phase 3)
**Goal**: App layout, navigation, and shared components ready

| Task | Priority |
|------|----------|
| Install shadcn components | Critical |
| Root layout (providers, fonts, Toaster) | Critical |
| Auth layout (centered card) | Critical |
| App layout (sidebar + topbar) | Critical |
| Sidebar navigation component | Critical |
| Top bar with user menu | Important |
| Mobile bottom navigation | Important |
| Shared: currency-display, loading-spinner | Important |

**Exit criteria**: Authenticated user sees layout with navigation, responsive on mobile

---

### Phase 3: Server Actions + Queries (parallel with Phase 2)
**Goal**: All business logic implemented and testable

| Task | Priority |
|------|----------|
| Zod validation schemas | Critical |
| `createRequest` server action | Critical |
| `payRequest` server action (with Serializable transaction) | Critical |
| `declineRequest` server action | Critical |
| `cancelRequest` server action | Critical |
| Repository: getIncomingRequests (with filter, search, pagination) | Critical |
| Repository: getOutgoingRequests | Critical |
| Repository: getRequestById, getRequestByToken | Critical |
| Repository: getDashboardStats | Important |
| Utility: formatCents, toCents | Critical |
| Utility: isExpired, getTimeRemaining, markExpiredOnRead | Critical |
| Guard functions: requirePending, requireNotExpired, requireOwnership | Critical |
| Pino logger setup | Important |

**Exit criteria**: All server actions return correct results, validation works

---

### Phase 4: Request Creation Flow
**Goal**: User can create a payment request with full validation

| Task | Priority |
|------|----------|
| `/requests/new` page (Server Component shell) | Critical |
| CreateRequestForm (Client Component) | Critical |
| AmountInput with currency formatting | Critical |
| Wire form to createRequest via useActionState | Critical |
| Success redirect + toast | Critical |
| Inline validation errors | Critical |
| Self-request prevention in UI | Important |

**Exit criteria**: Can create request, see detail page, validation works

---

### Phase 5: Dashboard
**Goal**: Full dashboard with tabs, filters, search, pagination

| Task | Priority |
|------|----------|
| Dashboard page (Server Component, fetch data) | Critical |
| Dashboard tabs (Incoming/Outgoing via URL params) | Critical |
| Request table (Desktop) | Critical |
| Request cards (Mobile) | Critical |
| Status badges | Critical |
| Stats cards | Important |
| Status filter dropdown | Critical |
| Search input (debounced, 300ms) | Critical |
| Pagination (10 per page) | Important |
| Empty states (no requests, no results) | Important |
| Expired request detection (markExpiredOnRead) | Critical |

**Exit criteria**: Dashboard shows correct data per user, filter + search work

---

### Phase 6: Detail View + Actions
**Goal**: Full request detail with Pay, Decline, Cancel, countdown

| Task | Priority |
|------|----------|
| `/requests/[id]` page (Server Component) | Critical |
| Request detail card | Critical |
| Countdown timer (Client, live update) | Critical |
| Progress bar (color-coded) | Important |
| Pay button + confirmation dialog + loading sim | Critical |
| Decline button + confirmation dialog | Critical |
| Cancel button + confirmation dialog (outgoing) | Critical |
| Share link copy (outgoing, pending) | Important |
| Expired state (disabled Pay, Dismiss) | Critical |
| Terminal states (Paid, Declined, Cancelled) | Critical |

**Exit criteria**: All actions work, countdown accurate, concurrent safety

---

### Phase 7: Shareable Link
**Goal**: Public `/r/{token}` works for all scenarios

| Task | Priority |
|------|----------|
| `/r/[token]` page | Critical |
| Authenticated recipient → full actions | Critical |
| Unauthenticated → read-only + "Sign in to pay" | Critical |
| Authenticated non-involved → read-only | Important |
| Orphan claim on sign-in via callback URL | Critical |

**Exit criteria**: Shareable link works for auth + unauth users

---

### Phase 8: Polish
**Goal**: Production-ready UI, responsive, accessible

| Task | Priority |
|------|----------|
| Landing page (`/`) | Important |
| 404 not-found page | Important |
| loading.tsx skeletons | Important |
| error.tsx error boundaries | Important |
| Responsive pass (mobile viewport test) | Critical |
| Accessibility pass (keyboard nav, focus, labels) | Important |

**Exit criteria**: All pages render correctly on mobile + desktop, no broken states

---

### Phase 9: Docker + Deploy (parallel with Phase 10)
**Goal**: App running on VPS with public URL

| Task | Priority |
|------|----------|
| Dockerfile (multi-stage, standalone, non-root, healthcheck) | Critical |
| docker-compose.yml (app + db + migrate) | Critical |
| .dockerignore | Important |
| .env.example | Important |
| Local test: `docker compose up --build` | Critical |
| VPS deploy | Critical |
| Nginx config (SSL, reverse proxy) | Critical |
| Production migrate + smoke test | Critical |

**Exit criteria**: App accessible on public URL, SSL working

---

### Phase 10: E2E Tests (parallel with Phase 9)
**Goal**: All critical paths tested, videos recorded

| Task | Priority |
|------|----------|
| Playwright config (video: on, multi-device) | Critical |
| Global setup (DB cleanup) | Critical |
| Auth helper (test login bypass) | Critical |
| Seed data factories | Critical |
| auth.spec.ts | Critical |
| create-request.spec.ts | Critical |
| dashboard.spec.ts | Critical |
| pay-request.spec.ts | Critical |
| decline-request.spec.ts | Important |
| cancel-request.spec.ts | Important |
| expiration.spec.ts | Critical |
| share-link.spec.ts | Important |
| responsive.spec.ts | Important |

**Exit criteria**: All tests green, video files in test-results/

---

### Phase 11: Documentation + Submission
**Goal**: Repository ready for submission

| Task | Priority |
|------|----------|
| README.md (overview, demo URL, setup, test, stack) | Critical |
| specs/tasks.md checkboxes all checked | Important |
| specs/findings.md (QA observations) | Important |
| Verify spec-kit artifacts | Important |
| Final commit + push | Critical |
| Verify live demo works | Critical |

**Exit criteria**: Repo public, README complete, demo testable

---

## Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Resend email delivery issues | Auth blocked | Low | Test with Resend sandbox first; document fallback |
| NextAuth v5 breaking change | Auth broken | Low | Pin exact version in package.json |
| VPS deployment issues | No live demo | Medium | Test Docker locally first; have Vercel as backup |
| Playwright flaky tests | CI failures | Medium | Sequential tests, proper seed data, retry: 2 |
| Time overrun | Incomplete features | Medium | Prioritize: auth → create → dashboard → pay first |
