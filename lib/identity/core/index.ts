// Core public surface. Importers outside lib/identity/ should prefer the
// top-level lib/identity entry, which composes adapters.

export type { CurrentUser, CurrentUserState } from "./domain.ts";

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
