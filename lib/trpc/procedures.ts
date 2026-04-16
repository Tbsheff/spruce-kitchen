import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Role } from "@/lib/db/schema.ts";
import { sanitizeObject } from "@/lib/security/input-validation.ts";
import type { AuditDetails } from "@/lib/security/simple-audit.ts";
import { SimpleAuditService } from "@/lib/security/simple-audit.ts";
import type { Context } from "./server.ts";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

function metadataOf(ctx: Context) {
  return {
    ipAddress: ctx.metadata.ipAddress,
    userAgent: ctx.metadata.userAgent,
  };
}

/**
 * Base procedure: sanitize input, require authentication, optionally enforce a
 * role or permission, and expose a backward-compatible ctx shape to routers
 * (`ctx.user`, `ctx.userRole`, `ctx.rbac`, `ctx.audit`, plus the newer `ctx.me`).
 *
 * Auth + permission logic is sourced from `ctx.currentUser`, which is resolved
 * once per request in the tRPC context factory via the identity module. All
 * permission checks here are synchronous against the materialized permission
 * set — no per-check database lookups.
 */
const createProtectedProcedure = (
  requiredPermission?: string,
  requiredRoles?: Role[]
) => {
  return t.procedure
    .use(async ({ next, input }) => {
      let sanitizedInput: unknown = input;
      if (input && typeof input === "object") {
        try {
          sanitizedInput = sanitizeObject(input);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid input detected",
          });
        }
      }

      return next({ input: sanitizedInput as typeof input });
    })
    .use(async ({ ctx, next }) => {
      if (ctx.currentUser.status !== "authenticated") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const me = ctx.currentUser.user;
      const { ipAddress, userAgent } = metadataOf(ctx);

      if (requiredRoles && !requiredRoles.includes(me.role)) {
        void SimpleAuditService.logPermissionDenied(
          me.id,
          "access_endpoint",
          "api",
          undefined,
          `role:${requiredRoles.join("|")}`,
          ipAddress,
          userAgent
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Access denied. Required role: ${requiredRoles.join(" or ")}`,
        });
      }

      if (requiredPermission && !me.can(requiredPermission)) {
        void SimpleAuditService.logPermissionDenied(
          me.id,
          "access_endpoint",
          "api",
          undefined,
          requiredPermission,
          ipAddress,
          userAgent
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Access denied. Required permission: ${requiredPermission}`,
        });
      }

      return next({
        ctx: {
          ...ctx,
          me,
          user: me,
          userRole: me.role,
          rbac: {
            hasPermission: (permission: string) => me.can(permission),
            canAccessOwnResource: (
              resourceUserId: string,
              permission: string
            ) => me.can(permission, resourceUserId),
            isAdmin: () => me.isAdmin(),
            isSuperAdmin: () => me.isSuperAdmin(),
          },
          audit: {
            log: async (
              action: string,
              resource: string,
              resourceId?: string,
              details?: AuditDetails
            ) =>
              SimpleAuditService.log({
                userId: me.id,
                action,
                resource,
                resourceId: resourceId ?? null,
                details: details ?? null,
                ipAddress,
                userAgent,
              }),
          },
        },
      });
    });
};

export const protectedProcedure = createProtectedProcedure();
export const customerProcedure = createProtectedProcedure(undefined, [
  "customer",
  "admin",
  "super_admin",
]);
export const adminProcedure = createProtectedProcedure(undefined, [
  "admin",
  "super_admin",
]);
export const superAdminProcedure = createProtectedProcedure(undefined, [
  "super_admin",
]);
export const requirePermission = (permission: string) =>
  createProtectedProcedure(permission);

export const createOwnershipProcedure = (_resourceUserIdField = "userId") => {
  return t.procedure.use(async ({ ctx, next }) => {
    if (ctx.currentUser.status !== "authenticated") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const me = ctx.currentUser.user;
    const { ipAddress, userAgent } = metadataOf(ctx);

    return next({
      ctx: {
        ...ctx,
        me,
        user: me,
        validateOwnership: async (
          resourceUserId: string,
          permission: string
        ) => {
          if (!me.can(permission, resourceUserId)) {
            void SimpleAuditService.logPermissionDenied(
              me.id,
              "access_resource",
              "owned_resource",
              resourceUserId,
              permission,
              ipAddress,
              userAgent
            );

            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Access denied. You can only access your own resources.",
            });
          }

          return true;
        },
      },
    });
  });
};

export const ownershipProcedure = createOwnershipProcedure();

export const userResourceProcedure = t.procedure
  .use(protectedProcedure._def.middlewares[0])
  .use(createOwnershipProcedure()._def.middlewares[0]);

export const auditedProcedure = (action: string, resource: string) => {
  return protectedProcedure.use(async ({ ctx, next, input }) => {
    const result = await next();

    if (result.ok) {
      void ctx.audit.log(action, resource, undefined, {
        input: sanitizeForAudit(input),
      });
    }

    return result;
  });
};

// Narrow unknown input into a structure compatible with AuditDetails so
// auditedProcedure can log it without type errors. Objects become nested
// records; non-serializable values degrade to their string form.
function sanitizeForAudit(value: unknown): AuditDetails {
  if (value === null || value === undefined) {
    return {};
  }
  if (typeof value === "object") {
    return value as AuditDetails;
  }
  return { value: String(value) };
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimitedProcedure = (maxRequests = 100, windowMs = 60_000) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.me.id;
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);
    const { ipAddress, userAgent } = metadataOf(ctx);

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= maxRequests) {
          void SimpleAuditService.logSecurityEvent(
            "rate_limit_exceeded",
            userId,
            { limit: maxRequests, window: windowMs },
            ipAddress,
            userAgent
          );

          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Rate limit exceeded. Please try again later.",
          });
        }
        userLimit.count += 1;
      } else {
        userLimit.count = 1;
        userLimit.resetTime = now + windowMs;
      }
    } else {
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
    }

    return next();
  });
};
