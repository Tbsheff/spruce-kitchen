"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name?: string
  role?: string
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
  updateSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateSession = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_DATABASE_URL && !process.env.DATABASE_URL) {
        setSession(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      // Only attempt to get session if auth client is available
      const { authClient } = await import("./auth-client")
      const sessionData = await authClient.getSession()
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

  const mockSignIn = async (credentials: { email: string; password: string }) => {
    // Simulate successful login for development
    const mockUser: User = {
      id: "mock-user-id",
      email: credentials.email,
      name: "Test User",
      role: "user",
    }
    const mockSession: Session = {
      id: "mock-session-id",
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }

    setUser(mockUser)
    setSession(mockSession)
    return { data: { user: mockUser, session: mockSession } }
  }

  const mockSignUp = async (credentials: { email: string; password: string; name?: string }) => {
    // Simulate successful signup for development
    const mockUser: User = {
      id: "mock-user-id",
      email: credentials.email,
      name: credentials.name || "New User",
      role: "user",
    }
    const mockSession: Session = {
      id: "mock-session-id",
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }

    setUser(mockUser)
    setSession(mockSession)
    return { data: { user: mockUser, session: mockSession } }
  }

  const mockSignOut = async () => {
    setUser(null)
    setSession(null)
  }

  useEffect(() => {
    updateSession()
  }, [])

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
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
