# ADR-006: Server Actions over REST API Routes

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

Next.js 15 offers two approaches for handling mutations:
1. **API Routes** (`app/api/*/route.ts`): Traditional REST endpoints
2. **Server Actions** (`'use server'` functions): Direct function calls from client to server

We need to decide how the frontend communicates with the backend for all create, update, and delete operations.

## Decision

We use **Server Actions** for all mutations. No REST API routes are created except the NextAuth.js catch-all (`app/api/auth/[...nextauth]/route.ts`).

### Server Action Pattern
```typescript
// src/lib/actions/payment-request.ts
'use server'

import { requireAuth } from '@/lib/auth-utils'
import { createRequestSchema } from '@/lib/validations/payment-request'

export async function createRequest(formData: FormData) {
  const user = await requireAuth()
  const parsed = createRequestSchema.safeParse(Object.fromEntries(formData))
  
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }
  
  // ... business logic
  revalidatePath('/dashboard')
  redirect(`/requests/${request.id}`)
}
```

### Client Usage
```typescript
// Client Component
import { createRequest } from '@/lib/actions/payment-request'

function CreateRequestForm() {
  const [state, formAction, isPending] = useActionState(createRequest, null)
  return <form action={formAction}>...</form>
}
```

## Consequences

### Positive
- **Zero boilerplate**: No `fetch()`, no `Response.json()`, no route handler, no URL construction, no HTTP method handling
- **Type-safe end-to-end**: TypeScript types flow from server action to client component — no serialization/deserialization mismatch
- **Auto CSRF protection**: Server Actions are POST-only with SameSite cookies. Next.js 16 uses non-deterministic action IDs.
- **Progressive enhancement**: Forms work without JavaScript (basic POST). `useActionState` adds enhanced UX.
- **Colocation**: Server logic lives close to the components that use it, improving maintainability
- **Built-in revalidation**: `revalidatePath()` and `revalidateTag()` integrate natively
- **Pending states**: `useActionState` provides `isPending` for loading indicators without manual state management

### Negative
- **Not a public API**: Server Actions are internal to the Next.js app. If a mobile app or third-party needs access, API routes would be needed. Not a concern for v1 (web only).
- **Debugging**: Server Action errors can be less obvious than HTTP status codes. Mitigated by structured error returns.
- **Learning curve**: Team members familiar with REST may need adjustment. Mitigated by clear patterns and documentation.

### Safeguards
- Every Server Action starts with `requireAuth()` — no anonymous mutations
- Every Server Action validates input with Zod
- Errors are returned as structured values, never thrown as unhandled exceptions
- `redirect()` is called outside `try/catch` (it throws internally by design)

## Alternatives Considered

### REST API Routes (Next.js Route Handlers)
- **Pros**: Standard HTTP, works with any client, explicit request/response model
- **Cons**: Boilerplate for each endpoint (parse body, validate, handle methods, serialize response). Manual CSRF handling. Types don't flow automatically.
- **Why rejected**: Added boilerplate with no benefit for a server-rendered web app.

### tRPC
- **Pros**: Type-safe API layer, great DX
- **Cons**: Additional dependency, setup overhead, overkill when Server Actions provide similar type safety natively
- **Why rejected**: Server Actions achieve the same end-to-end type safety without an extra library.

### GraphQL (Apollo / Relay)
- **Pros**: Flexible querying, strong type system, great for complex data requirements
- **Cons**: Massive setup overhead (schema definition, resolvers, code generation). Our data model is simple — no deep nesting or varied query shapes.
- **Why rejected**: Dramatically over-engineered for CRUD operations on a single entity.
