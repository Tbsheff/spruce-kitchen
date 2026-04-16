import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { USER_PERMISSIONS } from "@/lib/auth/permissions.ts";
import {
  secureEmail,
  secureId,
  secureString,
} from "@/lib/security/input-validation.ts";
import { rateLimitMiddleware } from "@/lib/security/rate-limiting.ts";
import {
  adminProcedure,
  requirePermission,
  superAdminProcedure,
} from "@/lib/trpc/procedures.ts";
import { createTRPCRouter } from "@/lib/trpc/server.ts";
import { ROLES } from "@/lib/types/enums.ts";

const roleSchema = z.enum(ROLES);

export const userRouter = createTRPCRouter({
  // Get current user profile - requires user:read:own permission
  getProfile: requirePermission(USER_PERMISSIONS.READ_OWN).query(
    async ({ ctx }) => {
      // Log the access
      await ctx.audit.log("user:read", "user", ctx.user.id);

      if (!process.env.DATABASE_URL) {
        // Mock data when no database is configured
        return {
          id: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
          role: ctx.userRole,
          createdAt: new Date(),
          preferences: {
            dietaryRestrictions: [],
            allergies: [],
            servingSize: "medium",
          },
          deliveryAddress: null,
        };
      }

      // TODO: Implement actual database query when DB is connected
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.userRole,
        createdAt: new Date(),
        preferences: {
          dietaryRestrictions: [],
          allergies: [],
          servingSize: "medium",
        },
        deliveryAddress: null,
      };
    }
  ),

  // Update user profile - requires user:write:own permission
  updateProfile: requirePermission(USER_PERMISSIONS.WRITE_OWN)
    .use(rateLimitMiddleware("user:profile_update"))
    .input(
      z.object({
        name: secureString(1, 100).optional(),
        email: secureEmail().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Log the change
      await ctx.audit.log("user:update", "user", ctx.user.id, {
        changes: input,
      });

      if (!process.env.DATABASE_URL) {
        // Mock response when no database is configured
        return {
          success: true,
          user: {
            id: ctx.user.id,
            name: input.name || ctx.user.name,
            email: input.email || ctx.user.email,
            role: ctx.userRole,
          },
        };
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        user: {
          id: ctx.user.id,
          name: input.name || ctx.user.name,
          email: input.email || ctx.user.email,
          role: ctx.userRole,
        },
      };
    }),

  updatePreferences: requirePermission(USER_PERMISSIONS.WRITE_OWN)
    .use(rateLimitMiddleware("user:profile_update"))
    .input(
      z.object({
        dietaryRestrictions: z.array(secureString(1, 50)).max(20).optional(),
        allergies: z.array(secureString(1, 50)).max(20).optional(),
        servingSize: z.enum(["small", "medium", "large"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.audit.log("user:update_preferences", "user", ctx.user.id, {
        preferences: input,
      });

      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          preferences: input,
        };
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        preferences: input,
      };
    }),

  updateDeliveryAddress: requirePermission(USER_PERMISSIONS.WRITE_OWN)
    .use(rateLimitMiddleware("user:profile_update"))
    .input(
      z.object({
        street: secureString(1, 200),
        city: secureString(1, 100),
        state: secureString(1, 50),
        zipCode: secureString(5, 10),
        country: secureString(1, 50),
        instructions: secureString(0, 500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.audit.log("user:update_address", "user", ctx.user.id, {
        address: input,
      });

      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          address: input,
        };
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        address: input,
      };
    }),

  getOrderHistory: requirePermission(USER_PERMISSIONS.READ_OWN)
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      await ctx.audit.log("user:read_orders", "order", undefined, {
        userId: ctx.user.id,
      });

      if (!process.env.DATABASE_URL) {
        return {
          orders: [],
          total: 0,
        };
      }

      // SECURITY: Only return orders that belong to the authenticated user
      const { db } = await import("@/lib/db/index.ts");
      const dbInstance = db();
      const { order } = await import("@/lib/db/schema.ts");
      const { eq, desc, count } = await import("drizzle-orm");

      const userOrders = await dbInstance
        .select()
        .from(order)
        .where(eq(order.userId, ctx.user.id))
        .orderBy(desc(order.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const totalCount = await dbInstance
        .select({ count: count() })
        .from(order)
        .where(eq(order.userId, ctx.user.id));

      return {
        orders: userOrders,
        total: totalCount[0]?.count || 0,
      };
    }),

  // Admin-only endpoints
  getAllUsers: adminProcedure
    .use(rateLimitMiddleware("admin:user_management"))
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        role: roleSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await ctx.audit.log("admin:list_users", "user", undefined, {
        limit: input.limit,
        offset: input.offset,
        role: input.role ?? null,
      });

      if (!process.env.DATABASE_URL) {
        return {
          users: [],
          total: 0,
        };
      }

      // TODO: Implement actual database query when DB is connected
      return {
        users: [],
        total: 0,
      };
    }),

  updateUserRole: superAdminProcedure
    .use(rateLimitMiddleware("admin:user_management"))
    .input(
      z.object({
        userId: secureId(),
        role: roleSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own role",
        });
      }

      await ctx.audit.log("admin:update_user_role", "user", input.userId, {
        newRole: input.role,
        changedBy: ctx.user.id,
      });

      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          message: `User role updated to ${input.role}`,
        };
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        message: `User role updated to ${input.role}`,
      };
    }),

  deleteUser: superAdminProcedure
    .use(rateLimitMiddleware("admin:user_management"))
    .input(z.object({ userId: secureId() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        });
      }

      await ctx.audit.log("admin:delete_user", "user", input.userId, {
        deletedBy: ctx.user.id,
      });

      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          message: "User account deleted",
        };
      }

      // TODO: Implement actual database deletion when DB is connected
      return {
        success: true,
        message: "User account deleted",
      };
    }),
});
