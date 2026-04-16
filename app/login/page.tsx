"use client";

import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useAuth } from "@/lib/auth-context.tsx";

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; message?: string };

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/onboarding";

  const isLoading = submitState.kind === "loading";
  const errorMessage =
    submitState.kind === "error" ? submitState.message : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ kind: "loading" });

    try {
      const result = await signIn({
        email,
        password,
      });

      if (result.error) {
        setSubmitState({
          kind: "error",
          message: result.error.message || "Login failed. Please try again.",
        });
      } else {
        setSubmitState({ kind: "success" });
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      setSubmitState({
        kind: "error",
        message: "An unexpected error occurred. Please try again.",
      });
      console.error("Login error:", err);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      setSubmitState({ kind: "loading" });

      // TODO: Fix social login with new better-auth API
      setSubmitState({
        kind: "error",
        message: `${provider} login not yet implemented with new auth system`,
      });
    } catch (err) {
      setSubmitState({
        kind: "error",
        message: `${provider} login failed. Please try again.`,
      });
      console.error(`${provider} login error:`, err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          {/* Back to home link */}
          <Link
            className="mt-[7px] mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="font-bold text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your Spruce Kitchen account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      disabled={isLoading}
                      id="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pr-10 pl-10"
                      disabled={isLoading}
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={rememberMe}
                      disabled={isLoading}
                      id="remember"
                      onCheckedChange={(checked) =>
                        setRememberMe(checked === true)
                      }
                    />
                    <Label className="text-sm" htmlFor="remember">
                      Remember me
                    </Label>
                  </div>

                  <Link
                    className="text-primary text-sm transition-colors hover:text-primary/80"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="w-full bg-transparent"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("google")}
                  variant="outline"
                >
                  <svg
                    aria-hidden="true"
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  className="w-full bg-transparent"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("facebook")}
                  variant="outline"
                >
                  <svg
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-muted-foreground text-sm">
                Don't have an account?{" "}
                <Link
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                  href="/signup"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
