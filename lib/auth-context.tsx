"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name?: string
  role?: "customer" | "admin" | "super_admin"
}

interface Session {
  id: string
  userId: string
  expiresAt: Date
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (credentials: { email: string; password: string }) => Promise<any>
  signUp: (credentials: { email: string; password: string; name?: string }) => Promise<any>
  signOut: () => Promise<void>
  signOutAll: () => Promise<void>
  updateSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateSession = async () => {
    try {
      // SECURITY: Database is REQUIRED - no bypasses
      if (!process.env.DATABASE_URL) {
        console.error('🚨 Authentication requires database configuration')
        setSession(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      // Only attempt to get session if auth client is available
      const { getSession } = await import("./auth-client")
      const sessionData = await getSession()
      setSession(sessionData.data?.session || null)
      setUser(sessionData.data?.user || null)
    } catch (error) {
      console.error("Failed to get session:", error)
      setSession(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (credentials: { email: string; password: string }) => {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('Database not configured. Please set DATABASE_URL environment variable.')
      }

      // Note: Rate limiting is now handled server-side via API calls
      // Client-side auth doesn't need direct database access

      const { signIn } = await import("./auth-client")
      const result = await signIn.email(credentials)
      
      if (result.data?.user) {
        setUser(result.data.user)
        // Get session after successful login
        await updateSession()
      }
      
      return result
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signUp = async (credentials: { email: string; password: string; name?: string }) => {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('Database not configured. Please set DATABASE_URL environment variable.')
      }

      // Note: Rate limiting is now handled server-side via API calls
      // Client-side auth doesn't need direct database access

      const { signUp } = await import("./auth-client")
      const result = await signUp.email({
        ...credentials,
        name: credentials.name || "Anonymous User"
      })
      
      if (result.data?.user) {
        setUser(result.data.user)
        // Get session after successful login
        await updateSession()
      }
      
      return result
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (!process.env.DATABASE_URL) {
        // If no database, just clear local state
        setUser(null)
        setSession(null)
        return
      }

      const { signOut } = await import("./auth-client")
      await signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      // Clear local state even if sign out fails
      setUser(null)
      setSession(null)
    }
  }

  const signOutAll = async () => {
    try {
      if (!user || !process.env.DATABASE_URL) {
        setUser(null)
        setSession(null)
        return
      }

      // Use better-auth's native session revocation
      const { authClient } = await import("./auth-client")
      // TODO: Use proper revokeSessions API for better-auth
      // await authClient.revokeSessions({ userId: user.id })
      
      // Then sign out current session
      await signOut()
    } catch (error) {
      console.error('Sign out all failed:', error)
      // Clear local state even if sign out fails
      setUser(null)
      setSession(null)
    }
  }

  useEffect(() => {
    updateSession()
    
    // Let better-auth handle session management automatically
    // Session will auto-refresh based on updateAge (30 minutes)
    // Session will expire based on expiresIn (2 hours)
  }, [])

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signOutAll,
    updateSession,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useUser() {
  const { user, isLoading } = useAuth()
  return { user, isLoading }
}

export function useSession() {
  const { session, isLoading } = useAuth()
  return { session, isLoading }
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login"
    }
  }, [user, isLoading])

  return { user, isLoading }
}
