import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addVersionHeaders } from "@/lib/middleware/api-versioning.ts";
import { validatePassword } from "@/lib/security/password-policy.ts";
import { DatabaseRateLimiter } from "@/lib/security/rate-limiting.ts";

/**
 * API v1 Password Validation Endpoint
 * Validates password strength against security policy
 */

/** Successful validation response from `POST /api/v1/auth/validate-password`. */
export interface PasswordValidationOkResponse {
  errors: string[];
  isValid: boolean;
  requirements: string[];
  score: number;
  strength: "weak" | "fair" | "good" | "strong";
}

/** Error response shape (rate limit, invalid input, or internal error). */
export interface PasswordValidationErrorResponse {
  error: string;
  message?: string;
  resetTime?: number;
  valid?: boolean;
}

/** Union of every response shape this route may return. */
export type PasswordValidationResponse =
  | PasswordValidationOkResponse
  | PasswordValidationErrorResponse;

const BodySchema = z.object({
  password: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for password validation attempts
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await DatabaseRateLimiter.checkRateLimit(
      clientIP,
      "auth:password_validation"
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json<PasswordValidationErrorResponse>(
        {
          error: "Too many validation attempts",
          message: "Please wait before trying again",
          resetTime:
            rateLimitResult.resetTime instanceof Date
              ? rateLimitResult.resetTime.getTime()
              : rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    const raw: unknown = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json<PasswordValidationErrorResponse>(
        { valid: false, error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { password, email, name } = parsed.data;

    // Validate password. Build userInfo object conditionally so
    // `exactOptionalPropertyTypes` is not violated by explicit `undefined`.
    const userInfo: { email?: string; name?: string } = {};
    if (email !== undefined) {
      userInfo.email = email;
    }
    if (name !== undefined) {
      userInfo.name = name;
    }
    const result = validatePassword(password, userInfo);

    return addVersionHeaders(
      NextResponse.json<PasswordValidationOkResponse>({
        isValid: result.isValid,
        strength: result.strength,
        score: result.score,
        errors: result.errors,
        requirements: result.isValid
          ? []
          : [
              "At least 12 characters long",
              "At least one uppercase letter (A-Z)",
              "At least one lowercase letter (a-z)",
              "At least one number (0-9)",
              "At least one special character (!@#$%^&*)",
              "Cannot be a common password",
              "Should not contain personal information",
            ],
      }),
      "v1"
    );
  } catch (error) {
    console.error("Password validation API error:", error);
    return addVersionHeaders(
      NextResponse.json<PasswordValidationErrorResponse>(
        {
          error: "Internal server error",
          message: "Password validation failed",
        },
        { status: 500 }
      ),
      "v1"
    );
  }
}
