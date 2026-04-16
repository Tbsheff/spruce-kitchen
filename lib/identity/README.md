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
  testing.ts      # createTestIdentity() + in-memory re-exports
```

## Invariants

1. `core/` imports only types. No React, Next, Better Auth, Drizzle, or
   Postgres. (An ESLint `no-restricted-imports` rule enforcing this is a
   follow-up — see RFC non-goals.)
2. Production code must not import from `lib/identity/testing`.
3. `resolveCurrentUser` is a pure function of its ports. Memoization belongs
   at the wiring layer (`createServerIdentityPorts` shares a request-scoped
   Map; server helpers can wrap in `React.cache` per request).

## Phase status

- **Phase 1 (done):** core + adapters + testing helper land as pure
  additions. No existing file is modified. No callers migrate yet. The old
  `RBACService`, `AuthGuard`, `useAuth`, and tRPC auth middleware continue
  to work unchanged.
- **Phase 2:** wire `ctx.currentUser` into tRPC context, introduce
  `resourceProcedure()` factory, migrate `mealPlan` and `user` routers.
- **Phase 3:** migrate client-side — replace `auth-context.tsx` consumers
  with `useCurrentUser()`, delete `AuthGuard`, `useRequireAuth`,
  `RBACService`, and the hardcoded mock permission matrix.

## Usage (after wiring)

### Server (tRPC procedure)

```ts
import { resolveCurrentUser, createServerIdentityPorts } from "@/lib/identity"

const ports = createServerIdentityPorts(req)
const me = await resolveCurrentUser(ports)
if (me.status !== "authenticated") throw unauthorized()
if (!me.user.can("mealplan:write:own", plan.userId)) throw forbidden()
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
