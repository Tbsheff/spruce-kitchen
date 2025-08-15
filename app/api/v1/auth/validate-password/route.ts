import { NextRequest, NextResponse } from "next/server"
import { validatePassword } from "@/lib/security/password-policy"
import { DatabaseRateLimiter } from "@/lib/security/rate-limiting"
import { addVersionHeaders } from "@/lib/middleware/api-versioning"

/**
 * API v1 Password Validation Endpoint
 * Validates password strength against security policy
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for password validation attempts
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    const rateLimitResult = await DatabaseRateLimiter.checkRateLimit(
      clientIP,
      'auth:password_validation'
    )
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Too many validation attempts",
          message: "Please wait before trying again",
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { password, email, name } = body

    if (!password || typeof password !== 'string') {
      return addVersionHeaders(
        NextResponse.json(
          { 
            error: "Invalid input",
            message: "Password is required"
          },
          { status: 400 }
        ),
        "v1"
      )
    }

    // Validate password
    const result = validatePassword(password, { email, name })

    return addVersionHeaders(
      NextResponse.json({
        isValid: result.isValid,
        strength: result.strength,
        score: result.score,
        errors: result.errors,
        requirements: result.isValid ? [] : [
          "At least 12 characters long",
          "At least one uppercase letter (A-Z)",
          "At least one lowercase letter (a-z)",
          "At least one number (0-9)",
          "At least one special character (!@#$%^&*)",
          "Cannot be a common password",
          "Should not contain personal information"
        ]
      }),
      "v1"
    )
  } catch (error) {
    console.error("Password validation API error:", error)
    return addVersionHeaders(
      NextResponse.json(
        { 
          error: "Internal server error",
          message: "Password validation failed"
        },
        { status: 500 }
      ),
      "v1"
    )
  }
}