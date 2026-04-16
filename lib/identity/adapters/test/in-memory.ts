// In-memory adapters for tests and local dev without a database.
// These replace the hardcoded mock permission matrix that used to live in
// lib/auth/rbac.ts — now they are explicit test fixtures, not production code.

import type {
  AuditEvent,
  AuditSink,
  AuthorizationStore,
  Clock,
  IdentityProvider,
  RawSession,
  RequestMetadata,
  Role,
  RoleAuthorization,
} from "@/lib/identity/core/ports.ts";

export function InMemoryIdentityProvider(opts: {
  session: RawSession | null;
}): IdentityProvider {
  return {
    async getSession() {
      return opts.session;
    },
  };
}

export function StaticAuthorizationStore(
  seed: Partial<Record<Role, readonly string[]>>
): AuthorizationStore {
  return {
    async getAuthorizationForRole(role: Role): Promise<RoleAuthorization> {
      const list = seed[role] ?? [];
      return { role, permissions: new Set(list) };
    },
  };
}

export type RecordingAuditSink = AuditSink & {
  readonly events: readonly AuditEvent[];
  clear(): void;
};

export function RecordingAuditSink(): RecordingAuditSink {
  const events: AuditEvent[] = [];
  return {
    emit(event: AuditEvent) {
      events.push(event);
    },
    get events() {
      return events;
    },
    clear() {
      events.length = 0;
    },
  };
}

export type FakeClockHandle = Clock & {
  advance(ms: number): void;
  set(ms: number): void;
};

export function FakeClock(opts: { nowMs?: number } = {}): FakeClockHandle {
  let current = opts.nowMs ?? 0;
  return {
    nowMs() {
      return current;
    },
    advance(ms: number) {
      current += ms;
    },
    set(ms: number) {
      current = ms;
    },
  };
}

export function fixedRequestMetadata(
  overrides: Partial<RequestMetadata> = {}
): RequestMetadata {
  return {
    ipAddress: overrides.ipAddress ?? "127.0.0.1",
    userAgent: overrides.userAgent ?? "test-agent",
  };
}
