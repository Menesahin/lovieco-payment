# Lovie.co — P2P Payment Requests

A peer-to-peer payment request application built with a spec-driven, AI-native development workflow. Users can request money from others via email, track request status, and simulate payments with a DB-level wallet system.

## Live Demo

**URL:** _[to be added after deployment]_

**Demo Accounts:**
| User | Email | Balance |
|------|-------|---------|
| Alice | `alice@demo.lovie.co` | $250.00 |
| Bob | `bob@demo.lovie.co` | $500.00 |
| Carol | `carol@demo.lovie.co` | $150.00 |
| Dave | `dave@demo.lovie.co` | $750.00 |

**Quick Login (dev mode):** `http://localhost:3000/api/dev-login?email=alice@demo.lovie.co`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack, Server Components) |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL 16 + Prisma 7 (PrismaPg adapter) |
| Auth | NextAuth.js v5 (Magic Link via Resend) |
| UI | shadcn/ui + Tailwind CSS 4 (Warm Neutral + Gold theme) |
| Fonts | Geist Sans + Geist Mono |
| Testing | Playwright (E2E, video recording) |
| Deployment | Docker (multi-stage, non-root) |
| AI Tools | **Claude Code** (Claude Opus 4.6) — spec writing, architecture, implementation |

## Features

- **Payment Requests:** Create, pay, decline, cancel with shareable links
- **Wallet System:** Balance tracking, topup simulation, atomic transfers (Serializable transactions)
- **Activity Feed:** Unified timeline of all financial activity with type filters
- **Expiration:** 7-day TTL with live countdown, check-on-read pattern (no cron)
- **Magic Link Auth:** Email-based, dev mode shows link inline (no email needed for testing)
- **Premium UI:** Compact fintech dashboard, responsive (mobile + desktop)

## Local Development

### Prerequisites
- Node.js 20.9+
- pnpm 9+
- PostgreSQL 16

### Setup

```bash
# 1. Clone
git clone https://github.com/[your-username]/lovieco.git
cd lovieco

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. Database setup
npx prisma migrate dev
pnpm db:seed

# 5. Run dev server
pnpm dev
# Open http://localhost:3000
```

## Running E2E Tests

```bash
# Install Playwright browsers (first time)
npx playwright install chromium

# Run all tests with video recording
pnpm test:e2e

# Run specific test suite
pnpm test:e2e -- --grep "dashboard"

# View test report
npx playwright show-report

# Videos saved to test-results/
```

## Docker Deployment

```bash
# Build and run (connects to your PostgreSQL)
docker compose up --build

# Run migrations
docker compose run migrate

# Seed demo data
docker compose --profile seed run seed
```

## Spec-Driven Process

This project follows a spec-driven development workflow:

1. **Constitution** (`specs/constitution.md`) — 12-section coding standards
2. **Product Spec** (`specs/spec.md`) — Full feature specification with acceptance criteria
3. **Architecture** (`specs/architecture/`) — System overview, data flows, state machine
4. **ADRs** (`specs/adr/`) — 11 architecture decision records
5. **UX** (`specs/ux/`) — User flows + ASCII mockups
6. **Roadmap** (`specs/roadmap.md`) — Phases and milestones
7. **Findings** (`specs/findings.md`) — QA observations

## Architecture Decisions (ADR Summary)

| # | Decision | Rationale |
|---|---------|-----------|
| 001 | Next.js 16.2 + Prisma 7 | Full-stack, type-safe, Turbopack performance |
| 002 | Integer cents for money | No floating-point errors |
| 003 | Check-on-read expiration | No cron, simpler deploy |
| 004 | Nullable recipientId | Requests work before recipient signs up |
| 005 | Shareable token vs ID | Prevents enumeration |
| 006 | Server Actions over API | Zero boilerplate, auto CSRF |
| 007 | Test auth bypass | E2E without email verification |
| 008 | Docker multi-stage | Reproducible, non-root, healthcheck |
| 009 | Email-only recipient | Phone deferred to v2 |
| 010 | Serializable isolation | Prevents double-spend |
| 011 | Wallet simulation | DB-level balance tracking |

## Project Structure

```
specs/          — Source of truth (20+ documents)
prisma/         — Schema, migrations, seed
src/app/        — Next.js App Router pages
src/components/ — UI components (shadcn + custom)
src/lib/        — Business logic, actions, repositories, guards
e2e/            — Playwright E2E tests
```

## AI Tools Used

**Claude Code** (Claude Opus 4.6, 1M context) was used throughout the entire development process:
- Spec writing (constitution, product spec, ADRs, architecture docs)
- Architecture planning and decision-making
- Full implementation (all source code)
- Bug diagnosis and resolution (Prisma 7/Turbopack compatibility)
- UI/UX design and polish
- E2E test suite
- Docker configuration
- Custom development skill (`/lovepay-dev`) with anti-pattern detection

---

Built for the Lovie.co hiring assignment — 2026
