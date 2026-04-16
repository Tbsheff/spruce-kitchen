/**
 * Password validation middleware for better-auth
 * Enforces password policy during signup and password changes
 */

import { validatePassword } from "./password-policy.ts";
import { logAudit, logSecurityEvent } from "./simple-audit.ts";

export interface AuthPasswordMiddleware {
  validatePasswordChange: (params: {
    userId: string;
    oldPassword: string;
    newPassword: string;
    email?: string;
    name?: string;
    ip?: string;
    userAgent?: string;
  }) => Promise<{ success: boolean; errors: string[] }>;
  validateSignupPassword: (params: {
    password: string;
    email?: string;
    name?: string;
    ip?: string;
    userAgent?: string;
  }) => Promise<{ success: boolean; errors: string[] }>;
}

export const authPasswordMiddleware: AuthPasswordMiddleware = {
  /**
   * Validate password during signup
   */
  async validateSignupPassword({ password, email, name, ip, userAgent }) {
    try {
      // Conditionally include email/name so the call site matches the
      // `{ email?: string; name?: string }` signature under exactOptionalPropertyTypes.
      const result = validatePassword(password, {
        ...(email !== undefined && { email }),
        ...(name !== undefined && { name }),
      });

      if (!result.isValid) {
        // Log failed password policy validation
        await logSecurityEvent(
          "suspicious_activity",
          undefined, // No user ID yet since signup failed
          {
            event: "weak_password_attempt",
            strength: result.strength,
            score: result.score,
            errors: result.errors,
            email: email ? `${email.slice(0, 3)}***` : null, // Partially obscure email for privacy
          },
          ip || "unknown",
          userAgent || "unknown"
        );

        return {
          success: false,
          errors: result.errors,
        };
      }

      // Log successful password validation (for security monitoring)
      await logAudit({
        userId: null,
        action: "auth:password_policy_validated",
        resource: "user",
        resourceId: null,
        details: {
          strength: result.strength,
          score: result.score,
          context: "signup",
        },
        ipAddress: ip ?? null,
        userAgent: userAgent ?? null,
      });

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      console.error("Password validation error:", error);
      return {
        success: false,
        errors: ["Password validation failed. Please try again."],
      };
    }
  },

  /**
   * Validate password during password change
   */
  async validatePasswordChange({
    userId,
    oldPassword,
    newPassword,
    email,
    name,
    ip,
    userAgent,
  }) {
    try {
      // Validate new password strength (see comment above for conditional spread).
      const result = validatePassword(newPassword, {
        ...(email !== undefined && { email }),
        ...(name !== undefined && { name }),
      });

      if (!result.isValid) {
        // Log failed password change attempt
        await logSecurityEvent(
          "suspicious_activity",
          userId,
          {
            event: "weak_password_change_attempt",
            strength: result.strength,
            score: result.score,
            errors: result.errors,
          },
          ip || "unknown",
          userAgent || "unknown"
        );

        return {
          success: false,
          errors: result.errors,
        };
      }

      // Check if new password is the same as old password
      if (oldPassword === newPassword) {
        await logSecurityEvent(
          "suspicious_activity",
          userId,
          {
            event: "password_reuse_attempt",
          },
          ip || "unknown",
          userAgent || "unknown"
        );

        return {
          success: false,
          errors: ["New password must be different from your current password"],
        };
      }

      // Log successful password change validation
      await logAudit({
        userId,
        action: "auth:password_change_validated",
        resource: "user",
        resourceId: userId,
        details: {
          strength: result.strength,
          score: result.score,
        },
        ipAddress: ip ?? null,
        userAgent: userAgent ?? null,
      });

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      console.error("Password change validation error:", error);
      return {
        success: false,
        errors: ["Password validation failed. Please try again."],
      };
    }
  },
};

/**
 * Helper function to get client IP and User-Agent from request
 */
export function getClientInfo(request?: Request) {
  if (!request) {
    return { ip: "unknown", userAgent: "unknown" };
  }

  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ip, userAgent };
}
