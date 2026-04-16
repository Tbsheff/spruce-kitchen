/**
 * Simplified Audit Logging Service
 *
 * Provides structured audit logging focused on:
 * - Clear event tracking
 * - User action logging
 * - Security event monitoring
 * - Performance-optimized async logging
 */

import { and, desc, eq, type SQL } from "drizzle-orm";
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

/**
 * Log an audit event (async to avoid blocking)
 */
export function logAudit(data: AuditLogData): Promise<string> {
  const logId = crypto.randomUUID();
  const timestamp = new Date();

  if (!process.env.DATABASE_URL) {
    // In development, just log to console
    console.log("🔍 Audit Log:", {
      id: logId,
      timestamp: timestamp.toISOString(),
      ...data,
    });
    return Promise.resolve(logId);
  }

  // Use setImmediate to make logging truly async and non-blocking
  setImmediate(async () => {
    try {
      await db()
        .insert(auditLog)
        .values({
          id: logId,
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          createdAt: timestamp,
          // Simplified: just use a basic content indicator instead of cryptographic hash
          contentHash: `${data.action}:${data.resource}:${timestamp.getTime()}`,
          previousHash: null, // Remove complex hash chaining
          signature: null,
        });
    } catch (error) {
      console.error("Audit logging failed (non-blocking):", error);
      // Don't throw - audit logging should never break the main operation
    }
  });

  return Promise.resolve(logId);
}

/**
 * Get audit logs with simple filtering
 */
export async function getAuditLogs(
  userId?: string,
  resource?: string,
  limit = 50,
  offset = 0
): Promise<AuditLog[]> {
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

    return logs;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}

/**
 * Convenience wrapper: log an auth-related event
 */
export function logAuth(
  action: "login" | "logout" | "login_failed" | "signup",
  userId?: string,
  details?: AuditDetails,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  return logAudit({
    userId: userId ?? null,
    action: `auth:${action}`,
    resource: "user",
    resourceId: userId ?? null,
    details: details ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}

/**
 * Convenience wrapper: log a security event
 */
export function logSecurityEvent(
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
  return logAudit({
    userId: userId ?? null,
    action: `security:${event}`,
    resource: "system",
    resourceId: null,
    details: details ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}

/**
 * Convenience wrapper: log a permission-denied event
 */
export function logPermissionDenied(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  requiredPermission?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  return logAudit({
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
