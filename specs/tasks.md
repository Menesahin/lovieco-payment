# Task Checklist

> Lovie.co P2P Payment Request — Implementation Tasks
> Mark each task as [x] when completed
> Last updated: 2026-04-07

---

## Phase 0: Spec-Driven Foundation + Bootstrap

- [x] Initialize git repository with `.gitignore`
- [x] Create `specs/` directory structure (`specs/`, `specs/adr/`, `specs/architecture/`, `specs/ux/`)
- [x] Write `specs/constitution.md`
- [x] Write `specs/spec.md`
- [x] Write `specs/adr/001-tech-stack.md`
- [x] Write `specs/adr/002-money-as-integer-cents.md`
- [x] Write `specs/adr/003-expiration-check-on-read.md`
- [x] Write `specs/adr/004-unregistered-recipients.md`
- [x] Write `specs/adr/005-shareable-token-vs-id.md`
- [x] Write `specs/adr/006-server-actions-over-api.md`
- [x] Write `specs/adr/007-auth-test-bypass.md`
- [x] Write `specs/adr/008-docker-deployment.md`
- [x] Write `specs/adr/009-email-only-recipient.md`
- [x] Write `specs/adr/010-concurrency-control.md`
- [x] Write `specs/architecture/system-overview.md`
- [x] Write `specs/architecture/data-flow.md`
- [x] Write `specs/architecture/state-machine.md`
- [x] Write `specs/ux/user-flows.md`
- [x] Write `specs/ux/mockups.md`
- [x] Write `specs/roadmap.md`
- [x] Write `specs/tasks.md` (this file)
- [x] Run `npx create-next-app@16.2 . --typescript --tailwind --app --src-dir --import-alias "@/*"` (Next.js 16 removed next lint)
- [x] Install core deps: `pnpm add prisma @prisma/client @auth/prisma-adapter next-auth@beta zod resend pino pino-pretty`
- [x] Install dev deps: `pnpm add -D @playwright/test`
- [x] Init shadcn: `pnpm dlx shadcn@latest init`
- [x] Init Prisma: `npx prisma init`
- [x] Configure `next.config.ts`: `output: "standalone"`
- [x] Verify `tsconfig.json`: strict mode, `@/` alias
- [x] Create `.env` and `.env.example`
- [ ] Init Spec-Kit (if available): `specify init .` (skipped — manual spec workflow used)
- [x] Commit: `docs: add spec-driven documentation`
- [x] Commit: `chore: bootstrap Next.js project with deps`

---

## Phase 1: Database + Auth

- [x] Write full Prisma schema (`prisma/schema.prisma`)
  - [x] User model
  - [x] Account model (NextAuth)
  - [x] Session model (NextAuth)
  - [x] VerificationToken model (NextAuth)
  - [x] PaymentRequest model with all fields and indexes
  - [x] RequestStatus enum
- [x] Run `npx prisma migrate dev --name init`
- [x] Create `src/lib/db.ts` — Prisma client singleton (globalThis + PrismaPg adapter for Prisma 7)
- [x] Create `src/auth.ts` — NextAuth v5 config
  - [x] Resend provider
  - [x] PrismaAdapter
  - [x] Custom pages (signIn, verifyRequest, error)
  - [x] Session callback (include user.id)
  - [x] signIn event: orphan claim logic
  - [x] Conditional test CredentialsProvider (NODE_ENV=test)
- [x] Create `src/app/api/auth/[...nextauth]/route.ts`
- [x] Create `src/proxy.ts` — protect /dashboard, /requests, /settings (Next.js 16 proxy function)
- [x] Create `src/lib/guards/require-auth.ts`
- [x] Create `src/app/(auth)/layout.tsx` — centered card layout
- [x] Create `src/app/(auth)/sign-in/page.tsx` — email input form
- [x] Create `src/app/(auth)/verify-request/page.tsx` — "Check your email"
- [x] Create `src/app/(auth)/error/page.tsx` — auth error display
- [x] Test magic link flow end-to-end manually (dev bypass mode — no Resend needed)
- [x] Commit: `feat: add database schema and auth system`

---

## Phase 2: UI Shell

- [x] Install shadcn components: button, card, input, badge, tabs, skeleton, dialog, select, separator, avatar, dropdown-menu, sonner
- [x] Create `src/app/layout.tsx` — Geist Sans/Mono fonts, Toaster, Warm Neutral + Gold theme
- [x] Create `src/app/(app)/layout.tsx` — sidebar + topbar + mobile nav, h-screen flex, white bg
- [x] Create `src/components/layout/app-sidebar.tsx` — nav with active states, gradient logo
- [x] Create `src/components/layout/top-bar.tsx` — balance pill, avatar initial, topup modal
- [x] Create `src/components/layout/mobile-nav.tsx` — 4 items, amber active dot, safe-area padding
- [x] Create `src/components/shared/currency-display.tsx`
- [x] Create `src/components/shared/loading-spinner.tsx`
- [x] Verify responsive layout
- [x] Commit: `feat: add app shell with responsive layout`

---

## Phase 3: Server Actions + Queries

- [x] Create `src/lib/validations/payment-request.ts` + `wallet.ts` — Zod schemas
- [x] Create `src/lib/utils/currency.ts` — formatCents, toCents
- [x] Create `src/lib/utils/expiration.ts` (client) + `expiration.server.ts` (server, markExpiredOnRead)
- [x] Create guard functions: require-auth, require-pending, require-not-expired, require-ownership
- [x] Create `src/lib/repositories/payment-request.repository.ts` — CRUD + filters + stats
- [x] Create `src/lib/repositories/wallet.repository.ts` — getOrCreateWallet, getTransactions
- [x] Create `src/lib/repositories/activity.repository.ts` — unified activity feed
- [x] Create `src/lib/actions/payment-request.ts` — createRequest, payRequest (atomic wallet transfer), declineRequest, cancelRequest
- [x] Create `src/lib/actions/wallet.ts` — topupWallet (atomic, Serializable)
- [x] Create `src/lib/actions/settings.ts` — updateProfile
- [x] Create `src/lib/actions/auth.ts` — requestMagicLink (dev bypass)
- [x] Create `src/lib/dto/payment-request.dto.ts` + `wallet.dto.ts`
- [x] Create `src/lib/logger.ts` — structured JSON logger
- [x] Commit: done (multiple commits)

---

## Phase 4: Request Creation Flow

- [x] Create `/requests/new` page + CreateRequestForm (client, action via prop NX-11)
- [x] Email input, amount input ($, mono font), note textarea (0/500 counter)
- [x] Live amount preview card
- [x] useActionState for pending/error, Zod validation (client + server)
- [x] Self-request prevention
- [x] Success redirect + toast
- [x] Premium card wrapper, rounded-xl, amber focus rings

---

## Phase 5: Dashboard (evolved to unified activity feed)

- [x] Create dashboard page — compact fintech layout, no page scroll
- [x] Create activity-feed.tsx — unified timeline (requests + payments + topups)
- [x] Inline stat cards (Balance, Pending, Completed)
- [x] Status badges with dot indicators
- [x] Activity type filter pills (All / Incoming / Outgoing / Top Ups)
- [x] Inline Pay/Decline actions with confirmation dialogs
- [x] Sticky pagination (outside scroll area)
- [x] Empty state with CTAs
- [x] markExpiredOnRead integrated in activity repository

---

## Phase 6: Request Detail + Actions

- [x] Create `/requests/[id]` page — ownership check, wallet balance fetch
- [x] Create request-detail.tsx — amount, status, counterparty, note, dates
- [x] Create countdown-timer.tsx — live countdown, color progress bar (hydration-safe)
- [x] Pay/Decline/Cancel with confirmation dialogs (actions via props, NX-11)
- [x] Payment sim: 2.5s sleep OUTSIDE transaction (DB-02), atomic wallet transfer
- [x] Balance display + insufficient funds guard
- [x] Payment success screen: emerald checkmark, scale-in animation, mono amount
- [x] Shareable link copy to clipboard
- [x] Expired state: disabled Pay, warning message
- [x] 404 for unauthorized/nonexistent

---

## Phase 7: Shareable Link

- [x] Create `/r/[token]` page
- [x] Not logged in → friendly sign-in prompt (no payment details exposed)
- [x] Logged in + involved → redirect to `/requests/{id}`
- [x] Logged in + not involved → "Access Restricted" message
- [x] Invalid token → 404
- [x] callbackUrl preserved through sign-in

---

## Phase 8: Polish + UI/UX Overhaul

- [x] Landing page — gradient hero, feature cards, premium header
- [x] 404 page — clean centered layout
- [x] Loading skeletons (dashboard, request detail)
- [x] Error boundaries (dashboard, request detail)
- [x] Warm Neutral + Gold theme (globals.css)
- [x] Geist Sans/Mono fonts
- [x] White backgrounds everywhere (no gray patches)
- [x] Settings page — profile edit, wallet info, account details, danger zone
- [x] Wallet page — balance card, transaction table + filter pills + pagination, compact layout
- [x] Sign-in — inline magic link display (dev mode, no Resend needed)
- [x] Dev login endpoint (/api/dev-login)
- [x] Responsive pass
- [x] Toast notifications verified
- [x] Confirmation dialogs verified

## Phase 8b: Wallet System (bonus, not in original spec)

- [x] Wallet model + Transaction model + CHECK constraint (non-negative balance)
- [x] Atomic wallet transfers in Serializable transaction (sleep outside)
- [x] topupWallet action (Zod: $1-$10K)
- [x] TopupModal component
- [x] Transaction audit trail (TOPUP, PAYMENT_SENT, PAYMENT_RECEIVED)
- [x] Wallet page with table view + type filter + pagination
- [x] Balance in TopBar + insufficient funds guard in request detail

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
