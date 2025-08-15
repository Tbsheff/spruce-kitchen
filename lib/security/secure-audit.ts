/**
 * Secure Audit Logging Service with Integrity Protection
 * 
 * Provides tamper-resistant audit logging using:
 * - Cryptographic hashing for content integrity
 * - Hash chaining for sequence integrity
 * - Optional digital signatures for high-security environments
 * - Tamper detection and verification
 */

import { db } from "@/lib/db"
import { auditLog } from "@/lib/db/schema"
import { eq, desc, asc, and } from "drizzle-orm"
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

interface SecureAuditLog {
  id: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  contentHash: string
  previousHash?: string
  signature?: string
}

export class SecureAuditService {
  /**
   * Generate SHA-256 hash of audit log content
   */
  private static async generateContentHash(data: {
    id: string
    userId?: string
    action: string
    resource: string
    resourceId?: string
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    createdAt: Date
  }): Promise<string> {
    // Create deterministic string from audit data
    const content = JSON.stringify({
      id: data.id,
      userId: data.userId || null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId || null,
      details: data.details || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      createdAt: data.createdAt.toISOString(),
    })

    // Generate SHA-256 hash
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Get the hash of the most recent audit log entry
   */
  private static async getLastLogHash(): Promise<string | null> {
    if (!process.env.DATABASE_URL) {
      return null
    }

    try {
      const dbInstance = db()
      const lastLog = await dbInstance
        .select({ contentHash: auditLog.contentHash })
        .from(auditLog)
        .orderBy(desc(auditLog.createdAt))
        .limit(1)

      return lastLog.length > 0 ? lastLog[0].contentHash : null
    } catch (error) {
      console.error('Failed to get last log hash:', error)
      return null
    }
  }

  /**
   * Log an audit event with integrity protection
   */
  static async log(data: AuditLogData): Promise<string> {
    const logId = crypto.randomUUID()
    const timestamp = new Date()

    if (!process.env.DATABASE_URL) {
      // In development, just log to console
      console.log("🔍 Secure Audit Log:", {
        id: logId,
        timestamp: timestamp.toISOString(),
        ...data,
      })
      return logId
    }

    try {
      // Get the previous log hash for chaining
      const previousHash = await this.getLastLogHash()

      // Generate content hash
      const contentHash = await this.generateContentHash({
        id: logId,
        ...data,
        createdAt: timestamp,
      })

      // Insert audit log with integrity protection
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
        contentHash,
        previousHash,
        // signature: null, // TODO: Implement digital signatures for high-security environments
      })

      return logId
    } catch (error) {
      console.error("Failed to write secure audit log:", error)
      // Don't throw - audit logging shouldn't break the main operation
      return logId
    }
  }

  /**
   * Verify the integrity of a single audit log entry
   */
  static async verifyLogIntegrity(log: AuditLog): Promise<{
    isValid: boolean
    reason?: string
  }> {
    try {
      // Regenerate content hash
      const expectedHash = await this.generateContentHash({
        id: log.id,
        userId: log.userId || undefined,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId || undefined,
        details: log.details || undefined,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        createdAt: log.createdAt,
      })

      if (expectedHash !== log.contentHash) {
        return {
          isValid: false,
          reason: 'Content hash mismatch - log may have been tampered with'
        }
      }

      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        reason: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Verify the integrity of the audit log chain
   */
  static async verifyLogChain(limit: number = 1000): Promise<{
    isValid: boolean
    totalVerified: number
    invalidLogs: Array<{ id: string; reason: string }>
    chainBreaks: Array<{ beforeId: string; afterId: string }>
  }> {
    if (!process.env.DATABASE_URL) {
      return {
        isValid: true,
        totalVerified: 0,
        invalidLogs: [],
        chainBreaks: []
      }
    }

    try {
      const dbInstance = db()
      
      // Get logs in chronological order
      const logs = await dbInstance
        .select()
        .from(auditLog)
        .orderBy(asc(auditLog.createdAt))
        .limit(limit)

      if (logs.length === 0) {
        return {
          isValid: true,
          totalVerified: 0,
          invalidLogs: [],
          chainBreaks: []
        }
      }

      const invalidLogs: Array<{ id: string; reason: string }> = []
      const chainBreaks: Array<{ beforeId: string; afterId: string }> = []
      let previousHash: string | null = null

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i]

        // Verify individual log integrity
        const integrity = await this.verifyLogIntegrity(log)
        if (!integrity.isValid) {
          invalidLogs.push({
            id: log.id,
            reason: integrity.reason || 'Unknown integrity issue'
          })
        }

        // Verify chain integrity (skip first log)
        if (i > 0 && log.previousHash !== previousHash) {
          chainBreaks.push({
            beforeId: logs[i - 1].id,
            afterId: log.id
          })
        }

        previousHash = log.contentHash
      }

      return {
        isValid: invalidLogs.length === 0 && chainBreaks.length === 0,
        totalVerified: logs.length,
        invalidLogs,
        chainBreaks
      }
    } catch (error) {
      console.error('Failed to verify log chain:', error)
      return {
        isValid: false,
        totalVerified: 0,
        invalidLogs: [{ 
          id: 'verification-error', 
          reason: `Chain verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }],
        chainBreaks: []
      }
    }
  }

  /**
   * Get audit logs with integrity status
   */
  static async getLogsWithIntegrity(
    userId?: string,
    resource?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Array<AuditLog & { integrityStatus: { isValid: boolean; reason?: string } }>> {
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

      // Verify integrity for each log
      const logsWithIntegrity = await Promise.all(
        logs.map(async (log) => {
          const integrityStatus = await this.verifyLogIntegrity(log)
          return {
            ...log,
            integrityStatus
          }
        })
      )

      return logsWithIntegrity
    } catch (error) {
      console.error('Failed to fetch logs with integrity:', error)
      return []
    }
  }

  /**
   * Generate integrity report for audit logs
   */
  static async generateIntegrityReport(): Promise<{
    summary: {
      totalLogs: number
      validLogs: number
      invalidLogs: number
      chainBreaks: number
      overallIntegrity: boolean
    }
    details: {
      invalidLogs: Array<{ id: string; reason: string }>
      chainBreaks: Array<{ beforeId: string; afterId: string }>
    }
    generatedAt: Date
  }> {
    const verification = await this.verifyLogChain()
    
    return {
      summary: {
        totalLogs: verification.totalVerified,
        validLogs: verification.totalVerified - verification.invalidLogs.length,
        invalidLogs: verification.invalidLogs.length,
        chainBreaks: verification.chainBreaks.length,
        overallIntegrity: verification.isValid
      },
      details: {
        invalidLogs: verification.invalidLogs,
        chainBreaks: verification.chainBreaks
      },
      generatedAt: new Date()
    }
  }

  /**
   * Convenience methods with the same interface as the original AuditService
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

  static async logUserChange(
    action: "create" | "update" | "delete",
    userId: string,
    targetUserId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return this.log({
      userId,
      action: `user:${action}`,
      resource: "user",
      resourceId: targetUserId,
      details: { changes },
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