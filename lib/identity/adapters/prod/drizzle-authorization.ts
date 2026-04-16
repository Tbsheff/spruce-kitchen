// Production AuthorizationStore backed by Drizzle + Postgres.
// This is the ONLY place in lib/identity/ that imports drizzle-orm or the db.

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { permission, rolePermission } from "@/lib/db/schema"
import type {
  AuthorizationStore,
  Role,
  RoleAuthorization,
} from "@/lib/identity/core/ports"

// Build a request-scoped store. `requestCache` is a simple Map shared across
// one request to avoid refetching the same role's permission set on repeated
// resolve calls within a single HTTP cycle. Pass a fresh Map per request.
export function DrizzleAuthorizationStore(opts: {
  requestCache?: Map<Role, Promise<RoleAuthorization>>
} = {}): AuthorizationStore {
  const cache = opts.requestCache ?? new Map<Role, Promise<RoleAuthorization>>()

  async function fetchForRole(role: Role): Promise<RoleAuthorization> {
    if (!process.env.DATABASE_URL) {
      // Fail closed: with no database, a production deployment cannot
      // authoritatively answer permission questions. Return an empty set
      // rather than a silent fallback matrix. Use StaticAuthorizationStore
      // explicitly in dev/test environments.
      return { role, permissions: new Set() }
    }

    try {
      const dbInstance = db()
      const rows = await dbInstance
        .select({ name: permission.name })
        .from(rolePermission)
        .leftJoin(permission, eq(rolePermission.permissionId, permission.id))
        .where(eq(rolePermission.role, role))

      const names = rows
        .map((row) => row.name)
        .filter((name): name is string => typeof name === "string" && name.length > 0)

      return { role, permissions: new Set(names) }
    } catch (error) {
      console.error("DrizzleAuthorizationStore.fetchForRole failed:", error)
      return { role, permissions: new Set() }
    }
  }

  return {
    getAuthorizationForRole(role: Role): Promise<RoleAuthorization> {
      const cached = cache.get(role)
      if (cached) return cached
      const pending = fetchForRole(role)
      cache.set(role, pending)
      return pending
    },
  }
}
