import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server"

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!process.env.DATABASE_URL) {
      // Mock data when no database is configured
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        createdAt: new Date(),
        preferences: {
          dietaryRestrictions: [],
          allergies: [],
          servingSize: "medium",
        },
        deliveryAddress: null,
      }
    }

    // TODO: Implement actual database query when DB is connected
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      createdAt: new Date(),
      preferences: {
        dietaryRestrictions: [],
        allergies: [],
        servingSize: "medium",
      },
      deliveryAddress: null,
    }
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // Mock response when no database is configured
        return {
          success: true,
          user: {
            id: ctx.user.id,
            name: input.name || ctx.user.name,
            email: input.email || ctx.user.email,
          },
        }
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        user: {
          id: ctx.user.id,
          name: input.name || ctx.user.name,
          email: input.email || ctx.user.email,
        },
      }
    }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        dietaryRestrictions: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        servingSize: z.enum(["small", "medium", "large"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          preferences: input,
        }
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        preferences: input,
      }
    }),

  updateDeliveryAddress: protectedProcedure
    .input(
      z.object({
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        zipCode: z.string().min(5),
        country: z.string().min(1),
        instructions: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          address: input,
        }
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        address: input,
      }
    }),

  getOrderHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        return {
          orders: [],
          total: 0,
        }
      }

      // TODO: Implement actual database query when DB is connected
      return {
        orders: [],
        total: 0,
      }
    }),
})
