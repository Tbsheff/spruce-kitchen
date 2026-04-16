"use client";

import { AlertCircle, Eye, EyeOff } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
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
import type { PasswordValidationResult } from "@/lib/security/password-policy.ts";
import { validatePassword } from "@/lib/security/password-policy.ts";

type PasswordStrength = PasswordValidationResult["strength"];

const PASSWORD_STRENGTH_TEXT_COLOR: Record<PasswordStrength, string> = {
  weak: "text-red-600",
  fair: "text-orange-600",
  good: "text-blue-600",
  strong: "text-green-600",
};

const PASSWORD_STRENGTH_BAR: Record<PasswordStrength, string> = {
  weak: "w-1/4 bg-red-500",
  fair: "w-2/4 bg-orange-500",
  good: "w-3/4 bg-blue-500",
  strong: "w-full bg-green-500",
};

interface FormData {
  agreeToTerms: boolean;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  marketingEmails: boolean;
  password: string;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; message?: string };

export default function SignUpClientPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidationResult | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    marketingEmails: false,
  });

  const { signUp } = useAuth();
  const router = useRouter();

  const isLoading = submitState.kind === "loading";
  const errorMessage =
    submitState.kind === "error" ? submitState.message : null;

  function handleInputChange<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ): void {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Validate password on change
  useEffect(() => {
    if (formData.password) {
      const result = validatePassword(formData.password, {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      });
      setPasswordValidation(result);
    } else {
      setPasswordValidation(null);
    }
  }, [
    formData.password,
    formData.email,
    formData.firstName,
    formData.lastName,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ kind: "loading" });

    // Validate password policy
    if (passwordValidation && !passwordValidation.isValid) {
      setSubmitState({
        kind: "error",
        message: `Password does not meet requirements: ${passwordValidation.errors.join(", ")}`,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitState({ kind: "error", message: "Passwords do not match" });
      return;
    }

    if (!formData.agreeToTerms) {
      setSubmitState({
        kind: "error",
        message: "You must agree to the Terms of Service and Privacy Policy",
      });
      return;
    }

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
      });

      if (result.error) {
        setSubmitState({
          kind: "error",
          message: result.error.message || "Sign up failed. Please try again.",
        });
      } else {
        setSubmitState({ kind: "success" });
        // Redirect to onboarding
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err) {
      setSubmitState({
        kind: "error",
        message: "An unexpected error occurred. Please try again.",
      });
      console.error("Sign up error:", err);
    }
  };

  const handleSocialSignUp = (provider: "google" | "facebook") => {
    try {
      setSubmitState({ kind: "loading" });

      // TODO: Fix social signup with new better-auth API
      setSubmitState({
        kind: "error",
        message: `${provider} signup not yet implemented with new auth system`,
      });
    } catch (err) {
      setSubmitState({
        kind: "error",
        message: `${provider} sign up failed. Please try again.`,
      });
      console.error(`${provider} sign up error:`, err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="my-[11px] flex min-h-[calc(100vh-200px)] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center font-bold text-2xl">
                Create Account
              </CardTitle>
              <CardDescription className="text-center">
                Join Spruce Kitchen Meals and start enjoying chef-crafted meals
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      disabled={isLoading}
                      id="firstName"
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="John"
                      required
                      type="text"
                      value={formData.firstName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      disabled={isLoading}
                      id="lastName"
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Doe"
                      required
                      type="text"
                      value={formData.lastName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    disabled={isLoading}
                    id="email"
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      className="pr-10"
                      disabled={isLoading}
                      id="password"
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Create a strong password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                    />
                    <Button
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      disabled={isLoading}
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

                  {/* Password Strength Indicator */}
                  {passwordValidation && formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Password Strength:
                        </span>
                        <span
                          className={`font-medium text-sm ${PASSWORD_STRENGTH_TEXT_COLOR[passwordValidation.strength]}`}
                        >
                          {passwordValidation.strength.toUpperCase()}
                        </span>
                      </div>

                      {/* Strength Bar */}
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${PASSWORD_STRENGTH_BAR[passwordValidation.strength]}`}
                        />
                      </div>

                      {/* Requirements List */}
                      {!passwordValidation.isValid && (
                        <div className="mt-2">
                          <p className="mb-1 text-gray-600 text-sm">
                            Password must include:
                          </p>
                          <ul className="space-y-1 text-gray-500 text-xs">
                            <li
                              className={
                                passwordValidation.errors.some((e) =>
                                  e.includes("12 characters")
                                )
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              ✓ At least 12 characters long
                            </li>
                            <li
                              className={
                                passwordValidation.errors.some((e) =>
                                  e.includes("uppercase")
                                )
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              ✓ At least one uppercase letter (A-Z)
                            </li>
                            <li
                              className={
                                passwordValidation.errors.some((e) =>
                                  e.includes("lowercase")
                                )
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              ✓ At least one lowercase letter (a-z)
                            </li>
                            <li
                              className={
                                passwordValidation.errors.some((e) =>
                                  e.includes("number")
                                )
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              ✓ At least one number (0-9)
                            </li>
                            <li
                              className={
                                passwordValidation.errors.some((e) =>
                                  e.includes("special character")
                                )
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              ✓ At least one special character (!@#$%^&*)
                            </li>
                            <li
                              className={
                                passwordValidation.errors.some((e) =>
                                  e.includes("common")
                                )
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              ✓ Cannot be a common password
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      className="pr-10"
                      disabled={isLoading}
                      id="confirmPassword"
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirm your password"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                    />
                    <Button
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      disabled={isLoading}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.agreeToTerms}
                    disabled={isLoading}
                    id="terms"
                    onCheckedChange={(checked) =>
                      handleInputChange("agreeToTerms", checked === true)
                    }
                    required
                  />
                  <Label className="text-sm" htmlFor="terms">
                    I agree to the{" "}
                    <Link
                      className="text-primary hover:underline"
                      href="/terms-of-service"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      className="text-primary hover:underline"
                      href="/privacy-policy"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.marketingEmails}
                    disabled={isLoading}
                    id="marketing"
                    onCheckedChange={(checked) =>
                      handleInputChange("marketingEmails", checked === true)
                    }
                  />
                  <Label className="text-sm" htmlFor="marketing">
                    Send me updates about new meals and special offers
                  </Label>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
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
                  disabled={isLoading}
                  onClick={() => handleSocialSignUp("google")}
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
                  disabled={isLoading}
                  onClick={() => handleSocialSignUp("facebook")}
                  variant="outline"
                >
                  <svg
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 fill-[#1877F2]"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </CardContent>

            <CardFooter>
              <p className="w-full text-center text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link
                  className="font-medium text-primary hover:underline"
                  href="/login"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
