import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Role } from "@/lib/db/schema.ts";
import { isAuditDetails } from "@/lib/identity/core/ports.ts";
import { sanitizeObject } from "@/lib/security/input-validation.ts";
import type { AuditDetails } from "@/lib/security/simple-audit.ts";
import {
  logAudit,
  logPermissionDenied,
} from "@/lib/security/simple-audit.ts";
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
    .use(({ next, input }) => {
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
    .use(({ ctx, next }) => {
      if (ctx.currentUser.status !== "authenticated") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const me = ctx.currentUser.user;
      const { ipAddress, userAgent } = metadataOf(ctx);

      if (requiredRoles && !requiredRoles.includes(me.role)) {
        logPermissionDenied(
          me.id,
          "access_endpoint",
          "api",
          undefined,
          `role:${requiredRoles.join("|")}`,
          ipAddress,
          userAgent
        ).catch((err) => {
          console.error("audit log failed:", err);
        });

        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Access denied. Required role: ${requiredRoles.join(" or ")}`,
        });
      }

      if (requiredPermission && !me.can(requiredPermission)) {
        logPermissionDenied(
          me.id,
          "access_endpoint",
          "api",
          undefined,
          requiredPermission,
          ipAddress,
          userAgent
        ).catch((err) => {
          console.error("audit log failed:", err);
        });

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
            // `details` is `unknown` at the caller boundary — routers often
            // forward sanitized procedure input directly. The `isAuditDetails`
            // guard validates the top-level shape (plain object); values that
            // fail the guard are persisted as `null` rather than coerced.
            log: async (
              action: string,
              resource: string,
              resourceId?: string,
              details?: unknown
            ) =>
              logAudit({
                userId: me.id,
                action,
                resource,
                resourceId: resourceId ?? null,
                details: isAuditDetails(details) ? details : null,
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
  return t.procedure.use(({ ctx, next }) => {
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
        validateOwnership: (resourceUserId: string, permission: string) => {
          if (!me.can(permission, resourceUserId)) {
            logPermissionDenied(
              me.id,
              "access_resource",
              "owned_resource",
              resourceUserId,
              permission,
              ipAddress,
              userAgent
            ).catch((err) => {
              console.error("audit log failed:", err);
            });

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
      ctx.audit
        .log(action, resource, undefined, {
          input: sanitizeForAudit(input),
        })
        .catch((err) => {
          console.error("audit log failed:", err);
        });
    }

    return result;
  });
};

// Narrow unknown input into a structure compatible with AuditDetails so
// auditedProcedure can log it without type errors. Objects become nested
// records; non-serializable values degrade to their string form.
function sanitizeForAudit(value: unknown): AuditDetails {
  if (isAuditDetails(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return {};
  }
  return { value: String(value) };
}

