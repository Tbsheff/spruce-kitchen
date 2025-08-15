import { db } from "@/lib/db"
import { auditLog } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import type { AuditLog } from "@/lib/db/schema"

export interface AuditLogData {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(data: AuditLogData): Promise<void> {
    if (!process.env.DATABASE_URL) {
      // In development, just log to console
      console.log("🔍 Audit Log:", {
        timestamp: new Date().toISOString(),
        ...data,
      })
      return
    }

    try {
      await db().insert(auditLog).values({
        id: crypto.randomUUID(),
        userId: data.userId || null,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId || null,
        details: data.details || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        createdAt: new Date(),
        contentHash: 'legacy', // Legacy audit logs don't have content hash
        previousHash: null,
        signature: null,
      })
    } catch (error) {
      console.error("Failed to write audit log:", error)
      // Don't throw - audit logging shouldn't break the main operation
    }
  }

  /**
   * Log user authentication events
   */
  static async logAuth(
    action: "login" | "logout" | "login_failed" | "signup",
    userId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `auth:${action}`,
      resource: "user",
      resourceId: userId,
      details,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log user profile changes
   */
  static async logUserChange(
    action: "create" | "update" | "delete",
    userId: string,
    targetUserId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `user:${action}`,
      resource: "user",
      resourceId: targetUserId,
      details: { changes },
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log order operations
   */
  static async logOrderChange(
    action: "create" | "update" | "delete" | "cancel",
    userId: string,
    orderId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `order:${action}`,
      resource: "order",
      resourceId: orderId,
      details,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log meal plan operations
   */
  static async logMealPlanChange(
    action: "create" | "update" | "delete" | "cancel",
    userId: string,
    mealPlanId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `mealplan:${action}`,
      resource: "mealplan",
      resourceId: mealPlanId,
      details,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log admin actions
   */
  static async logAdminAction(
    action: string,
    userId: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `admin:${action}`,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log permission denied events
   */
  static async logPermissionDenied(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    requiredPermission?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
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

  /**
   * Log security events
   */
  static async logSecurityEvent(
    event: "suspicious_activity" | "rate_limit_exceeded" | "invalid_token" | "brute_force",
    userId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: `security:${event}`,
      resource: "system",
      details,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Get audit logs for a specific user (admin only)
   */
  static async getUserAuditLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AuditLog[]> {
    if (!process.env.DATABASE_URL) {
      return []
    }

    try {
      const logs = await db()
        .select()
        .from(auditLog)
        .where(eq(auditLog.userId, userId))
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset)

      return logs
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
      return []
    }
  }

  /**
   * Get audit logs for a specific resource (admin only)
   */
  static async getResourceAuditLogs(
    resource: string,
    resourceId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AuditLog[]> {
    if (!process.env.DATABASE_URL) {
      return []
    }

    try {
      let whereConditions = [eq(auditLog.resource, resource)]
      
      if (resourceId) {
        whereConditions.push(eq(auditLog.resourceId, resourceId))
      }

      const logs = await db()
        .select()
        .from(auditLog)
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset)

      return logs
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
      return []
    }
  }
}

// Convenience exports
export const logAuth = AuditService.logAuth
export const logUserChange = AuditService.logUserChange
export const logOrderChange = AuditService.logOrderChange
export const logMealPlanChange = AuditService.logMealPlanChange
export const logAdminAction = AuditService.logAdminAction
export const logPermissionDenied = AuditService.logPermissionDenied
export const logSecurityEvent = AuditService.logSecurityEvent
