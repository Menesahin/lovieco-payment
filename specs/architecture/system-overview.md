# System Architecture Overview

> LovePay P2P Payment Request Application
> Last updated: 2026-04-07

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
│                     (User's Browser)                         │
│                                                              │
│   Desktop (>1024px)    Tablet (768-1024px)    Mobile (<768px)│
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS (:443)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                     │
│                                                               │
│  - SSL termination (Let's Encrypt)                           │
│  - HTTP → HTTPS redirect                                     │
│  - Proxy headers (X-Real-IP, X-Forwarded-For, X-Forwarded-  │
│    Proto)                                                     │
│  - Static asset caching                                      │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP (:3000)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   NEXT.JS 16.2 (App Router)                   │
│                    Docker Container                           │
│                    Node.js 20 Alpine                          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                  RENDERING LAYER                       │   │
│  │                                                        │   │
│  │  Server Components          Client Components          │   │
│  │  ┌──────────────────┐      ┌───────────────────────┐  │   │
│  │  │ - Page rendering │      │ - Interactive forms    │  │   │
│  │  │ - Data fetching  │      │ - Countdown timers    │  │   │
│  │  │ - Auth checks    │      │ - Dashboard tabs      │  │   │
│  │  │ - Layout/nav     │      │ - Filter/search       │  │   │
│  │  └──────────────────┘      │ - Pay/Decline buttons │  │   │
│  │                             │ - Toast notifications │  │   │
│  │                             └───────────────────────┘  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                   BUSINESS LAYER                       │   │
│  │                                                        │   │
│  │  Server Actions              Middleware                │   │
│  │  ┌──────────────────┐       ┌──────────────────────┐  │   │
│  │  │ - createRequest  │       │ - Route protection   │  │   │
│  │  │ - payRequest     │       │ - Session validation │  │   │
│  │  │ - declineRequest │       │ - Redirect unauth    │  │   │
│  │  │ - cancelRequest  │       └──────────────────────┘  │   │
│  │  └──────────────────┘                                  │   │
│  │                                                        │   │
│  │  Repositories                Validators                │   │
│  │  ┌──────────────────┐       ┌──────────────────────┐  │   │
│  │  │ - PaymentRequest │       │ - Zod schemas        │  │   │
│  │  │   Repository     │       │ - Email validation   │  │   │
│  │  │ - User Repository│       │ - Amount validation  │  │   │
│  │  └──────────────────┘       └──────────────────────┘  │   │
│  │                                                        │   │
│  │  Guards                      Utilities                 │   │
│  │  ┌──────────────────┐       ┌──────────────────────┐  │   │
│  │  │ - requireAuth()  │       │ - formatCents()      │  │   │
│  │  │ - requirePending │       │ - toCents()          │  │   │
│  │  │ - requireNotExp  │       │ - isExpired()        │  │   │
│  │  │ - requireOwner   │       │ - getTimeRemaining() │  │   │
│  │  └──────────────────┘       └──────────────────────┘  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                          │   │
│  │                                                        │   │
│  │  Prisma ORM (Type-safe)     NextAuth.js v5            │   │
│  │  ┌──────────────────┐       ┌──────────────────────┐  │   │
│  │  │ - Query builder  │       │ - Session management │  │   │
│  │  │ - Transactions   │       │ - Magic link flow    │  │   │
│  │  │ - Migrations     │       │ - Prisma adapter     │  │   │
│  │  │ - Type generation│       │ - Orphan claim hook  │  │   │
│  │  └──────────────────┘       └──────────────────────┘  │   │
│  │                                                        │   │
│  │  Pino Logger                                           │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │ - Structured JSON logs                           │ │   │
│  │  │ - Transaction audit trail                        │ │   │
│  │  │ - Error logging with context                     │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────┘
                               │ TCP (:5432)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   POSTGRESQL 16 (Alpine)                      │
│                   Docker Container                            │
│                                                               │
│  Tables:                                                      │
│  ┌──────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │   User   │  │  PaymentRequest  │  │  Session           │ │
│  │          │  │                  │  │  Account           │ │
│  │  id      │◄─│  senderId (FK)   │  │  VerificationToken │ │
│  │  email   │◄─│  recipientId (FK)│  └────────────────────┘ │
│  │  name    │  │  recipientEmail  │                          │
│  └──────────┘  │  amountCents     │  Named Volume:           │
│                │  status          │  ┌────────────────────┐  │
│                │  shareableToken  │  │  pgdata:/var/lib/   │  │
│                │  expiresAt       │  │  postgresql/data    │  │
│                └──────────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

                    EXTERNAL SERVICES
                    ┌──────────────┐
                    │   Resend     │
                    │   (Email)    │
                    │              │
                    │  Magic link  │
                    │  emails      │
                    └──────────────┘
```

---

## Layer Responsibilities

### 1. Nginx Layer
| Responsibility | Details |
|---------------|---------|
| SSL Termination | Let's Encrypt certificates, auto-renewal via certbot |
| Reverse Proxy | Routes all traffic to Next.js container on port 3000 |
| HTTP → HTTPS | 301 redirect for all non-HTTPS requests |
| Header Injection | Adds `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` for proper client IP detection |
| Static Caching | Caches `/_next/static/*` with long TTL |

### 2. Rendering Layer (Next.js)
| Component Type | Responsibility | Runs On |
|---------------|----------------|---------|
| Server Components | Page rendering, data fetching, auth checks, layout | Server only |
| Client Components | Interactive UI: forms, timers, tabs, filters, action buttons | Server (SSR) + Client (hydration) |
| Proxy (`proxy.ts`) | Route protection, session validation, redirect logic | Node.js only (not Edge) |

### 3. Business Layer
| Module | Responsibility |
|--------|---------------|
| Server Actions | All mutations: create, pay, decline, cancel. Entry point for business logic. |
| Repositories | Database access abstraction. All Prisma queries go through repositories. |
| Validators | Zod schemas for input validation. Called by Server Actions. |
| Guards | Authorization functions: `requireAuth()`, `requirePending()`, `requireNotExpired()`, `requireOwnership()`. Composable, fail-fast. |
| Utilities | Pure functions: currency formatting, expiration calculation, time helpers |

### 4. Data Layer
| Module | Responsibility |
|--------|---------------|
| Prisma ORM | Type-safe database access, migrations, transaction management |
| NextAuth.js | Authentication, session management, magic link flow, orphan claim |
| Pino Logger | Structured JSON logging, audit trail for financial operations |

### 5. Database Layer
| Table | Records |
|-------|---------|
| User | User accounts (id, email, name) |
| PaymentRequest | Payment requests with full lifecycle data |
| Session | Active user sessions (NextAuth managed) |
| Account | OAuth accounts (NextAuth managed) |
| VerificationToken | Magic link tokens (NextAuth managed) |

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router (pages + layouts)
│   ├── (auth)/                   # Auth route group (sign-in, verify)
│   ├── (app)/                    # Authenticated route group (dashboard, requests)
│   ├── r/                        # Public shareable link routes
│   └── api/auth/                 # NextAuth catch-all route
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   ├── layout/                   # App shell: sidebar, top-bar, mobile-nav
│   ├── dashboard/                # Dashboard-specific components
│   ├── requests/                 # Request form, detail, action buttons
│   ├── auth/                     # Sign-in form, user menu
│   └── shared/                   # Currency display, loading spinner, etc.
├── lib/                          # Business logic & utilities
│   ├── actions/                  # Server Actions (mutations)
│   ├── repositories/             # Database access layer
│   ├── queries/                  # Read-only data fetching functions
│   ├── validations/              # Zod schemas
│   ├── guards/                   # Auth & authorization guards
│   ├── utils/                    # Pure utility functions
│   ├── db.ts                     # Prisma client singleton
│   └── logger.ts                 # Pino logger instance
├── auth.ts                       # NextAuth configuration
├── proxy.ts                      # Route protection proxy (replaces middleware.ts in Next.js 16)
└── generated/                    # Prisma generated client
```

---

## Container Architecture (Docker)

```
┌─────────────────────────────────────────────────────┐
│                   Docker Host (VPS)                   │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │            Docker Compose Network               │ │
│  │              (internal bridge)                    │ │
│  │                                                   │ │
│  │  ┌─────────────┐  ┌────────┐  ┌──────────────┐ │ │
│  │  │    app       │  │migrate │  │     db       │ │ │
│  │  │  Next.js     │  │Prisma  │  │ PostgreSQL   │ │ │
│  │  │  :3000       │  │migrate │  │ :5432        │ │ │
│  │  │             │  │deploy  │  │              │ │ │
│  │  │ non-root    │  │(exits) │  │ named volume │ │ │
│  │  │ healthcheck │  │        │  │ healthcheck  │ │ │
│  │  └─────────────┘  └────────┘  └──────────────┘ │ │
│  │                                                   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Exposed: :3000 (to Nginx) only                      │
│  db: internal only, not exposed to host               │
└─────────────────────────────────────────────────────┘
```

### Startup Sequence
```
1. db container starts → health check (pg_isready)
2. db healthy → migrate container starts → runs prisma migrate deploy → exits
3. db healthy → app container starts → health check (wget /api/auth/session)
4. Nginx routes traffic to app:3000
```

---

## Security Boundaries

```
┌──────────────────────────────────────────────────┐
│                   PUBLIC ZONE                     │
│                                                   │
│  Accessible without auth:                        │
│  - / (landing page)                              │
│  - /sign-in, /verify-request, /error             │
│  - /r/{token} (read-only shareable link view)    │
│  - /api/auth/* (NextAuth endpoints)              │
└─────────────────────┬────────────────────────────┘
                      │ Middleware auth check
                      ▼
┌──────────────────────────────────────────────────┐
│                 AUTHENTICATED ZONE                │
│                                                   │
│  Requires valid session:                         │
│  - /dashboard                                    │
│  - /requests/new                                 │
│  - /requests/{id}                                │
│  - /settings                                     │
│  - All Server Actions                            │
└─────────────────────┬────────────────────────────┘
                      │ requireAuth() + ownership check
                      ▼
┌──────────────────────────────────────────────────┐
│                 AUTHORIZED ZONE                   │
│                                                   │
│  Requires auth + specific role:                  │
│  - payRequest: must be recipientId               │
│  - declineRequest: must be recipientId           │
│  - cancelRequest: must be senderId               │
│  - View /requests/{id}: must be sender or recip  │
└──────────────────────────────────────────────────┘
```
