import { and, desc, eq } from "drizzle-orm";
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
 * Log an audit event
 */
export async function log(data: AuditLogData): Promise<void> {
  if (!process.env.DATABASE_URL) {
    // In development, just log to console
    console.log("🔍 Audit Log:", {
      timestamp: new Date().toISOString(),
      ...data,
    });
    return;
  }

  try {
    await db().insert(auditLog).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: new Date(),
      contentHash: "legacy", // Legacy audit logs don't have content hash
      previousHash: null,
      signature: null,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Don't throw - audit logging shouldn't break the main operation
  }
}

/**
 * Log user authentication events
 */
export async function logAuth(
  action: "login" | "logout" | "login_failed" | "signup",
  userId?: string,
  details?: AuditDetails,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await log({
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
 * Log user profile changes
 */
export async function logUserChange(
  action: "create" | "update" | "delete",
  userId: string,
  targetUserId: string,
  changes?: AuditDetails,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await log({
    userId,
    action: `user:${action}`,
    resource: "user",
    resourceId: targetUserId,
    details: { changes: changes ?? null },
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}

/**
 * Log order operations
 */
export async function logOrderChange(
  action: "create" | "update" | "delete" | "cancel",
  userId: string,
  orderId: string,
  details?: AuditDetails,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await log({
    userId,
    action: `order:${action}`,
    resource: "order",
    resourceId: orderId,
    details: details ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}

/**
 * Log meal plan operations
 */
export async function logMealPlanChange(
  action: "create" | "update" | "delete" | "cancel",
  userId: string,
  mealPlanId: string,
  details?: AuditDetails,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await log({
    userId,
    action: `mealplan:${action}`,
    resource: "mealplan",
    resourceId: mealPlanId,
    details: details ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}

/**
 * Log admin actions
 */
export async function logAdminAction(
  action: string,
  userId: string,
  resource: string,
  resourceId?: string,
  details?: AuditDetails,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await log({
    userId,
    action: `admin:${action}`,
    resource,
    resourceId: resourceId ?? null,
    details: details ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}

/**
 * Log permission denied events
 */
export async function logPermissionDenied(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  requiredPermission?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await log({
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

/**
 * Log security events
 */
export async function logSecurityEvent(
  event:
    | "suspicious_activity"
    | "rate_limit_exceeded"
    | "invalid_token"
    | "brute_force",
  userId?: string,
  details?: AuditDetails,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await log({
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
 * Get audit logs for a specific user (admin only)
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 50,
  offset = 0
): Promise<AuditLog[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const logs = await db()
      .select()
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
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
 * Get audit logs for a specific resource (admin only)
 */
export async function getResourceAuditLogs(
  resource: string,
  resourceId?: string,
  limit = 50,
  offset = 0
): Promise<AuditLog[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const whereConditions = [eq(auditLog.resource, resource)];

    if (resourceId) {
      whereConditions.push(eq(auditLog.resourceId, resourceId));
    }

    const logs = await db()
      .select()
      .from(auditLog)
      .where(
        whereConditions.length > 1
          ? and(...whereConditions)
          : whereConditions[0]
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);

    return logs;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}
