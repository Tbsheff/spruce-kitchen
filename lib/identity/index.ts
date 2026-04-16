// Public entry point for the identity module.
//
// Core types and resolver are re-exported as-is; production wiring composes
// the default set of adapters for server use. Client wiring and the
// resourceProcedure tRPC factory ship in later phases.

export type {
  CurrentUser,
  CurrentUserState,
} from "./core/domain.ts";
// biome-ignore lint/performance/noBarrelFile: intentional facade for the identity module boundary
export { canPermission, resolveCurrentUser } from "./core/domain.ts";
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
} from "./core/ports.ts";

import { BetterAuthIdentityProvider } from "./adapters/prod/better-auth-identity.ts";
import { DrizzleAuthorizationStore } from "./adapters/prod/drizzle-authorization.ts";
import { SystemClock } from "./adapters/prod/system-clock.ts";
import type { IdentityPorts, Role, RoleAuthorization } from "./core/ports.ts";

// Build a fresh IdentityPorts for a single server request. Callers should
// invoke this once at context-creation time; the returned ports share a
// request-scoped permission cache so repeated resolveCurrentUser calls within
// the same request avoid duplicate DB hits.
export function createServerIdentityPorts(
  req: Request | { headers: Headers }
): IdentityPorts {
  return {
    identity: BetterAuthIdentityProvider(req),
    authz: DrizzleAuthorizationStore({
      requestCache: new Map<Role, Promise<RoleAuthorization>>(),
    }),
    clock: SystemClock(),
  };
}

// Re-exports for consumers that want to name adapters directly (e.g., when
// wiring an alternate environment or a background job).
export { BetterAuthIdentityProvider } from "./adapters/prod/better-auth-identity.ts";
export { DrizzleAuthorizationStore } from "./adapters/prod/drizzle-authorization.ts";
export { headersRequestMetadata } from "./adapters/prod/request-metadata.ts";
export { SimpleAuditSink } from "./adapters/prod/simple-audit-sink.ts";
export { SystemClock } from "./adapters/prod/system-clock.ts";
