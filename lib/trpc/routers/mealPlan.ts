import { z } from "zod"
import { secureString, secureId } from "@/lib/security/input-validation"
import { rateLimitMiddleware } from "@/lib/security/rate-limiting"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server"
import { 
  protectedProcedure, 
  customerProcedure, 
  adminProcedure,
  requirePermission,
  ownershipProcedure 
} from "@/lib/trpc/procedures"
import { MEALPLAN_PERMISSIONS, ORDER_PERMISSIONS } from "@/lib/auth/permissions"
import { logMealPlanChange, logOrderChange } from "@/lib/services/audit"

export const mealPlanRouter = createTRPCRouter({
  getAvailableMeals: publicProcedure
    .use(rateLimitMiddleware('api:general'))
    .query(async () => {
    // Mock meal data - this would come from database in production
    return [
      {
        id: "herb-salmon",
        name: "Herb Roasted Salmon",
        description: "Wild salmon, roasted vegetables, lemon herb drizzle.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["gluten-free", "dairy-free"],
        allergens: ["fish"],
        calories: 450,
        protein: 35,
        carbs: 25,
        fat: 20,
      },
      {
        id: "tuscan-pasta",
        name: "Tuscan Chicken Pasta",
        description: "Sun-dried tomatoes, spinach, creamy garlic sauce.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["high-protein"],
        allergens: ["gluten", "dairy"],
        calories: 520,
        protein: 40,
        carbs: 45,
        fat: 18,
      },
      {
        id: "green-goddess-bowl",
        name: "Green Goddess Bowl",
        description: "Quinoa, roasted broccoli, pesto, caramelized onions.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["vegetarian", "gluten-free"],
        allergens: ["nuts"],
        calories: 380,
        protein: 15,
        carbs: 50,
        fat: 16,
      },
      {
        id: "beef-bulgogi",
        name: "Beef Bulgogi Rice",
        description: "Sweet-savory beef, sesame, pickled vegetables.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["high-protein"],
        allergens: ["soy", "sesame"],
        calories: 480,
        protein: 32,
        carbs: 42,
        fat: 20,
      },
      {
        id: "lemon-shrimp",
        name: "Lemon Pepper Shrimp",
        description: "Citrus garlic butter, herbed jasmine rice.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["gluten-free", "high-protein"],
        allergens: ["shellfish"],
        calories: 420,
        protein: 28,
        carbs: 38,
        fat: 15,
      },
      {
        id: "butternut-ravioli",
        name: "Butternut Squash Ravioli",
        description: "Sage brown butter sauce, parmesan cheese.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["vegetarian"],
        allergens: ["gluten", "dairy", "eggs"],
        calories: 460,
        protein: 18,
        carbs: 55,
        fat: 20,
      },
      {
        id: "turkey-chili",
        name: "Chipotle Turkey Chili",
        description: "Smoky beans, corn, fresh cilantro.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["gluten-free", "high-protein"],
        allergens: [],
        calories: 390,
        protein: 30,
        carbs: 35,
        fat: 12,
      },
      {
        id: "miso-tofu",
        name: "Miso Ginger Tofu",
        description: "Umami glaze, bok choy, jasmine rice.",
        image: "/placeholder.svg?height=200&width=300",
        dietaryTags: ["vegan", "gluten-free"],
        allergens: ["soy"],
        calories: 350,
        protein: 20,
        carbs: 40,
        fat: 14,
      },
    ]
  }),

  // Create a new meal plan - requires mealplan:write:own permission
  create: requirePermission(MEALPLAN_PERMISSIONS.WRITE_OWN)
    .use(rateLimitMiddleware('user:meal_plan_create'))
    .input(
      z.object({
        boxSize: z.enum(["small", "medium"]),
        planType: z.enum(["subscription", "one-time"]),
        deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // SECURITY: Without database, cannot store meal plans - block access
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database required to create meal plans",
        })
      }

      const { db } = await import("@/lib/db")
      const dbInstance = db()
      const { mealPlan: mealPlanTable } = await import("@/lib/db/schema")
      const { nanoid } = await import("nanoid")
      
      const mealPlanId = nanoid()
      
      // Log the creation
      await ctx.audit.log("mealplan:create", "mealplan", mealPlanId, input)

      // Create meal plan with proper schema mapping
      const newMealPlan = await dbInstance.insert(mealPlanTable)
        .values({
          id: mealPlanId,
          userId: ctx.user.id,
          planType: input.boxSize, // Map boxSize to planType
          billingType: input.planType, // Map planType to billingType
          deliveryFrequency: input.deliveryFrequency,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      return newMealPlan[0]
    }),

  // Get user's meal plans - requires mealplan:read:own permission
  getUserPlans: requirePermission(MEALPLAN_PERMISSIONS.READ_OWN).query(async ({ ctx }) => {
    await ctx.audit.log("mealplan:read_user_plans", "mealplan", undefined, { userId: ctx.user.id })

    if (!process.env.DATABASE_URL) {
      // Mock data when no database is configured
      return []
    }

    // SECURITY: Only return meal plans that belong to the authenticated user
    const { db } = await import("@/lib/db")
    const { mealPlan } = await import("@/lib/db/schema")
    const { eq, desc } = await import("drizzle-orm")
    
    const userPlans = await db().select()
      .from(mealPlan)
      .where(eq(mealPlan.userId, ctx.user.id))
      .orderBy(desc(mealPlan.createdAt))

    return userPlans
  }),

  // Get meal plan by ID with ownership validation
  getById: requirePermission(MEALPLAN_PERMISSIONS.READ_OWN)
    .input(z.object({ id: secureId() }))
    .query(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // SECURITY: Without database, cannot validate ownership - block access
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database required for resource ownership validation",
        })
      }

      // SECURITY: Validate ownership before returning data
      const { db } = await import("@/lib/db")
      const dbInstance = db()
      const { mealPlan: mealPlanTable } = await import("@/lib/db/schema")
      const { eq, and } = await import("drizzle-orm")
      
      const mealPlan = await dbInstance.select()
        .from(mealPlanTable)
        .where(and(
          eq(mealPlanTable.id, input.id),
          eq(mealPlanTable.userId, ctx.user.id)
        ))
        .limit(1)
      
      if (!mealPlan.length) {
        await ctx.audit.log("mealplan:read_denied", "mealplan", input.id, { 
          reason: "ownership_validation_failed",
          userId: ctx.user.id 
        })
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meal plan not found",
        })
      }

      await ctx.audit.log("mealplan:read", "mealplan", input.id)
      
      return mealPlan[0]
    }),

  update: requirePermission(MEALPLAN_PERMISSIONS.WRITE_OWN)
    .input(
      z.object({
        id: secureId(),
        boxSize: z.enum(["small", "medium"]).optional(),
        planType: z.enum(["subscription", "one-time"]).optional(),
        deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // SECURITY: Without database, cannot validate ownership - block access
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database required for resource ownership validation",
        })
      }

      // SECURITY: Validate ownership before update
      const { db } = await import("@/lib/db")
      const dbInstance = db()
      const { mealPlan: mealPlanTable } = await import("@/lib/db/schema")
      const { eq, and } = await import("drizzle-orm")
      
      const existingPlan = await dbInstance.select()
        .from(mealPlanTable)
        .where(and(
          eq(mealPlanTable.id, input.id),
          eq(mealPlanTable.userId, ctx.user.id)
        ))
        .limit(1)
      
      if (!existingPlan.length) {
        await ctx.audit.log("mealplan:update_denied", "mealplan", input.id, { 
          reason: "ownership_validation_failed",
          userId: ctx.user.id 
        })
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Meal plan not found or access denied",
        })
      }

      await ctx.audit.log("mealplan:update", "mealplan", input.id, { changes: input })

      // Update with ownership constraint  
      const updateData: any = { updatedAt: new Date() }
      if (input.deliveryFrequency) updateData.deliveryFrequency = input.deliveryFrequency
      if (input.planType) updateData.planType = input.planType
      if (input.boxSize) updateData.planType = input.boxSize // Map boxSize to planType
      
      const updatedPlan = await dbInstance.update(mealPlanTable)
        .set(updateData)
        .where(and(
          eq(mealPlanTable.id, input.id),
          eq(mealPlanTable.userId, ctx.user.id)
        ))
        .returning()

      return {
        success: true,
        mealPlan: updatedPlan[0],
      }
    }),

  cancel: requirePermission(MEALPLAN_PERMISSIONS.WRITE_OWN)
    .input(z.object({ id: secureId() }))
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // SECURITY: Without database, cannot validate ownership - block access
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database required for resource ownership validation",
        })
      }

      // SECURITY: Validate ownership before cancellation
      const { db } = await import("@/lib/db")
      const dbInstance = db()
      const { mealPlan: mealPlanTable } = await import("@/lib/db/schema")
      const { eq, and } = await import("drizzle-orm")
      
      const existingPlan = await dbInstance.select()
        .from(mealPlanTable)
        .where(and(
          eq(mealPlanTable.id, input.id),
          eq(mealPlanTable.userId, ctx.user.id)
        ))
        .limit(1)
      
      if (!existingPlan.length) {
        await ctx.audit.log("mealplan:cancel_denied", "mealplan", input.id, { 
          reason: "ownership_validation_failed",
          userId: ctx.user.id 
        })
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Meal plan not found or access denied",
        })
      }

      await ctx.audit.log("mealplan:cancel", "mealplan", input.id)

      // Cancel with ownership constraint
      await dbInstance.update(mealPlanTable)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(and(
          eq(mealPlanTable.id, input.id),
          eq(mealPlanTable.userId, ctx.user.id)
        ))

      return {
        success: true,
        message: "Meal plan cancelled successfully",
      }
    }),

  createOrder: requirePermission(ORDER_PERMISSIONS.WRITE_OWN)
    .input(
      z.object({
        mealPlanId: secureId(),
        deliveryDate: z.date(),
        specialInstructions: secureString(0, 1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // SECURITY: Without database, cannot validate ownership - block access
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database required for resource ownership validation",
        })
      }

      // SECURITY: Validate that meal plan belongs to user before creating order
      const { db } = await import("@/lib/db")
      const dbInstance = db()
      const { mealPlan: mealPlanTable, order: orderTable } = await import("@/lib/db/schema")
      const { eq, and } = await import("drizzle-orm")
      const { nanoid } = await import("nanoid")
      
      const mealPlan = await dbInstance.select()
        .from(mealPlanTable)
        .where(and(
          eq(mealPlanTable.id, input.mealPlanId),
          eq(mealPlanTable.userId, ctx.user.id)
        ))
        .limit(1)
      
      if (!mealPlan.length) {
        await ctx.audit.log("order:create_denied", "order", undefined, { 
          reason: "meal_plan_ownership_validation_failed",
          mealPlanId: input.mealPlanId,
          userId: ctx.user.id 
        })
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Meal plan not found or access denied",
        })
      }

      const orderId = nanoid()
      
      await ctx.audit.log("order:create", "order", orderId, input)

      // Calculate price based on plan type (in cents)
      const planPrices = {
        'small': 3999, // $39.99
        'medium': 5999, // $59.99
      }
      const totalAmount = planPrices[mealPlan[0].planType as keyof typeof planPrices] || 3999

      // Create order with validated meal plan ownership
      const newOrder = await dbInstance.insert(orderTable)
        .values({
          id: orderId,
          userId: ctx.user.id,
          mealPlanId: input.mealPlanId,
          status: "pending",
          totalAmount,
          deliveryDate: input.deliveryDate,
        })
        .returning()

      return newOrder[0]
    }),

  // Admin-only endpoints
  getAllMealPlans: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["active", "paused", "cancelled"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await ctx.audit.log("admin:list_meal_plans", "mealplan", undefined, input)

      if (!process.env.DATABASE_URL) {
        return {
          mealPlans: [],
          total: 0,
        }
      }

      // TODO: Implement actual database query when DB is connected
      return {
        mealPlans: [],
        total: 0,
      }
    }),

  getAllOrders: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["pending", "confirmed", "preparing", "shipped", "delivered"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await ctx.audit.log("admin:list_orders", "order", undefined, input)

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

  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: secureId(),
        status: z.enum(["pending", "confirmed", "preparing", "shipped", "delivered"]),
        notes: secureString(0, 1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.audit.log("admin:update_order_status", "order", input.orderId, {
        newStatus: input.status,
        notes: input.notes,
        updatedBy: ctx.user.id,
      })

      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          message: `Order status updated to ${input.status}`,
        }
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        message: `Order status updated to ${input.status}`,
      }
    }),
})
