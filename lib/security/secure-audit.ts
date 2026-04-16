/**
 * Secure Audit Logging Service with Integrity Protection
 *
 * Provides tamper-resistant audit logging using:
 * - Cryptographic hashing for content integrity
 * - Hash chaining for sequence integrity
 * - Optional digital signatures for high-security environments
 * - Tamper detection and verification
 */

import { and, asc, desc, eq, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/index.ts";
import type { AuditLog } from "@/lib/db/schema.ts";
import { auditLog } from "@/lib/db/schema.ts";

// undefined is permitted because JSON.stringify drops undefined-valued keys
// at serialization time; this avoids forcing every caller to `?? null` when
// passing through a Zod-parsed input object with optional fields.
export type AuditDetailValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AuditDetailValue[]
  | { [key: string]: AuditDetailValue };

export type AuditDetails = Record<string, AuditDetailValue>;

export interface AuditLogData {
  action: string;
  details: AuditDetails | null;
  ipAddress: string | null;
  resource: string;
  resourceId: string | null;
  userAgent: string | null;
  userId: string | null;
}

export interface SecureAuditLog {
  action: string;
  contentHash: string;
  createdAt: Date;
  details: AuditDetails | null;
  id: string;
  ipAddress: string | null;
  previousHash: string | null;
  resource: string;
  resourceId: string | null;
  signature: string | null;
  userAgent: string | null;
  userId: string | null;
}

export class SecureAuditService {
  /**
   * Generate SHA-256 hash of audit log content
   */
  private static async generateContentHash(
    data: AuditLogData & {
      id: string;
      createdAt: Date;
    }
  ): Promise<string> {
    // Preserve historical hash compatibility: empty strings serialize to null,
    // matching the pre-refactor behavior of `value || null`.
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
    });

    // Generate SHA-256 hash
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Get the hash of the most recent audit log entry
   */
  private static async getLastLogHash(): Promise<string | null> {
    if (!process.env.DATABASE_URL) {
      return null;
    }

    try {
      const dbInstance = db();
      const lastLog = await dbInstance
        .select({ contentHash: auditLog.contentHash })
        .from(auditLog)
        .orderBy(desc(auditLog.createdAt))
        .limit(1);

      return lastLog.length > 0 ? lastLog[0].contentHash : null;
    } catch (error) {
      console.error("Failed to get last log hash:", error);
      return null;
    }
  }

  /**
   * Log an audit event with integrity protection
   */
  static async log(data: AuditLogData): Promise<string> {
    const logId = crypto.randomUUID();
    const timestamp = new Date();

    if (!process.env.DATABASE_URL) {
      // In development, just log to console
      console.log("🔍 Secure Audit Log:", {
        id: logId,
        timestamp: timestamp.toISOString(),
        ...data,
      });
      return logId;
    }

    try {
      // Get the previous log hash for chaining
      const previousHash = await SecureAuditService.getLastLogHash();

      // Generate content hash
      const contentHash = await SecureAuditService.generateContentHash({
        id: logId,
        ...data,
        createdAt: timestamp,
      });

      // Insert audit log with integrity protection
      await db().insert(auditLog).values({
        id: logId,
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: timestamp,
        contentHash,
        previousHash,
        // signature: null, // TODO: Implement digital signatures for high-security environments
      });

      return logId;
    } catch (error) {
      console.error("Failed to write secure audit log:", error);
      // Don't throw - audit logging shouldn't break the main operation
      return logId;
    }
  }

  /**
   * Verify the integrity of a single audit log entry
   */
  static async verifyLogIntegrity(log: AuditLog): Promise<{
    isValid: boolean;
    reason?: string;
  }> {
    try {
      // Regenerate content hash
      const expectedHash = await SecureAuditService.generateContentHash({
        id: log.id,
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        details: log.details as AuditDetails | null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      });

      if (expectedHash !== log.contentHash) {
        return {
          isValid: false,
          reason: "Content hash mismatch - log may have been tampered with",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        reason: `Verification error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Verify the integrity of the audit log chain
   */
  static async verifyLogChain(limit = 1000): Promise<{
    isValid: boolean;
    totalVerified: number;
    invalidLogs: Array<{ id: string; reason: string }>;
    chainBreaks: Array<{ beforeId: string; afterId: string }>;
  }> {
    if (!process.env.DATABASE_URL) {
      return {
        isValid: true,
        totalVerified: 0,
        invalidLogs: [],
        chainBreaks: [],
      };
    }

    try {
      const dbInstance = db();

      // Get logs in chronological order
      const logs = await dbInstance
        .select()
        .from(auditLog)
        .orderBy(asc(auditLog.createdAt))
        .limit(limit);

      if (logs.length === 0) {
        return {
          isValid: true,
          totalVerified: 0,
          invalidLogs: [],
          chainBreaks: [],
        };
      }

      const invalidLogs: Array<{ id: string; reason: string }> = [];
      const chainBreaks: Array<{ beforeId: string; afterId: string }> = [];
      let previousHash: string | null = null;

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];

        // Verify individual log integrity
        const integrity = await SecureAuditService.verifyLogIntegrity(log);
        if (!integrity.isValid) {
          invalidLogs.push({
            id: log.id,
            reason: integrity.reason || "Unknown integrity issue",
          });
        }

        // Verify chain integrity (skip first log)
        if (i > 0 && log.previousHash !== previousHash) {
          chainBreaks.push({
            beforeId: logs[i - 1].id,
            afterId: log.id,
          });
        }

        previousHash = log.contentHash;
      }

      return {
        isValid: invalidLogs.length === 0 && chainBreaks.length === 0,
        totalVerified: logs.length,
        invalidLogs,
        chainBreaks,
      };
    } catch (error) {
      console.error("Failed to verify log chain:", error);
      return {
        isValid: false,
        totalVerified: 0,
        invalidLogs: [
          {
            id: "verification-error",
            reason: `Chain verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        chainBreaks: [],
      };
    }
  }

  /**
   * Get audit logs with integrity status
   */
  static async getLogsWithIntegrity(
    userId?: string,
    resource?: string,
    limit = 50,
    offset = 0
  ): Promise<
    Array<AuditLog & { integrityStatus: { isValid: boolean; reason?: string } }>
  > {
    if (!process.env.DATABASE_URL) {
      return [];
    }

    try {
      const dbInstance = db();

      const whereConditions: SQL[] = [];
      if (userId) {
        whereConditions.push(eq(auditLog.userId, userId));
      }
      if (resource) {
        whereConditions.push(eq(auditLog.resource, resource));
      }

      const logs = await dbInstance
        .select()
        .from(auditLog)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset);

      // Verify integrity for each log
      const logsWithIntegrity = await Promise.all(
        logs.map(async (log) => {
          const integrityStatus =
            await SecureAuditService.verifyLogIntegrity(log);
          return {
            ...log,
            integrityStatus,
          };
        })
      );

      return logsWithIntegrity;
    } catch (error) {
      console.error("Failed to fetch logs with integrity:", error);
      return [];
    }
  }

  /**
   * Generate integrity report for audit logs
   */
  static async generateIntegrityReport(): Promise<{
    summary: {
      totalLogs: number;
      validLogs: number;
      invalidLogs: number;
      chainBreaks: number;
      overallIntegrity: boolean;
    };
    details: {
      invalidLogs: Array<{ id: string; reason: string }>;
      chainBreaks: Array<{ beforeId: string; afterId: string }>;
    };
    generatedAt: Date;
  }> {
    const verification = await SecureAuditService.verifyLogChain();

    return {
      summary: {
        totalLogs: verification.totalVerified,
        validLogs: verification.totalVerified - verification.invalidLogs.length,
        invalidLogs: verification.invalidLogs.length,
        chainBreaks: verification.chainBreaks.length,
        overallIntegrity: verification.isValid,
      },
      details: {
        invalidLogs: verification.invalidLogs,
        chainBreaks: verification.chainBreaks,
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Convenience methods with the same interface as the original AuditService
   */
  static logAuth(
    action: "login" | "logout" | "login_failed" | "signup",
    userId?: string,
    details?: AuditDetails,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return SecureAuditService.log({
      userId: userId ?? null,
      action: `auth:${action}`,
      resource: "user",
      resourceId: userId ?? null,
      details: details ?? null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }

  static logUserChange(
    action: "create" | "update" | "delete",
    userId: string,
    targetUserId: string,
    changes?: AuditDetails,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return SecureAuditService.log({
      userId,
      action: `user:${action}`,
      resource: "user",
      resourceId: targetUserId,
      details: { changes: changes ?? null },
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }

  static logSecurityEvent(
    event:
      | "suspicious_activity"
      | "rate_limit_exceeded"
      | "invalid_token"
      | "brute_force",
    userId?: string,
    details?: AuditDetails,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return SecureAuditService.log({
      userId: userId ?? null,
      action: `security:${event}`,
      resource: "system",
      resourceId: null,
      details: details ?? null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }

  static logPermissionDenied(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    requiredPermission?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return SecureAuditService.log({
      userId,
      action: "permission:denied",
      resource,
      resourceId: resourceId ?? null,
      details: {
        attempted_action: action,
        required_permission: requiredPermission ?? null,
      },
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }
}
