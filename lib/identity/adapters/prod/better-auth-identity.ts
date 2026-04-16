// Production IdentityProvider backed by Better Auth.
// This is the ONLY place in lib/identity/ that imports better-auth.

import { auth } from "@/lib/auth.ts";
import type {
  IdentityProvider,
  RawSession,
} from "@/lib/identity/core/ports.ts";

type BetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

function toRawSession(result: BetterAuthSession): RawSession | null {
  if (!(result?.session && result.user)) {
    return null;
  }

  const { user, session } = result;
  // Better Auth exposes `role` via additionalFields; it appears as a string on
  // the user object at runtime even though the inferred type may narrow it.
  // Use a type predicate instead of double-casting through `unknown`.
  const role =
    "role" in user && typeof user.role === "string" ? user.role : null;

  return {
    userId: user.id,
    userEmail: user.email,
    userName: user.name ?? null,
    userRole: role,
    expiresAtMs: new Date(session.expiresAt).getTime(),
  };
}

// Build a request-scoped provider. Call per request; do not memoize across requests.
export function BetterAuthIdentityProvider(
  req: Request | { headers: Headers }
): IdentityProvider {
  return {
    async getSession() {
      // Skip the network call entirely when the DB isn't configured — Better
      // Auth requires the adapter to be reachable. Matches the existing
      // behavior in lib/trpc/server.ts.
      if (!process.env.DATABASE_URL) {
        return null;
      }

      try {
        const result = await auth.api.getSession({ headers: req.headers });
        return toRawSession(result);
      } catch (error) {
        console.error("BetterAuthIdentityProvider.getSession failed:", error);
        return null;
      }
    },
  };
}
