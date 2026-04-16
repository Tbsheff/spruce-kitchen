"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import Footer from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { authClient } from "@/lib/auth-client.ts";

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; message?: string };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const _router = useRouter();

  const isLoading = submitState.kind === "loading";
  const errorMessage =
    submitState.kind === "error" ? submitState.message : null;
  const successMessage =
    submitState.kind === "success" ? submitState.message : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ kind: "loading" });

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      setSubmitState({
        kind: "success",
        message: "Password reset email sent! Check your inbox.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      setSubmitState({ kind: "error", message });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
            </div>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  type="email"
                  value={email}
                />
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link className="text-primary hover:underline" href="/login">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
