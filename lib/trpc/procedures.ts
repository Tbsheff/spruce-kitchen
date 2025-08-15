import { TRPCError } from "@trpc/server"
import { createTRPCContext } from "./server"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { RBACService } from "@/lib/auth/rbac"
import { SimpleAuditService } from "@/lib/security/simple-audit"
import { sanitizeObject } from "@/lib/security/input-validation"
import type { Role } from "@/lib/db/schema"
import type { Context } from "./server"

// Initialize tRPC instance for procedures
const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

/**
 * Enhanced procedure that includes permission checking, audit logging, and input sanitization
 */
const createProtectedProcedure = (requiredPermission?: string, requiredRoles?: Role[]) => {
  return t.procedure
    .use(async ({ ctx, next, input }) => {
      // SECURITY: Basic XSS protection (Zod schemas handle detailed validation)
      if (input && typeof input === 'object') {
        try {
          // Simple sanitization - let Zod schemas handle detailed validation
          input = sanitizeObject(input)
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid input detected"
          })
        }
      }
      
      return next({ input })
    })
    .use(async ({ ctx, next, meta }) => {
      // Check if user is authenticated
      if (!ctx.session?.user) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED",
          message: "Authentication required"
        })
      }

    const user = ctx.session.user
    const userId = user.id

    // Get user's role
    const userRole = await RBACService.getUserRole(userId)

    // Check role requirements
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      await SimpleAuditService.logPermissionDenied(
        userId,
        "access_endpoint",
        "api",
        undefined,
        `role:${requiredRoles.join("|")}`,
        ctx.req?.headers?.get?.("x-forwarded-for") || "unknown",
        ctx.req?.headers?.get?.("user-agent") || "unknown"
      )

      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required role: ${requiredRoles.join(" or ")}`
      })
    }

    // Check specific permission
    if (requiredPermission && !(await RBACService.userHasPermission(userId, requiredPermission))) {
      await SimpleAuditService.logPermissionDenied(
        userId,
        "access_endpoint",
        "api",
        undefined,
        requiredPermission,
        ctx.req?.headers?.get?.("x-forwarded-for") || "unknown",
        ctx.req?.headers?.get?.("user-agent") || "unknown"
      )

      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required permission: ${requiredPermission}`
      })
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.session.user,
        userRole,
        // Helper functions for easy access
        rbac: {
          hasPermission: (permission: string) => RBACService.userHasPermission(userId, permission),
          canAccessOwnResource: (resourceUserId: string, permission: string) =>
            RBACService.canAccessOwnResource(userId, resourceUserId, permission),
          isAdmin: () => RBACService.isAdmin(userId),
          isSuperAdmin: () => RBACService.isSuperAdmin(userId),
        },
        audit: {
          log: (action: string, resource: string, resourceId?: string, details?: any) =>
            SimpleAuditService.log({
              userId,
              action,
              resource,
              resourceId,
              details,
              ipAddress: ctx.req?.headers?.get?.("x-forwarded-for") || "unknown",
              userAgent: ctx.req?.headers?.get?.("user-agent") || "unknown",
            }),
        },
      },
    })
  })
}

// Base authenticated procedure (any authenticated user)
export const protectedProcedure = createProtectedProcedure()

// Customer procedures (default authenticated users)
export const customerProcedure = createProtectedProcedure(undefined, ["customer", "admin", "super_admin"])

// Admin procedures (admin or super_admin only)
export const adminProcedure = createProtectedProcedure(undefined, ["admin", "super_admin"])

// Super admin procedures (super_admin only)
export const superAdminProcedure = createProtectedProcedure(undefined, ["super_admin"])

// Permission-based procedures
export const requirePermission = (permission: string) => createProtectedProcedure(permission)

// Resource ownership procedures
export const createOwnershipProcedure = (resourceUserIdField: string = "userId") => {
  return t.procedure.use(async ({ ctx, next, input }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const userId = ctx.session.user.id

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.session.user,
        // Ownership validation helper
        validateOwnership: async (resourceUserId: string, permission: string) => {
          const canAccess = await RBACService.canAccessOwnResource(
            userId,
            resourceUserId,
            permission
          )

          if (!canAccess) {
            await SimpleAuditService.logPermissionDenied(
              userId,
              "access_resource",
              "owned_resource",
              resourceUserId,
              permission,
              ctx.req?.headers?.get?.("x-forwarded-for") || "unknown",
              ctx.req?.headers?.get?.("user-agent") || "unknown"
            )

            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Access denied. You can only access your own resources."
            })
          }

          return true
        },
      },
    })
  })
}

// Ownership-based procedures
export const ownershipProcedure = createOwnershipProcedure()

// Combined procedures for common patterns
export const userResourceProcedure = t.procedure
  .use(protectedProcedure._def.middlewares[0])
  .use(createOwnershipProcedure()._def.middlewares[0])

// Audit logging middleware
export const auditedProcedure = (action: string, resource: string) => {
  return protectedProcedure.use(async ({ ctx, next, input }) => {
    const result = await next()

    // Log successful operations
    if (result.ok) {
      await ctx.audit.log(action, resource, undefined, { input })
    }

    return result
  })
}

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const rateLimitedProcedure = (maxRequests: number = 100, windowMs: number = 60000) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.user.id
    const now = Date.now()
    const userLimit = rateLimitMap.get(userId)

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= maxRequests) {
          await SimpleAuditService.logSecurityEvent(
            "rate_limit_exceeded",
            userId,
            { limit: maxRequests, window: windowMs },
            ctx.req?.headers?.get?.("x-forwarded-for") || "unknown",
            ctx.req?.headers?.get?.("user-agent") || "unknown"
          )

          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Rate limit exceeded. Please try again later."
          })
        }
        userLimit.count++
      } else {
        // Reset window
        userLimit.count = 1
        userLimit.resetTime = now + windowMs
      }
    } else {
      // First request
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs
      })
    }

    return next()
  })
}
