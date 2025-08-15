/**
 * Database-backed Rate Limiting Service
 * 
 * Provides distributed rate limiting using PostgreSQL to prevent:
 * - API abuse
 * - Brute force attacks
 * - DDoS attempts
 * - Resource exhaustion
 */

import { eq, and, gte, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { rateLimitRecord } from "@/lib/db/schema"
import { TRPCError } from "@trpc/server"

// Rate limit configurations for different actions
const RATE_LIMITS = {
  // Authentication limits
  'auth:login': { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  'auth:signup': { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 signups per hour
  'auth:password_reset': { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 password resets per hour
  'auth:password_validation': { requests: 20, windowMs: 60 * 1000 }, // 20 password validations per minute
  
  // API endpoints
  'api:general': { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  'api:data_export': { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 data exports per hour
  'api:upload': { requests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  
  // User actions
  'user:profile_update': { requests: 10, windowMs: 60 * 1000 }, // 10 profile updates per minute
  'user:meal_plan_create': { requests: 5, windowMs: 60 * 1000 }, // 5 meal plans per minute
  
  // Admin actions (more restrictive due to sensitive operations)
  'admin:user_management': { requests: 20, windowMs: 60 * 1000 }, // 20 admin actions per minute
  'admin:system_config': { requests: 10, windowMs: 60 * 1000 }, // 10 system configs per minute
} as const

export type RateLimitAction = keyof typeof RATE_LIMITS

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  totalRequests: number
}

// Simple in-memory fallback for when database is unavailable
const memoryFallback = new Map<string, { count: number; resetTime: number }>()

function getFromMemoryFallback(identifier: string, action: RateLimitAction): RateLimitResult {
  const config = RATE_LIMITS[action]
  const key = `${identifier}:${action}`
  const now = Date.now()
  
  const existing = memoryFallback.get(key)
  
  if (!existing || now > existing.resetTime) {
    // Reset or create new
    memoryFallback.set(key, { count: 1, resetTime: now + config.windowMs })
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: new Date(now + config.windowMs),
      totalRequests: 1,
    }
  }
  
  if (existing.count >= config.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(existing.resetTime),
      totalRequests: existing.count,
    }
  }
  
  existing.count++
  return {
    allowed: true,
    remaining: config.requests - existing.count,
    resetTime: new Date(existing.resetTime),
    totalRequests: existing.count,
  }
}

export class DatabaseRateLimiter {
  /**
   * Check if request is allowed under rate limit
   */
  static async checkRateLimit(
    identifier: string,
    action: RateLimitAction
  ): Promise<RateLimitResult> {
    try {
      const config = RATE_LIMITS[action]
      const now = new Date()
      const windowStart = new Date(now.getTime() - config.windowMs)
      
      // Get database instance
      const dbInstance = db()
      
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
        .limit(1)
      
      const resetTime = new Date(now.getTime() + config.windowMs)
      
      if (existing.length === 0) {
        // No existing record, create new one
        await dbInstance
          .insert(rateLimitRecord)
          .values({
            id: crypto.randomUUID(),
            identifier,
            action,
            windowStart: now,
            requestCount: 1,
          })
        
        return {
          allowed: true,
          remaining: config.requests - 1,
          resetTime,
          totalRequests: 1,
        }
      }
      
      const record = existing[0]
      
      // Check if we're still within the same window
      const isWithinWindow = record.windowStart.getTime() >= windowStart.getTime()
      
      if (isWithinWindow) {
        // Within the same window, check if limit exceeded
        if (record.requestCount >= config.requests) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: new Date(record.windowStart.getTime() + config.windowMs),
            totalRequests: record.requestCount,
          }
        }
        
        // Increment request count
        const newCount = record.requestCount + 1
        await dbInstance
          .update(rateLimitRecord)
          .set({
            requestCount: newCount,
            updatedAt: now,
          })
          .where(eq(rateLimitRecord.id, record.id))
        
        return {
          allowed: true,
          remaining: config.requests - newCount,
          resetTime: new Date(record.windowStart.getTime() + config.windowMs),
          totalRequests: newCount,
        }
      } else {
        // New window, create new record
        await dbInstance
          .insert(rateLimitRecord)
          .values({
            id: crypto.randomUUID(),
            identifier,
            action,
            windowStart: now,
            requestCount: 1,
          })
        
        return {
          allowed: true,
          remaining: config.requests - 1,
          resetTime,
          totalRequests: 1,
        }
      }
    } catch (error) {
      console.error('Rate limiting database error, using memory fallback:', error)
      // Use memory fallback instead of failing open
      return getFromMemoryFallback(identifier, action)
    }
  }
  
  /**
   * Middleware wrapper for rate limiting
   */
  static async enforceRateLimit(
    identifier: string,
    action: RateLimitAction,
    customMessage?: string
  ): Promise<void> {
    const result = await this.checkRateLimit(identifier, action)
    
    if (!result.allowed) {
      const config = RATE_LIMITS[action]
      const retryAfter = Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
      
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: customMessage || `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        cause: {
          retryAfter,
          resetTime: result.resetTime,
          limit: config.requests,
          window: config.windowMs,
        }
      })
    }
  }
  
  /**
   * Get rate limit status without incrementing
   */
  static async getRateLimitStatus(
    identifier: string,
    action: RateLimitAction
  ): Promise<RateLimitResult> {
    try {
      const config = RATE_LIMITS[action]
      const now = new Date()
      const windowStart = new Date(now.getTime() - config.windowMs)
      
      const dbInstance = db()
      
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
        .limit(1)
      
      if (existing.length === 0) {
        return {
          allowed: true,
          remaining: config.requests,
          resetTime: new Date(now.getTime() + config.windowMs),
          totalRequests: 0,
        }
      }
      
      const record = existing[0]
      const isWithinWindow = record.windowStart.getTime() >= windowStart.getTime()
      
      if (isWithinWindow) {
        return {
          allowed: record.requestCount < config.requests,
          remaining: Math.max(0, config.requests - record.requestCount),
          resetTime: new Date(record.windowStart.getTime() + config.windowMs),
          totalRequests: record.requestCount,
        }
      } else {
        return {
          allowed: true,
          remaining: config.requests,
          resetTime: new Date(now.getTime() + config.windowMs),
          totalRequests: 0,
        }
      }
    } catch (error) {
      console.error('Rate limit status error:', error)
      return {
        allowed: true,
        remaining: 0,
        resetTime: new Date(),
        totalRequests: 0,
      }
    }
  }
  
  /**
   * Clean up old rate limit records (call periodically)
   */
  static async cleanupOldRecords(): Promise<void> {
    try {
      const dbInstance = db()
      const maxAge = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      await dbInstance
        .delete(rateLimitRecord)
        .where(lte(rateLimitRecord.createdAt, maxAge))
      
      console.log('Rate limit cleanup completed')
    } catch (error) {
      console.error('Rate limit cleanup error:', error)
    }
  }
  
  /**
   * Reset rate limit for a specific identifier and action (admin function)
   */
  static async resetRateLimit(
    identifier: string,
    action: RateLimitAction
  ): Promise<void> {
    try {
      const dbInstance = db()
      
      await dbInstance
        .delete(rateLimitRecord)
        .where(
          and(
            eq(rateLimitRecord.identifier, identifier),
            eq(rateLimitRecord.action, action)
          )
        )
      
      console.log(`Rate limit reset for ${identifier}:${action}`)
    } catch (error) {
      console.error('Rate limit reset error:', error)
      throw new Error('Failed to reset rate limit')
    }
  }
  
  /**
   * Get identifier from request context
   */
  static getIdentifier(ctx: { req?: any, user?: { id: string } }): string {
    // Use user ID if authenticated, otherwise fall back to IP
    if (ctx.user?.id) {
      return `user:${ctx.user.id}`
    }
    
    // Extract IP address from request
    const forwarded = ctx.req?.headers?.['x-forwarded-for']
    const ip = forwarded ? forwarded.split(',')[0].trim() : ctx.req?.connection?.remoteAddress
    
    return `ip:${ip || 'unknown'}`
  }
}

/**
 * tRPC middleware for rate limiting
 */
export const rateLimitMiddleware = (action: RateLimitAction) => {
  return async (opts: { ctx: any; next: () => Promise<any> }) => {
    const identifier = DatabaseRateLimiter.getIdentifier(opts.ctx)
    
    await DatabaseRateLimiter.enforceRateLimit(identifier, action)
    
    return opts.next()
  }
}

/**
 * Express-style middleware for rate limiting
 */
export const expressRateLimitMiddleware = (action: RateLimitAction) => {
  return async (req: any, res: any, next: any) => {
    try {
      const forwarded = req.headers['x-forwarded-for']
      const ip = forwarded ? forwarded.split(',')[0].trim() : req.connection.remoteAddress
      const identifier = `ip:${ip || 'unknown'}`
      
      await DatabaseRateLimiter.enforceRateLimit(identifier, action)
      next()
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'TOO_MANY_REQUESTS') {
        res.status(429).json({
          error: error.message,
          retryAfter: (error.cause as any)?.retryAfter,
        })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }
}
