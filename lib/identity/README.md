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
  trpc/
    resource-procedure.ts  # declarative factory for protected, row-scoped handlers
  client.ts       # useCurrentUser() hook (backed by GET /api/identity/me)
  server.ts       # RSC helpers: currentUser() + requireUser()
  index.ts        # public API + createServerIdentityPorts()
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
| 2.5. Client seam | Done | `ebcddf3` | `serializeCurrentUser` / `hydrateCurrentUser` helpers in domain |
| 3. Client hook | Done | `056482a` | `GET /api/identity/me` + `useCurrentUser()` hook, `AuthGuard` migrated |
| 4. Router ergonomics | Done | `c5fa59f` | `resourceProcedure` factory; `mealPlan.getById/update/cancel` migrated (165 LOC → 49 LOC) |

## RFC substance: delivered

- ✅ Single `CurrentUser` primitive on server and client
- ✅ Synchronous `can(permission, resourceOwnerId?)` with `:own` / `:all` hierarchy built in
- ✅ Ports & adapters architecture: `IdentityProvider`, `AuthorizationStore`, `AuditSink`, `Clock`
- ✅ `RBACService` + hardcoded mock permission matrix deleted
- ✅ `ctx.currentUser` drives all tRPC auth middleware
- ✅ RSC helpers (`currentUser()`, `requireUser()`)
- ✅ Serialization seam for client hydration
- ✅ Client hook (`useCurrentUser`) + `AuthGuard` migration
- ✅ `resourceProcedure` factory with 3 migrated handlers as proof

## Outstanding follow-ups (separate PRs)

### A. Consumer migration — unify client read path

`lib/auth-context.tsx` still maintains its own session state machine and
serves ~15 consumers via `useAuth`, `useUser`, `useSession`,
`useRequireAuth`. These all work; they just go through a different
(still-correct) code path than `useCurrentUser`. To unify:

1. Rewrite `AuthProvider` to internally call `useCurrentUser()` for
   reads, keeping `signIn` / `signUp` / `signOut` / `signOutAll` for
   writes. After a write, call `invalidateCurrentUser()` to force the
   next render to refetch.
2. Add an observable mechanism to `useCurrentUser` so `invalidateCurrentUser()`
   actually triggers a re-render (today it only clears the in-flight
   cache; existing hook instances keep their stale state until unmount).
   Options: module-level `useSyncExternalStore`, or a pub/sub event bus.
3. Migrate consumers from `useAuth()` to `useCurrentUser()` where they
   only need reads. Keep `useAuth()` for pages that need sign-in / sign-out.

Risk: medium. Touches ~15 files. No browser test runner in this project,
so runtime behavior needs manual verification.

### B. Router migration — more `resourceProcedure`

Candidates that fit the factory's shape:

- `user.updateProfile` (ownership via `ctx.user.id === input.userId`)
- `user.updatePreferences` / `updateDeliveryAddress` (self-owned by caller)
- Any admin-scoped read that has a well-defined "row + optional owner" shape

Not candidates (explicit decision):

- `mealPlan.create` — no row to load
- `mealPlan.getUserPlans` — returns a collection, no per-row ownership check
- `mealPlan.createOrder` — cross-resource (loads mealPlan, inserts order)
- Admin list endpoints — access scope is `":all"` not `":own"`

### C. ESLint boundary enforcement

Add `no-restricted-imports` scoped to `lib/identity/core/**` rejecting
any import of `react`, `next/*`, `better-auth`, `drizzle-orm`, and
`postgres`. Today the invariant is documented but unenforced — a
well-meaning future contributor could quietly import React into domain
code and no CI step would flag it.

## Usage

### Server component

```tsx
import { requireUser } from "@/lib/identity/server"

export default async function Dashboard() {
  const me = await requireUser() // redirects to /login if anonymous
  return <h1>Welcome, {me.name}</h1>
}
```

### Client component

```tsx
"use client"
import { useCurrentUser } from "@/lib/identity/client"

export function AdminBadge() {
  const state = useCurrentUser()
  if (state.status !== "authenticated") return null
  return state.user.isAdmin() ? <Badge>Admin</Badge> : null
}
```

### tRPC — resource-scoped handler

```ts
import { resourceProcedure } from "@/lib/identity/trpc/resource-procedure"

export const cancel = resourceProcedure({
  permission: "mealplan:write:own",
  resource: "mealplan",
  action: "cancel",
  input: z.object({ id: z.string() }),
  loadRow: loadMealPlanById, // returns row | null
}).mutation(async ({ input }) => {
  // auth, ownership, NOT_FOUND, and audit are already handled
  await db().update(mealPlan).set({ isActive: false }).where(eq(mealPlan.id, input.id))
  return { success: true }
})
```

### tRPC — non-row handler (direct ctx.me.can)

```ts
import { requirePermission } from "@/lib/trpc/procedures"

export const create = requirePermission("mealplan:write:own")
  .input(z.object({ boxSize: z.enum(["small", "medium"]) }))
  .mutation(({ ctx, input }) => {
    // ctx.me.can(...) is synchronous
    // ctx.user, ctx.userRole, ctx.rbac, ctx.audit are available
    // for backward compatibility.
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
