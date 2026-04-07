# Task Checklist

> LovePay P2P Payment Request — Implementation Tasks
> Mark each task as [x] when completed
> Last updated: 2026-04-07

---

## Phase 0: Spec-Driven Foundation + Bootstrap

- [ ] Initialize git repository with `.gitignore`
- [ ] Create `specs/` directory structure (`specs/`, `specs/adr/`, `specs/architecture/`, `specs/ux/`)
- [ ] Write `specs/constitution.md`
- [ ] Write `specs/spec.md`
- [ ] Write `specs/adr/001-tech-stack.md`
- [ ] Write `specs/adr/002-money-as-integer-cents.md`
- [ ] Write `specs/adr/003-expiration-check-on-read.md`
- [ ] Write `specs/adr/004-unregistered-recipients.md`
- [ ] Write `specs/adr/005-shareable-token-vs-id.md`
- [ ] Write `specs/adr/006-server-actions-over-api.md`
- [ ] Write `specs/adr/007-auth-test-bypass.md`
- [ ] Write `specs/adr/008-docker-deployment.md`
- [ ] Write `specs/adr/009-email-only-recipient.md`
- [ ] Write `specs/adr/010-concurrency-control.md`
- [ ] Write `specs/architecture/system-overview.md`
- [ ] Write `specs/architecture/data-flow.md`
- [ ] Write `specs/architecture/state-machine.md`
- [ ] Write `specs/ux/user-flows.md`
- [ ] Write `specs/ux/mockups.md`
- [ ] Write `specs/roadmap.md`
- [ ] Write `specs/tasks.md` (this file)
- [ ] Run `npx create-next-app@16.2 . --typescript --tailwind --app --src-dir --import-alias "@/*"` (Next.js 16 removed next lint)
- [ ] Install core deps: `pnpm add prisma @prisma/client @auth/prisma-adapter next-auth@beta zod resend pino pino-pretty`
- [ ] Install dev deps: `pnpm add -D @playwright/test`
- [ ] Init shadcn: `pnpm dlx shadcn@latest init`
- [ ] Init Prisma: `npx prisma init`
- [ ] Configure `next.config.ts`: `output: "standalone"`
- [ ] Verify `tsconfig.json`: strict mode, `@/` alias
- [ ] Create `.env` and `.env.example`
- [ ] Init Spec-Kit (if available): `specify init .`
- [ ] Commit: `docs: add spec-driven documentation`
- [ ] Commit: `chore: bootstrap Next.js project with deps`

---

## Phase 1: Database + Auth

- [ ] Write full Prisma schema (`prisma/schema.prisma`)
  - [ ] User model
  - [ ] Account model (NextAuth)
  - [ ] Session model (NextAuth)
  - [ ] VerificationToken model (NextAuth)
  - [ ] PaymentRequest model with all fields and indexes
  - [ ] RequestStatus enum
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create `src/lib/db.ts` — Prisma client singleton (globalThis pattern)
- [ ] Create `src/auth.ts` — NextAuth v5 config
  - [ ] Resend provider
  - [ ] PrismaAdapter
  - [ ] Custom pages (signIn, verifyRequest, error)
  - [ ] Session callback (include user.id)
  - [ ] signIn event: orphan claim logic
  - [ ] Conditional test CredentialsProvider (NODE_ENV=test)
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Create `src/proxy.ts` — protect /dashboard, /requests, /settings (Next.js 16 replaces middleware.ts)
- [ ] Create `src/lib/guards/require-auth.ts`
- [ ] Create `src/app/(auth)/layout.tsx` — centered card layout
- [ ] Create `src/app/(auth)/sign-in/page.tsx` — email input form
- [ ] Create `src/app/(auth)/verify-request/page.tsx` — "Check your email"
- [ ] Create `src/app/(auth)/error/page.tsx` — auth error display
- [ ] Test magic link flow end-to-end manually
- [ ] Commit: `feat: add database schema and auth system`

---

## Phase 2: UI Shell

- [ ] Install shadcn components: `button card input badge tabs table skeleton dialog select separator avatar dropdown-menu toast`
- [ ] Create `src/app/layout.tsx` — root layout (html, body, fonts, ThemeProvider, SessionProvider, Toaster)
- [ ] Create `src/app/(app)/layout.tsx` — authenticated layout (sidebar + topbar + auth guard)
- [ ] Create `src/components/layout/app-sidebar.tsx` — navigation links
- [ ] Create `src/components/layout/top-bar.tsx` — user avatar + dropdown
- [ ] Create `src/components/layout/mobile-nav.tsx` — bottom navigation for mobile
- [ ] Create `src/components/shared/currency-display.tsx` — formatCents → "$25.00"
- [ ] Create `src/components/shared/loading-spinner.tsx`
- [ ] Verify responsive layout: desktop sidebar, mobile bottom nav
- [ ] Commit: `feat: add app shell with responsive layout`

---

## Phase 3: Server Actions + Queries

- [ ] Create `src/lib/validations/payment-request.ts` — Zod schemas
  - [ ] `createRequestSchema` (recipientEmail, amount, note)
- [ ] Create `src/lib/utils/currency.ts`
  - [ ] `formatCents(cents: number): string` → "$25.00"
  - [ ] `toCents(dollars: number): number` → 2500
- [ ] Create `src/lib/utils/expiration.ts`
  - [ ] `isExpired(expiresAt: Date): boolean`
  - [ ] `getTimeRemaining(expiresAt: Date): { days, hours, minutes }`
  - [ ] `getExpirationPercentage(createdAt: Date, expiresAt: Date): number`
  - [ ] `markExpiredOnRead(requests: PaymentRequest[]): Promise<PaymentRequest[]>`
- [ ] Create `src/lib/guards/require-pending.ts`
- [ ] Create `src/lib/guards/require-not-expired.ts`
- [ ] Create `src/lib/guards/require-ownership.ts` (sender or recipient)
- [ ] Create `src/lib/repositories/payment-request.repository.ts`
  - [ ] `create(data)`
  - [ ] `findById(id)`
  - [ ] `findByShareableToken(token)`
  - [ ] `getIncoming(userId, filters)`
  - [ ] `getOutgoing(userId, filters)`
  - [ ] `getStats(userId, tab)`
  - [ ] `updateStatus(id, status, timestamps)`
- [ ] Create `src/lib/actions/payment-request.ts`
  - [ ] `createRequest(formData: FormData)`
  - [ ] `payRequest(requestId: string)`
  - [ ] `declineRequest(requestId: string)`
  - [ ] `cancelRequest(requestId: string)`
- [ ] Create `src/lib/dto/payment-request.dto.ts` — transform Prisma model → client-safe DTO
- [ ] Create `src/lib/logger.ts` — Pino instance
- [ ] Commit: `feat: add server actions, repositories, and business logic`

---

## Phase 4: Request Creation Flow

- [ ] Create `src/app/(app)/requests/new/page.tsx` — Server Component shell
- [ ] Create `src/components/requests/create-request-form.tsx` — Client Component
  - [ ] Email input with validation
  - [ ] AmountInput with $ prefix and auto-formatting
  - [ ] Note textarea with character counter (0/500)
  - [ ] Submit button with loading state (useActionState)
  - [ ] Inline error messages per field
  - [ ] Self-request prevention (client-side check)
- [ ] Create `src/components/requests/amount-input.tsx` — currency-formatted input
- [ ] Wire form to `createRequest` server action
- [ ] Success: redirect to `/requests/{id}` + toast "Payment request sent!"
- [ ] Error: preserve form data, show inline errors
- [ ] Test: create request for existing user
- [ ] Test: create request for non-existing user (orphan)
- [ ] Commit: `feat: add request creation flow with validation`

---

## Phase 5: Dashboard

- [ ] Create `src/app/(app)/dashboard/page.tsx` — Server Component (fetch data, pass to children)
- [ ] Create `src/components/dashboard/dashboard-tabs.tsx` — Incoming/Outgoing toggle via URL params
- [ ] Create `src/components/dashboard/stats-cards.tsx` — Pending, Paid, Declined, Total counts
- [ ] Create `src/components/dashboard/request-table.tsx` — Desktop table layout
- [ ] Create `src/components/dashboard/request-card.tsx` — Mobile card layout
- [ ] Create `src/components/dashboard/request-row.tsx` — Single table row
- [ ] Create `src/components/dashboard/status-badge.tsx` — Color-coded badge per status
- [ ] Create `src/components/dashboard/status-filter.tsx` — Dropdown: All/Pending/Paid/Declined/Cancelled/Expired
- [ ] Create `src/components/dashboard/search-input.tsx` — Debounced search (300ms) via URL param
- [ ] Create `src/components/dashboard/pagination.tsx` — Previous/Next, "Showing X-Y of Z"
- [ ] Create `src/components/dashboard/empty-state.tsx` — Per-context empty messages
- [ ] Integrate markExpiredOnRead in dashboard data fetch
- [ ] Test: incoming tab shows received requests
- [ ] Test: outgoing tab shows sent requests
- [ ] Test: filter by status works
- [ ] Test: search by email/name works
- [ ] Commit: `feat: add dashboard with tabs, filters, search, pagination`

---

## Phase 6: Request Detail + Actions

- [ ] Create `src/app/(app)/requests/[id]/page.tsx` — Server Component (fetch by ID + ownership check)
- [ ] Create `src/components/requests/request-detail-card.tsx` — Full info display
- [ ] Create `src/components/requests/countdown-timer.tsx` — Live countdown (Client, setInterval 60s)
- [ ] Create `src/components/requests/expiration-progress.tsx` — Color-coded progress bar
- [ ] Create `src/components/requests/pay-button.tsx` — Confirmation dialog → loading sim → success
- [ ] Create `src/components/requests/decline-button.tsx` — Confirmation dialog → decline
- [ ] Create `src/components/requests/cancel-button.tsx` — Confirmation dialog → cancel
- [ ] Create `src/components/requests/share-link-copy.tsx` — Copy to clipboard with feedback
- [ ] Create `src/components/requests/payment-status.tsx` — Paid/Declined/Cancelled/Expired states
- [ ] Handle expired request view (disabled Pay, Dismiss option)
- [ ] Handle 404 for non-existent or unauthorized requests
- [ ] Test: pay flow with loading simulation
- [ ] Test: decline flow
- [ ] Test: cancel flow (outgoing)
- [ ] Test: expired request shows disabled state
- [ ] Commit: `feat: add request detail view with pay, decline, cancel actions`

---

## Phase 7: Shareable Link

- [ ] Create `src/app/r/[token]/page.tsx`
- [ ] Handle: authenticated recipient → full actions
- [ ] Handle: authenticated sender → outgoing view
- [ ] Handle: authenticated non-involved → read-only
- [ ] Handle: unauthenticated → read-only + "Sign in to pay" CTA
- [ ] Sign-in CTA links to `/sign-in?callbackUrl=/r/{token}`
- [ ] Verify orphan claim works after sign-in via shareable link
- [ ] Handle: invalid token → 404
- [ ] Commit: `feat: add shareable link for payment requests`

---

## Phase 8: Polish

- [ ] Create `src/app/page.tsx` — Landing page
- [ ] Create `src/app/not-found.tsx` — Custom 404
- [ ] Create `src/app/(app)/dashboard/loading.tsx` — Skeleton loader
- [ ] Create `src/app/(app)/requests/[id]/loading.tsx` — Skeleton loader
- [ ] Create `src/app/(app)/dashboard/error.tsx` — Error boundary
- [ ] Create `src/app/(app)/requests/[id]/error.tsx` — Error boundary
- [ ] Responsive pass: test all pages at 375px, 768px, 1440px
- [ ] Accessibility pass: keyboard navigation, focus indicators, aria labels
- [ ] Verify all toast notifications work
- [ ] Verify all confirmation dialogs work
- [ ] Commit: `feat: add landing page and polish`

---

## Phase 9: Docker + Deploy

- [ ] Create `Dockerfile` (multi-stage: deps → build → runner)
  - [ ] node:20-alpine base
  - [ ] Non-root user (nextjs:nodejs)
  - [ ] Health check
  - [ ] Standalone output copy
- [ ] Create `docker-compose.yml`
  - [ ] app service (port 3000)
  - [ ] db service (postgres:16-alpine, named volume)
  - [ ] migrate service (prisma migrate deploy)
  - [ ] Internal network
  - [ ] Health checks + depends_on
- [ ] Create `.dockerignore`
- [ ] Create `.env.example` with all required variables
- [ ] Test locally: `docker compose up --build`
- [ ] Verify health checks pass
- [ ] Deploy to VPS
- [ ] Configure Nginx (SSL, reverse proxy)
- [ ] Run production migration
- [ ] Smoke test on public URL
- [ ] Commit: `chore: add Docker deployment configuration`

---

## Phase 10: E2E Tests

- [ ] Create `playwright.config.ts`
  - [ ] video: "on"
  - [ ] Desktop Chrome + Mobile iPhone 14 projects
  - [ ] webServer config for pnpm dev
- [ ] Create `e2e/global-setup.ts` — DB cleanup before tests
- [ ] Create `e2e/helpers/auth.ts` — `loginAs(page, email)` helper
- [ ] Create `e2e/helpers/seed.ts` — Test data factory functions
- [ ] Write `e2e/auth.spec.ts`
  - [ ] Should show sign-in page for unauthenticated users
  - [ ] Should redirect to dashboard after sign-in
  - [ ] Should protect dashboard route
  - [ ] Should sign out successfully
- [ ] Write `e2e/create-request.spec.ts`
  - [ ] Should create request with valid inputs
  - [ ] Should show validation errors for invalid email
  - [ ] Should show validation errors for invalid amount
  - [ ] Should prevent self-request
  - [ ] Should redirect to detail page after creation
- [ ] Write `e2e/dashboard.spec.ts`
  - [ ] Should show incoming requests tab by default
  - [ ] Should switch to outgoing tab
  - [ ] Should filter by status
  - [ ] Should search by email
  - [ ] Should show empty state when no requests
  - [ ] Should paginate when > 10 requests
- [ ] Write `e2e/pay-request.spec.ts`
  - [ ] Should show confirmation dialog
  - [ ] Should show loading state for 2-3 seconds
  - [ ] Should show success state
  - [ ] Should update status to Paid
  - [ ] Should reflect on sender's dashboard
- [ ] Write `e2e/decline-request.spec.ts`
  - [ ] Should decline request and update status
  - [ ] Should redirect to dashboard
- [ ] Write `e2e/cancel-request.spec.ts`
  - [ ] Should cancel outgoing request
  - [ ] Should redirect to dashboard
- [ ] Write `e2e/expiration.spec.ts`
  - [ ] Should show expired badge for expired requests
  - [ ] Should disable Pay button for expired requests
  - [ ] Should show countdown timer for pending requests
- [ ] Write `e2e/share-link.spec.ts`
  - [ ] Should show read-only view for unauthenticated users
  - [ ] Should show actions for authenticated recipient
  - [ ] Should show 404 for invalid token
- [ ] Write `e2e/responsive.spec.ts`
  - [ ] Should show mobile layout on small viewport
  - [ ] Should show bottom navigation on mobile
  - [ ] Should show sidebar on desktop
- [ ] Run full test suite: `pnpm test:e2e`
- [ ] Verify video files generated in `test-results/`
- [ ] Commit: `test: add comprehensive E2E test suite with video recording`

---

## Phase 11: Documentation + Submission

- [ ] Write `README.md`
  - [ ] Project overview
  - [ ] Live demo URL
  - [ ] Tech stack
  - [ ] AI tools used
  - [ ] Local development setup instructions
  - [ ] How to run E2E tests
  - [ ] Demo user credentials
  - [ ] Spec-Kit artifacts reference
- [ ] Write `specs/findings.md` — QA observations, bugs found, edge cases discovered
- [ ] Mark all tasks as [x] in this file
- [ ] Verify all spec-kit artifacts present in repo
- [ ] Final commit + push
- [ ] Verify live demo URL is accessible and functional
- [ ] Run E2E tests one final time on deployed app
- [ ] Commit: `docs: add README and finalize documentation`
