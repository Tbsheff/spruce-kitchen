"use client";

import { Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

type AuthMode = "login" | "signup";

interface AuthCardProps {
  authMode: AuthMode;
  email: string;
  firstName: string;
  isComplete: boolean;
  lastName: string;
  onAuthModeChange: (mode: AuthMode) => void;
  onEmailChange: (email: string) => void;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
  password: string;
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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card
      className={`transition-all duration-500 ${isComplete ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
          {isComplete && (
            <span className="ml-auto text-green-600 text-sm">✓ Complete</span>
          )}
        </CardTitle>
        <CardDescription>
          Create an account or sign in to complete your order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={isComplete}
            onClick={() => onAuthModeChange("signup")}
            variant={authMode === "signup" ? "default" : "outline"}
          >
            Create Account
          </Button>
          <Button
            className="flex-1"
            disabled={isComplete}
            onClick={() => onAuthModeChange("login")}
            variant={authMode === "login" ? "default" : "outline"}
          >
            Sign In
          </Button>
        </div>

        {authMode === "signup" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                disabled={isComplete}
                id="firstName"
                onChange={(e) => onFirstNameChange(e.target.value)}
                placeholder="John"
                value={firstName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                disabled={isComplete}
                id="lastName"
                onChange={(e) => onLastNameChange(e.target.value)}
                placeholder="Doe"
                value={lastName}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            disabled={isComplete}
            id="email"
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="john@example.com"
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              disabled={isComplete}
              id="password"
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <Button
              className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
              disabled={isComplete}
              onClick={() => setShowPassword(!showPassword)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {!isComplete && (
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={onSubmit}
          >
            {authMode === "login" ? "Sign In" : "Create Account"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
