// Pure domain. Imports types only — no React, Next, Better Auth, Drizzle, or Postgres.
// Every function here must be safe to unit-test with in-memory adapters.

import type { IdentityPorts, Permission, Role } from "./ports"

export type CurrentUserState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: CurrentUser }

export interface CurrentUser {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly role: Role
  readonly permissions: ReadonlySet<Permission>
  // Synchronous check. Resource-aware: pass resourceOwnerId for :own resolution.
  can(permission: Permission, resourceOwnerId?: string): boolean
  isAdmin(): boolean
  isSuperAdmin(): boolean
}

const VALID_ROLES: readonly Role[] = ["customer", "admin", "super_admin"]

function normalizeRole(value: string | null | undefined): Role {
  return VALID_ROLES.includes(value as Role) ? (value as Role) : "customer"
}

// Ownership-aware permission check. Rules:
//   1. Exact match on a non-:own permission → allowed.
//   2. Exact :own match and (no resource || caller owns resource) → allowed.
//   3. Non-owner or missing :own grant → check the :all elevation.
// Nothing else grants access.
export function canPermission(
  owned: ReadonlySet<Permission>,
  callerId: string,
  permission: Permission,
  resourceOwnerId?: string,
): boolean {
  const hasExact = owned.has(permission)
  const isOwnPermission = permission.endsWith(":own")

  if (hasExact) {
    if (!isOwnPermission) return true
    if (resourceOwnerId === undefined) return true
    if (resourceOwnerId === callerId) return true
  }

  // Elevation: :own → :all. Applies when either the caller lacks :own, or the
  // resource is owned by someone else.
  if (isOwnPermission) {
    const elevated: Permission = permission.slice(0, -":own".length) + ":all"
    if (owned.has(elevated)) return true
  }

  return false
}

function makeCurrentUser(
  id: string,
  email: string,
  name: string | null,
  role: Role,
  permissions: ReadonlySet<Permission>,
): CurrentUser {
  return {
    id,
    email,
    name,
    role,
    permissions,
    can(permission, resourceOwnerId) {
      return canPermission(permissions, id, permission, resourceOwnerId)
    },
    isAdmin() {
      return role === "admin" || role === "super_admin"
    },
    isSuperAdmin() {
      return role === "super_admin"
    },
  }
}

// Entry point. Pure function of its ports. No caching, no globals.
// Callers that need per-request memoization should wrap this in
// React.cache or an equivalent at the adapter layer.
export async function resolveCurrentUser(ports: IdentityPorts): Promise<CurrentUserState> {
  const raw = await ports.identity.getSession()
  if (!raw) return { status: "anonymous" }
  if (raw.expiresAtMs <= ports.clock.nowMs()) return { status: "anonymous" }

  const role = normalizeRole(raw.userRole)
  const { permissions } = await ports.authz.getAuthorizationForRole(role)

  const user = makeCurrentUser(raw.userId, raw.userEmail, raw.userName, role, permissions)
  return { status: "authenticated", user }
}
