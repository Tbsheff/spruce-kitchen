"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Eye, EyeOff } from "lucide-react"

type AuthMode = "login" | "signup"

interface AuthCardProps {
  authMode: AuthMode
  email: string
  password: string
  firstName: string
  lastName: string
  isComplete: boolean
  onAuthModeChange: (mode: AuthMode) => void
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onFirstNameChange: (firstName: string) => void
  onLastNameChange: (lastName: string) => void
  onSubmit: () => void
}

export function AuthCard({
  authMode,
  email,
  password,
  firstName,
  lastName,
  isComplete,
  onAuthModeChange,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
}: AuthCardProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card className={`transition-all duration-500 ${isComplete ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
          {isComplete && <span className="text-sm text-green-600 ml-auto">✓ Complete</span>}
        </CardTitle>
        <CardDescription>Create an account or sign in to complete your order.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={authMode === "signup" ? "default" : "outline"}
            onClick={() => onAuthModeChange("signup")}
            className="flex-1"
            disabled={isComplete}
          >
            Create Account
          </Button>
          <Button
            variant={authMode === "login" ? "default" : "outline"}
            onClick={() => onAuthModeChange("login")}
            className="flex-1"
            disabled={isComplete}
          >
            Sign In
          </Button>
        </div>

        {authMode === "signup" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                placeholder="John"
                disabled={isComplete}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                placeholder="Doe"
                disabled={isComplete}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="john@example.com"
            disabled={isComplete}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              disabled={isComplete}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isComplete}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {!isComplete && (
          <Button onClick={onSubmit} className="w-full bg-primary hover:bg-primary/90">
            {authMode === "login" ? "Sign In" : "Create Account"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
