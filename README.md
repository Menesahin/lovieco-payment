# Lovie.co — P2P Payment Requests

> Request money from anyone, hassle-free. Built with spec-driven, AI-native development.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│  Landing · Sign-in · Dashboard · Wallet · Requests   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              Next.js 16.2 (Turbopack)                │
│                                                      │
│  Server Components ──► Prisma ORM ──► PostgreSQL 16  │
│  Server Actions    ──► Serializable Transactions     │
│  proxy.ts          ──► Route Protection              │
│  NextAuth v5       ──► Magic Link (Resend)           │
└──────────────────────────────────────────────────────┘
```

## Payment Flow

```
Alice creates request          Bob receives & pays           Atomic Transfer
─────────────────────       ─────────────────────       ─────────────────────
                                                        
 /requests/new               /dashboard                  $transaction {
  │                           │                            Bob.wallet  -= $42
  ├─ Email: bob@demo          ├─ Sees Alice's $42          Alice.wallet += $42
  ├─ Amount: $42.00           ├─ Clicks "Pay"              Transaction logs ×2
  ├─ Note: "Pizza"            ├─ Confirm dialog            Request → PAID
  │                           ├─ 2.5s processing          }
  └─► Status: PENDING         └─► Status: PAID            isolationLevel:
      Expires: 7 days              Balance updated          Serializable
```

## Request Status Lifecycle

```
         create()
        ──────────► PENDING ──────────► PAID       (recipient pays)
                      │  │
                      │  └──────────► DECLINED   (recipient declines)
                      │
                      └─────────────► CANCELLED  (sender cancels)
                      
        7 days pass ► EXPIRED                     (check-on-read, no cron)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL 16 + Prisma 7 |
| Auth | NextAuth v5 (Magic Link) |
| UI | shadcn/ui + Tailwind CSS 4 |
| Testing | Playwright (E2E + video) |
| Deploy | Docker (multi-stage) |
| AI | Claude Code (Opus 4.6) |

## Quick Start

```bash
git clone https://github.com/Menesahin/lovieco-payment.git
cd lovieco-payment
pnpm install
cp .env.example .env        # Edit DATABASE_URL
npx prisma migrate dev
npx tsx prisma/seed.ts       # Demo users + data
pnpm dev                     # http://localhost:3000
```

**Demo login:** `http://localhost:3000/api/dev-login?email=alice@demo.lovie.co`

| User | Email | Balance |
|------|-------|---------|
| Alice | alice@demo.lovie.co | $250 |
| Bob | bob@demo.lovie.co | $500 |
| Carol | carol@demo.lovie.co | $150 |
| Dave | dave@demo.lovie.co | $750 |

## E2E Tests + Video Recording

```bash
npx playwright install chromium
npx playwright test e2e/scenarios --project=chromium
npx playwright show-report    # View videos in browser
```

5 scenario tests, 26 unit tests — all with video recording (`video: "on"`):

| Scenario | Duration | What it tests |
|----------|----------|---------------|
| Full Payment Flow | ~19s | Topup → request → pay → balance verify |
| Decline & Cancel | ~10s | Decline incoming, cancel outgoing |
| Wallet Operations | ~11s | Topup, transaction history, filters |
| Auth & Access | ~11s | Route guards, shareable link security |
| Insufficient Funds | ~8s | Balance check, disabled pay, topup to unlock |

## Spec-Driven Process

```
specs/
├── constitution.md          # 12 coding standards (SOLID, Fintech, Next.js 16)
├── spec.md                  # Full product spec with acceptance criteria
├── architecture/            # System overview, data flows, state machine
├── ux/                      # User flows + mockups
├── adr/                     # 11 architecture decision records
├── roadmap.md               # Phases & milestones
├── findings.md              # QA observations
└── e2e-scenarios.md         # Test journey documentation
```

## Key Architecture Decisions

| Decision | Why |
|----------|-----|
| Integer cents (not float) | Zero precision errors on money |
| Serializable transactions | Prevents double-spend, atomic wallet transfers |
| Check-on-read expiration | No cron needed, simpler deploy |
| Server Actions (not REST) | Type-safe, auto CSRF, zero boilerplate |
| Wallet simulation | DB-level balance tracking makes payments meaningful |
| `proxy.ts` (not middleware) | Next.js 16 rename, Node.js runtime only |

## AI Development Skill — `/lovepay-dev`

This project includes a custom Claude Code skill (`.claude/skills/lovepay-dev/SKILL.md`) that encodes all project knowledge:

```
/lovepay-dev plan <feature>      # Spec-driven feature planning
/lovepay-dev implement <feature> # Build following spec + constitution
/lovepay-dev fix <bug>           # Trace data flow, find root cause
/lovepay-dev review              # Anti-pattern detection (30+ rules)
/lovepay-dev update-specs        # Sync specs with implementation
```

The skill knows: constitution rules, all 11 ADRs, Prisma 7/Turbopack gotchas, fintech anti-patterns (FIN-01→08), Next.js 16 patterns (NX-01→12), and the full codebase structure.

## Docker

```bash
docker compose up --build    # App + PostgreSQL + auto-migrate
```

---

Built with **Claude Code** (Opus 4.6) for the Lovie.co hiring assignment — 2026
