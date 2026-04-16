// A JSON-serializable value that may appear in an AuditEvent's `details` map.
// The set is intentionally narrow — audit sinks persist these values, so
// arbitrary/unknown shapes are rejected at the type level. Callers that hold
// genuinely unstructured data should shape or stringify it at the source.
//
// `undefined` is permitted because `JSON.stringify` drops keys whose value is
// `undefined` — callers can forward Zod-parsed objects with optional fields
// without littering call sites with `?? null` conversions. Shape aligns with
// `lib/types/audit.ts`'s `AuditDetailValue` so a port-typed `AuditDetails`
// flows into the downstream audit sink without needing a cast.
export type AuditValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AuditValue[]
  | { [key: string]: AuditValue };

export interface AuditDetails {
  [key: string]: AuditValue;
}

// Runtime guard for AuditDetails. Pragmatic: validates only the top level
// (plain, non-array object). Nested values are trusted once the outer shape
// passes — deep validation would require walking every key recursively and
// would not meaningfully harden the audit pipeline.
export function isAuditDetails(v: unknown): v is AuditDetails {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export type Role = "customer" | "admin" | "super_admin";

export type Permission = string;

export interface RawSession {
  expiresAtMs: number;
  userEmail: string;
  userId: string;
  userName: string | null;
  userRole: string | null; // untrusted — the domain normalizes to Role
}

export interface RoleAuthorization {
  permissions: ReadonlySet<Permission>;
  role: Role;
}

export interface RequestMetadata {
  ipAddress: string;
  userAgent: string;
}

export interface AuditEvent {
  action: string;
  details?: AuditDetails;
  ipAddress?: string;
  resource: string;
  resourceId?: string;
  userAgent?: string;
  userId?: string;
}

export interface IdentityProvider {
  getSession(): Promise<RawSession | null>;
}

export interface AuthorizationStore {
  getAuthorizationForRole(role: Role): Promise<RoleAuthorization>;
}

export interface AuditSink {
  emit(event: AuditEvent): void;
}

export interface Clock {
  nowMs(): number;
}

export interface IdentityPorts {
  authz: AuthorizationStore;
  clock: Clock;
  identity: IdentityProvider;
}
