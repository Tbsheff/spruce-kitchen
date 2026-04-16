import type { Role as DbRole, User as DbUser } from "@/lib/db/schema.ts";

/**
 * Canonical User type for the entire app. Derived from the Drizzle schema,
 * which is the single source of truth for user shape — Better Auth persists
 * into the same `user` table, so runtime shape matches.
 *
 * Prefer this over `typeof auth.$Infer.Session.user` or a locally declared
 * interface: Better Auth's inferred type is sometimes narrower than what the
 * DB actually stores (missing fields like `image`/`role` in some contexts),
 * and local interfaces inevitably drift.
 */
export type User = DbUser;

/**
 * Canonical Session type. Matches the `session` table shape.
 */
export interface Session {
  createdAt: Date;
  expiresAt: Date;
  id: string;
  ipAddress: string | null;
  token: string;
  updatedAt: Date;
  userAgent: string | null;
  userId: string;
}

/**
 * Envelope returned by `getSession()` / stored in the client auth context.
 */
export interface AuthSessionSnapshot {
  session: Session;
  user: User;
}

export type Role = DbRole;
