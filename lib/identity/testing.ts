// Test-only entry point. Production code MUST NOT import from this file.
//
// Exposes in-memory adapters and a convenience builder for wiring up a
// CurrentUser-ready IdentityPorts in unit tests or local development.

import {
  FakeClock,
  InMemoryIdentityProvider,
  StaticAuthorizationStore,
} from "./adapters/test/in-memory.ts";
import type {
  IdentityPorts,
  Permission,
  RawSession,
  Role,
} from "./core/ports.ts";

export type {
  FakeClockHandle,
  RecordingAuditSink as RecordingAuditSinkType,
} from "./adapters/test/in-memory.ts";
export {
  FakeClock,
  fixedRequestMetadata,
  InMemoryIdentityProvider,
  RecordingAuditSink,
  StaticAuthorizationStore,
} from "./adapters/test/in-memory.ts";

// Convenience builder. Pass a session description and a permission map; get
// back a fully wired IdentityPorts ready to pass to resolveCurrentUser.
export function createTestIdentity(opts: {
  session?: Partial<RawSession> | null;
  permissions?: Partial<Record<Role, readonly Permission[]>>;
  nowMs?: number;
}): IdentityPorts {
  const session: RawSession | null =
    opts.session === null
      ? null
      : {
          userId: opts.session?.userId ?? "test-user",
          userEmail: opts.session?.userEmail ?? "test@example.com",
          userName: opts.session?.userName ?? null,
          userRole: opts.session?.userRole ?? "customer",
          expiresAtMs:
            opts.session?.expiresAtMs ?? (opts.nowMs ?? 0) + 60 * 60 * 1000,
        };

  return {
    identity: InMemoryIdentityProvider({ session }),
    authz: StaticAuthorizationStore(opts.permissions ?? {}),
    clock: FakeClock({ nowMs: opts.nowMs ?? 0 }),
  };
}
