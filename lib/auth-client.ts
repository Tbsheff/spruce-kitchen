import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Re-export the canonical types so client-side imports stay stable. Source
// of truth is the Drizzle schema via lib/types/auth.ts — Better Auth's
// `$Infer.Session.user` drops DB fields in some inference contexts.
export type { Session, User } from "@/lib/types/auth.ts";
