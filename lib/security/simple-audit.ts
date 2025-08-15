/**
 * Simplified Audit Logging Service
 * 
 * Provides structured audit logging focused on:
 * - Clear event tracking
 * - User action logging
 * - Security event monitoring
 * - Performance-optimized async logging
 */

import { db } from "@/lib/db"
import { auditLog } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import type { AuditLog } from "@/lib/db/schema"

interface AuditLogData {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export class SimpleAuditService {
  /**
   * Log an audit event (async to avoid blocking)
   */
  static async log(data: AuditLogData): Promise<string> {
    const logId = crypto.randomUUID()
    const timestamp = new Date()

    if (!process.env.DATABASE_URL) {
      // In development, just log to console
      console.log("🔍 Audit Log:", {
        id: logId,
        timestamp: timestamp.toISOString(),
        ...data,
      })
      return logId
    }

    // Use setImmediate to make logging truly async and non-blocking
    setImmediate(async () => {
      try {
        await db().insert(auditLog).values({
          id: logId,
          userId: data.userId || null,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId || null,
          details: data.details || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          createdAt: timestamp,
          // Simplified: just use a basic content indicator instead of cryptographic hash
          contentHash: `${data.action}:${data.resource}:${timestamp.getTime()}`,
          previousHash: null, // Remove complex hash chaining
          signature: null,
        })
      } catch (error) {
        console.error("Audit logging failed (non-blocking):", error)
        // Don't throw - audit logging should never break the main operation
      }
    })

    return logId
  }

  /**
   * Get audit logs with simple filtering
   */
  static async getLogs(
    userId?: string,
    resource?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AuditLog[]> {
    if (!process.env.DATABASE_URL) {
      return []
    }

    try {
      const dbInstance = db()
      
      let whereConditions = []
      if (userId) {
        whereConditions.push(eq(auditLog.userId, userId))
      }
      if (resource) {
        whereConditions.push(eq(auditLog.resource, resource))
      }

      const logs = await dbInstance
        .select()
        .from(auditLog)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset)

      return logs
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }
  }

  /**
   * Convenience methods with the same interface as before (for backward compatibility)
   */
  static async logAuth(
    action: "login" | "logout" | "login_failed" | "signup",
    userId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return this.log({
      userId,
      action: `auth:${action}`,
      resource: "user",
      resourceId: userId,
      details,
      ipAddress,
      userAgent,
    })
  }

  static async logSecurityEvent(
    event: "suspicious_activity" | "rate_limit_exceeded" | "invalid_token" | "brute_force",
    userId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return this.log({
      userId,
      action: `security:${event}`,
      resource: "system",
      details,
      ipAddress,
      userAgent,
    })
  }

  static async logPermissionDenied(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    requiredPermission?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return this.log({
      userId,
      action: "permission:denied",
      resource,
      resourceId,
      details: {
        attempted_action: action,
        required_permission: requiredPermission,
      },
      ipAddress,
      userAgent,
    })
  }
}

// Backward compatibility exports
export const logAuth = SimpleAuditService.logAuth
export const logSecurityEvent = SimpleAuditService.logSecurityEvent
export const logPermissionDenied = SimpleAuditService.logPermissionDenied