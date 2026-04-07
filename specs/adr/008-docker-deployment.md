# ADR-008: Docker Multi-Stage Deployment to VPS

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

The assignment requires a "publicly accessible URL." We have a VPS (Virtual Private Server) available. We need to decide how to package and deploy the Next.js application along with its PostgreSQL database.

## Decision

We deploy using **Docker Compose** with a **multi-stage Dockerfile** for the Next.js app, a PostgreSQL 16 container, and Nginx as a reverse proxy.

### Architecture on VPS
```
Internet → Nginx (SSL termination, :443)
             → Next.js container (:3000)
             → PostgreSQL container (:5432, internal only)
```

### Multi-Stage Dockerfile
Three stages to minimize production image size:

1. **deps** — Install dependencies only (cached layer)
2. **builder** — Copy source, generate Prisma client, build Next.js
3. **runner** — Minimal production image with standalone output

Key properties:
- **Non-root user**: `nextjs:nodejs` (UID 1001) — no root in production
- **Health check**: `wget` against `/api/auth/session` every 30s
- **Standalone output**: Next.js `output: "standalone"` produces a self-contained Node.js server (~50MB vs ~500MB full node_modules)
- **Pinned base image**: `node:20-alpine` (not `:latest`)

### Docker Compose Services
| Service | Image | Purpose | Exposed |
|---------|-------|---------|---------|
| `app` | Custom (Dockerfile) | Next.js application | :3000 (internal) |
| `db` | `postgres:16-alpine` | PostgreSQL database | :5432 (internal only) |
| `migrate` | Custom (Dockerfile) | Run `prisma migrate deploy` on startup | None (exits after migration) |

### Docker Compose Configuration
- **Named volume** `pgdata` for persistent PostgreSQL data
- **Health checks** on both `app` and `db` services
- **Depends_on with condition**: `app` waits for `db` to be healthy before starting
- **Internal network**: `db` not exposed to host — only accessible from `app` container
- **Restart policy**: `unless-stopped` for `app` and `db`; `no` for `migrate` (one-shot)
- **Environment variables**: Loaded from `.env` file, not hardcoded

### Nginx Configuration
- SSL termination with Let's Encrypt certificates
- Reverse proxy to `localhost:3000`
- HTTP → HTTPS redirect
- Proxy headers: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`

## Consequences

### Positive
- **Reproducible**: Same Docker image runs identically on any machine
- **Secure**: Non-root user, database not exposed to internet, SSL enforced
- **Simple deployment**: `docker compose up -d` — one command to deploy everything
- **Zero-downtime updates**: Build new image → `docker compose up -d` (compose recreates only changed services)
- **Data persistence**: Named volume survives container restarts and updates
- **Migration safety**: Dedicated `migrate` service runs migrations before app starts

### Negative
- **VPS management**: We are responsible for server maintenance, security updates, SSL renewal
- **No auto-scaling**: Single server, single instance. Acceptable for demo/assignment.
- **Build time**: Docker multi-stage build takes 2-4 minutes. Acceptable for our deployment frequency.

### Safeguards
- `.dockerignore` excludes `node_modules`, `.git`, `.env`, `test-results/` from build context
- `.env.example` provided in repo with placeholder values
- Health checks ensure containers are healthy before routing traffic
- Migration service has `restart: "no"` — doesn't loop if migration fails

## Alternatives Considered

### Vercel Deployment
- **Pros**: One-click deploy, CDN, serverless, zero DevOps
- **Cons**: User specified VPS deployment. Also, Vercel's serverless model has cold start issues with Prisma and doesn't directly host PostgreSQL.
- **Why rejected**: User has a VPS and wants full control. Task requirement is "publicly accessible URL" — VPS with Docker achieves this.

### Bare Metal (No Docker)
- **Pros**: No Docker overhead, slightly faster
- **Cons**: Not reproducible. System dependencies (Node.js version, npm packages) must be manually managed. No isolation between services.
- **Why rejected**: Docker provides reproducibility, isolation, and simpler deployment at negligible performance cost.

### Kubernetes
- **Pros**: Auto-scaling, self-healing, service mesh
- **Cons**: Massive operational complexity for a single-app deployment. Requires K8s cluster setup on VPS.
- **Why rejected**: Dramatically over-engineered. We have one app, one database, one server.

### Docker Swarm
- **Pros**: Simpler than K8s, built into Docker
- **Cons**: Still adds orchestration complexity we don't need. Single-node Swarm has no advantage over Compose.
- **Why rejected**: Docker Compose is sufficient for single-server deployment.
