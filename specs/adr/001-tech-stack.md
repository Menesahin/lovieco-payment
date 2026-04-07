# ADR-001: Technology Stack Selection

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

We are building LovePay, a P2P payment request web application (similar to Venmo's "Request" feature) as part of a startup assignment. The application requires:
- Full-stack web app with authentication, CRUD operations, real-time status
- Responsive design (mobile + desktop)
- Database persistence
- Docker-based deployment to VPS
- E2E testing with automated screen recording
- Rapid development (3-4 hour timeline for initial prototype)

We need to select a cohesive technology stack that balances development speed, type safety, fintech reliability, and deployment simplicity.

## Decision

We will use the following stack:

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2 |
| **Language** | TypeScript | 5.x (strict mode) |
| **ORM** | Prisma | Latest |
| **Database** | PostgreSQL | 16.x |
| **Authentication** | NextAuth.js (Auth.js) | v5 (beta) |
| **Email Service** | Resend | Latest |
| **UI Components** | shadcn/ui | Latest |
| **Styling** | Tailwind CSS | 4.x |
| **Validation** | Zod | Latest |
| **Logging** | Pino | Latest |
| **E2E Testing** | Playwright | Latest |
| **Package Manager** | pnpm | Latest |
| **Deployment** | Docker (multi-stage) | — |
| **Reverse Proxy** | Nginx | — |

## Consequences

### Positive
- **Single codebase**: Next.js App Router provides full-stack capabilities — frontend, backend (Server Actions), and API routes in one project. No separate frontend/backend repos.
- **Shared types**: TypeScript strict mode across the entire stack eliminates API contract mismatches between client and server.
- **Rapid development**: Server Components + Server Actions eliminate boilerplate API code. shadcn/ui provides production-ready, customizable components.
- **Turbopack default**: 2-5x faster builds, 10x faster Fast Refresh, disk caching for faster restarts.
- **React Compiler stable**: Built-in, no manual `useMemo`/`useCallback` — automatic optimization.
- **Type-safe database access**: Prisma generates TypeScript types from the schema — queries are compile-time checked.
- **Modern auth**: NextAuth v5 with Prisma adapter handles session management, magic link flow, and database storage out of the box.
- **Docker-friendly**: `output: "standalone"` in Next.js produces a minimal Node.js server — small Docker images, fast builds.
- **Strong ecosystem**: All chosen technologies have large communities, active maintenance, and good documentation.

### Negative
- **NextAuth v5 is beta**: API may change. Mitigated by pinning exact version.
- **Prisma cold start**: First query after deploy has ~1-2s overhead for schema engine. Acceptable for our scale.
- **Node.js single-threaded**: CPU-bound tasks could block the event loop. Not a concern — our workload is I/O-bound (DB queries, email sending).
- **JavaScript floating-point**: Potential precision issues with money. **Mitigated by ADR-002** (integer cents).

### Risks
- Next.js 16 caching requires explicit `use cache` directive — no implicit caching, must be deliberate
- `proxy.ts` replaces `middleware.ts` — naming change from 15.x
- Async-only request APIs (`cookies()`, `headers()`, `params`, `searchParams`) — all must be awaited
- shadcn/ui is copy-paste (not a package) — component updates are manual

## Alternatives Considered

### Java (Spring Boot) + React
- **Pros**: BigDecimal for financial math, enterprise maturity, strong type system
- **Cons**: 1-1.5 hour extra setup overhead, two separate projects, slower feedback loop, heavier Docker images (JVM)
- **Why rejected**: Development speed is critical for the assignment timeline. The financial precision concern is addressed by integer cents storage (ADR-002).

### Python (FastAPI) + React
- **Pros**: Python Decimal module, rapid prototyping, FastAPI is fast
- **Cons**: Runtime type checking (not compile-time), two separate projects, GIL limitations
- **Why rejected**: Weaker type safety than TypeScript. Still requires separate frontend/backend.

### Remix / SvelteKit
- **Pros**: Modern full-stack alternatives with good DX
- **Cons**: Smaller ecosystem, fewer UI component libraries, less community support
- **Why rejected**: Next.js has the largest ecosystem and best Vercel/VPS deployment story.
