// Core public surface. Importers outside lib/identity/ should prefer the
// top-level lib/identity entry, which composes adapters.

export type { CurrentUser, CurrentUserState } from "./domain.ts";

// biome-ignore lint/performance/noBarrelFile: intentional facade for the identity core module boundary
export { canPermission, resolveCurrentUser } from "./domain.ts";
export type {
  AuditEvent,
  AuditSink,
  AuthorizationStore,
  Clock,
  IdentityPorts,
  IdentityProvider,
  Permission,
  RawSession,
  RequestMetadata,
  Role,
  RoleAuthorization,
} from "./ports.ts";
