import type {
  Role as DbRole,
  Session as DbSession,
  User as DbUser,
} from "@/lib/db/schema.ts";

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
 * Canonical Session type. Derived from the Drizzle `session` table shape so
 * the DB row and app session type cannot drift apart.
 */
export type Session = DbSession;

/**
 * Envelope returned by `getSession()` / stored in the client auth context.
 */
export interface AuthSessionSnapshot {
  session: Session;
  user: User;
}

export type Role = DbRole;
