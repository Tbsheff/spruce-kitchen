// Ports: interfaces this module depends on. No implementations live here.
// The core imports only types from this file. Adapters (prod / test) implement these.

export type Role = "customer" | "admin" | "super_admin";

// A permission name follows the convention "resource:action[:scope]"
// e.g., "mealplan:read:own", "admin:dashboard", "user:write:all"
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
  details?: Record<string, unknown>;
  ipAddress?: string;
  resource: string;
  resourceId?: string;
  userAgent?: string;
  userId?: string;
}

export interface IdentityProvider {
  // Returns the raw session for this request, or null if anonymous.
  getSession(): Promise<RawSession | null>;
}

export interface AuthorizationStore {
  // Fetches the permission set for a role. Called at most once per request.
  getAuthorizationForRole(role: Role): Promise<RoleAuthorization>;
}

export interface AuditSink {
  // Fire-and-forget by contract. Implementations may be async internally.
  emit(event: AuditEvent): void;
}

export interface Clock {
  nowMs(): number;
}

// All ports a resolver needs. RequestMetadata and AuditSink are not required
// for resolution itself; they enter at the call site where they apply.
export interface IdentityPorts {
  authz: AuthorizationStore;
  clock: Clock;
  identity: IdentityProvider;
}
