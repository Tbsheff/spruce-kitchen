/**
 * Database-backed Rate Limiting Service
 *
 * Provides distributed rate limiting using PostgreSQL to prevent:
 * - API abuse
 * - Brute force attacks
 * - DDoS attempts
 * - Resource exhaustion
 */

import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/index.ts";
import { rateLimitRecord } from "@/lib/db/schema.ts";

// Rate limit configurations for different actions
const RATE_LIMITS = {
  // Authentication limits
  "auth:login": { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  "auth:signup": { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 signups per hour
  "auth:password_reset": { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 password resets per hour
  "auth:password_validation": { requests: 20, windowMs: 60 * 1000 }, // 20 password validations per minute

  // API endpoints
  "api:general": { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  "api:data_export": { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 data exports per hour
  "api:upload": { requests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute

  // User actions
  "user:profile_update": { requests: 10, windowMs: 60 * 1000 }, // 10 profile updates per minute
  "user:meal_plan_create": { requests: 5, windowMs: 60 * 1000 }, // 5 meal plans per minute

  // Admin actions (more restrictive due to sensitive operations)
  "admin:user_management": { requests: 20, windowMs: 60 * 1000 }, // 20 admin actions per minute
  "admin:system_config": { requests: 10, windowMs: 60 * 1000 }, // 10 system configs per minute
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

// Simple in-memory fallback for when database is unavailable
const memoryFallback = new Map<string, { count: number; resetTime: number }>();

function getFromMemoryFallback(
  identifier: string,
  action: RateLimitAction
): RateLimitResult {
  const config = RATE_LIMITS[action];
  const key = `${identifier}:${action}`;
  const now = Date.now();

  const existing = memoryFallback.get(key);

  if (!existing || now > existing.resetTime) {
    // Reset or create new
    memoryFallback.set(key, { count: 1, resetTime: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: new Date(now + config.windowMs),
      totalRequests: 1,
    };
  }

  if (existing.count >= config.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(existing.resetTime),
      totalRequests: existing.count,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: config.requests - existing.count,
    resetTime: new Date(existing.resetTime),
    totalRequests: existing.count,
  };
}

/**
 * Check if request is allowed under rate limit
 */
export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<RateLimitResult> {
  try {
    const config = RATE_LIMITS[action];
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);

    // Get database instance
    const dbInstance = db();

    // Find existing rate limit record for this window
    const existing = await dbInstance
      .select()
      .from(rateLimitRecord)
      .where(
        and(
          eq(rateLimitRecord.identifier, identifier),
          eq(rateLimitRecord.action, action),
          gte(rateLimitRecord.windowStart, windowStart)
        )
      )
      .orderBy(rateLimitRecord.windowStart)
      .limit(1);

    const resetTime = new Date(now.getTime() + config.windowMs);

    if (existing.length === 0) {
      // No existing record, create new one
      await dbInstance.insert(rateLimitRecord).values({
        id: crypto.randomUUID(),
        identifier,
        action,
        windowStart: now,
        requestCount: 1,
      });

      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime,
        totalRequests: 1,
      };
    }

    const record = existing[0];
    if (!record) {
      throw new Error("rate-limit: record unexpectedly missing after length check");
    }

    // Check if we're still within the same window
    const isWithinWindow =
      record.windowStart.getTime() >= windowStart.getTime();

    if (isWithinWindow) {
      // Within the same window, check if limit exceeded
      if (record.requestCount >= config.requests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(record.windowStart.getTime() + config.windowMs),
          totalRequests: record.requestCount,
        };
      }

      // Increment request count
      const newCount = record.requestCount + 1;
      await dbInstance
        .update(rateLimitRecord)
        .set({
          requestCount: newCount,
          updatedAt: now,
        })
        .where(eq(rateLimitRecord.id, record.id));

      return {
        allowed: true,
        remaining: config.requests - newCount,
        resetTime: new Date(record.windowStart.getTime() + config.windowMs),
        totalRequests: newCount,
      };
    }
    // New window, create new record
    await dbInstance.insert(rateLimitRecord).values({
      id: crypto.randomUUID(),
      identifier,
      action,
      windowStart: now,
      requestCount: 1,
    });

    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime,
      totalRequests: 1,
    };
  } catch (error) {
    console.error(
      "Rate limiting database error, using memory fallback:",
      error
    );
    // Use memory fallback instead of failing open
    return getFromMemoryFallback(identifier, action);
  }
}

/**
 * Middleware wrapper for rate limiting
 */
export async function enforceRateLimit(
  identifier: string,
  action: RateLimitAction,
  customMessage?: string
): Promise<void> {
  const result = await checkRateLimit(identifier, action);

  if (!result.allowed) {
    const config = RATE_LIMITS[action];
    const retryAfter = Math.ceil(
      (result.resetTime.getTime() - Date.now()) / 1000
    );

    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        customMessage ||
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      cause: {
        retryAfter,
        resetTime: result.resetTime,
        limit: config.requests,
        window: config.windowMs,
      },
    });
  }
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  action: RateLimitAction
): Promise<RateLimitResult> {
  try {
    const config = RATE_LIMITS[action];
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);

    const dbInstance = db();

    const existing = await dbInstance
      .select()
      .from(rateLimitRecord)
      .where(
        and(
          eq(rateLimitRecord.identifier, identifier),
          eq(rateLimitRecord.action, action),
          gte(rateLimitRecord.windowStart, windowStart)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return {
        allowed: true,
        remaining: config.requests,
        resetTime: new Date(now.getTime() + config.windowMs),
        totalRequests: 0,
      };
    }

    const record = existing[0];
    if (!record) {
      throw new Error("rate-limit: record unexpectedly missing after length check");
    }
    const isWithinWindow =
      record.windowStart.getTime() >= windowStart.getTime();

    if (isWithinWindow) {
      return {
        allowed: record.requestCount < config.requests,
        remaining: Math.max(0, config.requests - record.requestCount),
        resetTime: new Date(record.windowStart.getTime() + config.windowMs),
        totalRequests: record.requestCount,
      };
    }
    return {
      allowed: true,
      remaining: config.requests,
      resetTime: new Date(now.getTime() + config.windowMs),
      totalRequests: 0,
    };
  } catch (error) {
    console.error("Rate limit status error:", error);
    return {
      allowed: true,
      remaining: 0,
      resetTime: new Date(),
      totalRequests: 0,
    };
  }
}

/**
 * Clean up old rate limit records (call periodically)
 */
export async function cleanupOldRecords(): Promise<void> {
  try {
    const dbInstance = db();
    const maxAge = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    await dbInstance
      .delete(rateLimitRecord)
      .where(lte(rateLimitRecord.createdAt, maxAge));

    console.log("Rate limit cleanup completed");
  } catch (error) {
    console.error("Rate limit cleanup error:", error);
  }
}

/**
 * Reset rate limit for a specific identifier and action (admin function)
 */
export async function resetRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<void> {
  try {
    const dbInstance = db();

    await dbInstance
      .delete(rateLimitRecord)
      .where(
        and(
          eq(rateLimitRecord.identifier, identifier),
          eq(rateLimitRecord.action, action)
        )
      );

    console.log(`Rate limit reset for ${identifier}:${action}`);
  } catch (error) {
    console.error("Rate limit reset error:", error);
    throw new Error("Failed to reset rate limit");
  }
}

/**
 * Get identifier from request context
 */
export function getIdentifier(ctx: {
  req?: Request;
  user?: { id: string } | null;
}): string {
  // Use user ID if authenticated, otherwise fall back to IP
  if (ctx.user?.id) {
    return `user:${ctx.user.id}`;
  }

  // Extract IP address from request headers (Web Fetch Request)
  const forwarded = ctx.req?.headers?.get?.("x-forwarded-for");
  const ip = forwarded ? (forwarded.split(",")[0]?.trim() ?? undefined) : undefined;

  return `ip:${ip || "unknown"}`;
}

/**
 * Backwards-compatible namespace object. Prefer importing the individual
 * functions (`checkRateLimit`, `enforceRateLimit`, etc.) directly; this
 * grouped export exists for call sites that cannot be updated at this time.
 */
export const DatabaseRateLimiter = {
  checkRateLimit,
  enforceRateLimit,
  getRateLimitStatus,
  cleanupOldRecords,
  resetRateLimit,
  getIdentifier,
} as const;

/**
 * Shape of the `cause` attached to a rate-limit TRPCError.
 * Exported for callers that need to read retry metadata from thrown errors.
 */
export interface RateLimitErrorCause {
  limit?: number;
  resetTime?: Date;
  retryAfter?: number;
  window?: number;
}

/**
 * Minimal structural context shape required by the rate-limit middleware.
 * Kept narrow so it composes with tRPC's richer context without leaking
 * implementation details here.
 */
interface RateLimitCtx {
  req?: Request;
  user?: { id: string } | null;
}

/**
 * tRPC middleware for rate limiting.
 *
 * The generic `TNextResult` is threaded through so the surrounding tRPC
 * procedure keeps its inferred result type. We intentionally do not import
 * tRPC middleware types to keep this module low-dependency.
 */
export const rateLimitMiddleware = (action: RateLimitAction) => {
  return async <TNextResult>(opts: {
    ctx: RateLimitCtx;
    next: () => Promise<TNextResult>;
  }): Promise<TNextResult> => {
    const identifier = getIdentifier(opts.ctx);

    await enforceRateLimit(identifier, action);

    return opts.next();
  };
};
