# Identity Module

Deep module for identity and authorization. Single source of truth for
"who is the caller and what can they do" across server and client.

Tracks RFC: https://github.com/Tbsheff/spruce-kitchen/issues/1

## Layout

```
lib/identity/
  core/
    ports.ts      # interfaces (zero runtime)
    domain.ts     # pure resolveCurrentUser, CurrentUser, can()
    index.ts      # re-exports
  adapters/
    prod/         # BetterAuth / Drizzle / SimpleAudit / SystemClock
    test/         # in-memory stand-ins for unit tests
  index.ts        # public API + createServerIdentityPorts()
  server.ts       # RSC helpers: currentUser() + requireUser()
  testing.ts      # createTestIdentity() + in-memory re-exports
```

## Invariants

1. `core/` imports only types. No React, Next, Better Auth, Drizzle, or
   Postgres. (An ESLint `no-restricted-imports` rule enforcing this is a
   follow-up — see RFC non-goals.)
2. Production code must not import from `lib/identity/testing`.
3. `resolveCurrentUser` is a pure function of its ports. Memoization belongs
   at the wiring layer (`createServerIdentityPorts` shares a request-scoped
   Map; `lib/identity/server.ts` wraps the RSC call in `React.cache`).

## Phase status

| Phase | Status | Commit | What's in |
|-------|--------|--------|-----------|
| 1. Foundation | Done | `a772993` | Pure core, prod + test adapters, `createServerIdentityPorts`, `createTestIdentity` |
| 2. Server rewire | Done | `bdbe402` | `ctx.currentUser` in tRPC, rewritten procedures, `lib/identity/server.ts` RSC helpers, `RBACService` + mock matrix deleted |
| 2.5. Client seam | Done | pending | `serializeCurrentUser` / `hydrateCurrentUser` helpers in domain |
| 3. Client migration | Not started | — | See below |
| 4. Router ergonomics | Not started | — | See below |

## Phase 3 — client migration (future work)

Scope: replace every consumer of `useAuth` / `useUser` / `useSession` /
`useRequireAuth` / `<AuthGuard>` with a single `useCurrentUser()` hook, and
delete `lib/auth-context.tsx` + `components/auth/auth-guard.tsx`.

Required fetch strategy: the client needs to call a server endpoint that
returns the resolved `CurrentUserState`. The obvious path — add an
`identity.me` tRPC query and consume it via React Query — triggered a
pre-existing brittle `Parameters<typeof trpc.X.useMutation>` inference in
`lib/trpc/hooks.ts`. That file extracts mutation option types from the
AppRouter shape, and adding a new router subtree caused TypeScript to
resolve the mutation signature to something incompatible with the
`Parameters<>` constraint.

Two viable paths for Phase 3:

1. **Fix `hooks.ts` first.** Replace `Parameters<typeof trpc.X.useMutation>[0]`
   with explicit option types (e.g., `UseTRPCMutationOptions<Input, Error, Output>`).
   Then the `identity.me` router can be added without breaking the hook
   file. This is the recommended path.
2. **Use a plain REST `/api/me` handler** instead of a tRPC query, bypassing
   the AppRouter type growth entirely. Faster but introduces a second data
   path for the same thing.

The serialization seam is already in place (`serializeCurrentUser` /
`hydrateCurrentUser` in `core/domain.ts`), so the actual hook implementation
is small once the fetch strategy is unblocked.

## Phase 4 — router ergonomics (future work)

Introduce the `resourceProcedure()` factory described in the RFC. Collapses
the repeating "load row → check ownership → audit → return" pattern in
`mealPlan.ts`, `user.ts`, and `admin.ts`. Measured target: `mealPlan.ts`
handlers drop from ~138 LOC to ~28 LOC across `create`, `getById`, and
`cancel`. Rollout can be per-route; no big-bang.

## Usage (current)

### Server component

```tsx
import { requireUser } from "@/lib/identity/server"

export default async function Dashboard() {
  const me = await requireUser() // redirects to /login if anonymous
  return <h1>Welcome, {me.name}</h1>
}
```

### tRPC procedure (any router)

```ts
import { requirePermission } from "@/lib/trpc/procedures"

export const something = requirePermission("mealplan:write:own")
  .input(z.object({ id: z.string(), ownerId: z.string() }))
  .mutation(({ ctx, input }) => {
    // ctx.me.can(...) is synchronous, ownership-aware
    if (!ctx.me.can("mealplan:write:own", input.ownerId)) throw forbidden()
    // ctx.user, ctx.userRole, ctx.rbac, ctx.audit remain available
    // for backward compatibility with existing routers
  })
```

### Test

```ts
import { resolveCurrentUser } from "@/lib/identity"
import { createTestIdentity } from "@/lib/identity/testing"

const ports = createTestIdentity({
  session: { userId: "u1", userRole: "customer" },
  permissions: {
    customer: ["mealplan:read:own", "mealplan:write:own"],
    admin: ["mealplan:read:all"],
  },
})

const state = await resolveCurrentUser(ports)
// assert against state.user.can(...) without a database or network.
```
