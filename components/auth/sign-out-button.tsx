"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function SignOutButton({ variant = "ghost", size = "default", className }: SignOutButtonProps) {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleSignOut} disabled={isLoading} className={className}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {size !== "sm" && <span className="ml-2">Sign Out</span>}
    </Button>
  )
}
