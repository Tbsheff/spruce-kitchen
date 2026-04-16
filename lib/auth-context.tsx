"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@/lib/types/auth.ts";

// Better Auth's sign-in/up results carry more fields than we need (redirect,
// token, url, etc). We keep the return type loose here and narrow at call
// sites that actually care — consumers mostly just check `error`.
interface AuthResult {
  data?: unknown;
  error?: { message?: string; code?: string } | null;
}

interface AuthContextType {
  isLoading: boolean;
  session: Session | null;
  signIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<void>;
  signUp: (credentials: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<AuthResult>;
  updateSession: () => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type SessionShape = Pick<
  Session,
  | "id"
  | "expiresAt"
  | "token"
  | "createdAt"
  | "updatedAt"
  | "userId"
  | "ipAddress"
  | "userAgent"
>;
type SessionCandidate = {
  [Key in keyof SessionShape]?: SessionShape[Key] | string | null;
};

type UserShape = Pick<
  User,
  | "id"
  | "email"
  | "emailVerified"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "image"
  | "role"
>;
type UserCandidate = {
  [Key in keyof UserShape]?: UserShape[Key] | string | null;
};

function readDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function toCanonicalSession(value: unknown): Session | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const candidate = value as SessionCandidate;
  const expiresAt = readDate(candidate.expiresAt);
  const createdAt = readDate(candidate.createdAt);
  const updatedAt = readDate(candidate.updatedAt);
  if (
    typeof candidate.id !== "string" ||
    expiresAt === null ||
    typeof candidate.token !== "string" ||
    createdAt === null ||
    updatedAt === null ||
    typeof candidate.userId !== "string"
  ) {
    return null;
  }
  return {
    id: candidate.id,
    expiresAt,
    token: candidate.token,
    createdAt,
    updatedAt,
    userId: candidate.userId,
    ipAddress:
      typeof candidate.ipAddress === "string" ? candidate.ipAddress : null,
    userAgent:
      typeof candidate.userAgent === "string" ? candidate.userAgent : null,
  };
}

function toCanonicalUser(value: unknown): User | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const candidate = value as UserCandidate;
  const createdAt = readDate(candidate.createdAt);
  const updatedAt = readDate(candidate.updatedAt);
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.email !== "string" ||
    typeof candidate.emailVerified !== "boolean" ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null;
  }
  return {
    id: candidate.id,
    email: candidate.email,
    emailVerified: candidate.emailVerified,
    createdAt,
    updatedAt,
    name: typeof candidate.name === "string" ? candidate.name : "",
    image: typeof candidate.image === "string" ? candidate.image : null,
    role:
      candidate.role === "admin" || candidate.role === "super_admin"
        ? candidate.role
        : "customer",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateSession = useCallback(async () => {
    try {
      // SECURITY: Database is REQUIRED - no bypasses
      if (!process.env.DATABASE_URL) {
        console.error("🚨 Authentication requires database configuration");
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Only attempt to get session if auth client is available
      const { getSession } = await import("./auth-client.ts");
      const sessionData = await getSession();
      // Better Auth's inferred session/user omits a few fields (ipAddress
      // null-vs-undefined, role) that our canonical DB-derived types declare.
      // Validate the runtime payload with adapters — the DB row is the
      // source of truth, but we defensively shape-check before using it.
      const data: unknown = sessionData.data;
      const rawSession =
        typeof data === "object" && data !== null && "session" in data
          ? data.session
          : null;
      const rawUser =
        typeof data === "object" && data !== null && "user" in data
          ? data.user
          : null;
      setSession(toCanonicalSession(rawSession));
      setUser(toCanonicalUser(rawUser));
    } catch (error) {
      console.error("Failed to get session:", error);
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (credentials: { email: string; password: string }) => {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error(
          "Database not configured. Please set DATABASE_URL environment variable."
        );
      }

      // Note: Rate limiting is now handled server-side via API calls
      // Client-side auth doesn't need direct database access

      const { signIn } = await import("./auth-client.ts");
      const result = await signIn.email(credentials);

      if (result.data?.user) {
        const canonical = toCanonicalUser(result.data.user);
        if (canonical !== null) {
          setUser(canonical);
        }
        // Get session after successful login
        await updateSession();
      }

      return result;
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signUp = async (credentials: {
    email: string;
    password: string;
    name?: string;
  }) => {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error(
          "Database not configured. Please set DATABASE_URL environment variable."
        );
      }

      // Note: Rate limiting is now handled server-side via API calls
      // Client-side auth doesn't need direct database access

      const { signUp } = await import("./auth-client.ts");
      const result = await signUp.email({
        ...credentials,
        name: credentials.name || "Anonymous User",
      });

      if (result.data?.user) {
        const canonical = toCanonicalUser(result.data.user);
        if (canonical !== null) {
          setUser(canonical);
        }
        // Get session after successful login
        await updateSession();
      }

      return result;
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (!process.env.DATABASE_URL) {
        // If no database, just clear local state
        setUser(null);
        setSession(null);
        return;
      }

      const { signOut } = await import("./auth-client.ts");
      await signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Sign out failed:", error);
      // Clear local state even if sign out fails
      setUser(null);
      setSession(null);
    }
  };

  const signOutAll = async () => {
    try {
      if (!(user && process.env.DATABASE_URL)) {
        setUser(null);
        setSession(null);
        return;
      }

      // Revoke every session for this user via better-auth, then sign
      // out the current one so local state is also cleared.
      const { authClient } = await import("./auth-client.ts");
      await authClient.revokeSessions();
      await signOut();
    } catch (error) {
      console.error("Sign out all failed:", error);
      // Clear local state even if sign out fails
      setUser(null);
      setSession(null);
    }
  };

  useEffect(() => {
    updateSession();

    // Let better-auth handle session management automatically
    // Session will auto-refresh based on updateAge (30 minutes)
    // Session will expire based on expiresIn (2 hours)
  }, [updateSession]);

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signOutAll,
    updateSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}

export function useSession() {
  const { session, isLoading } = useAuth();
  return { session, isLoading };
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!(isLoading || user)) {
      window.location.href = "/login";
    }
  }, [user, isLoading]);

  return { user, isLoading };
}
