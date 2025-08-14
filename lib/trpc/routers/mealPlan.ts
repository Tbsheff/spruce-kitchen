import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server"

export const mealPlanRouter = createTRPCRouter({
  getAvailableMeals: publicProcedure.query(async () => {
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

  // Create a new meal plan
  create: protectedProcedure
    .input(
      z.object({
        meals: z.record(z.string(), z.number()),
        boxSize: z.enum(["small", "medium"]),
        planType: z.enum(["subscription", "one-time"]),
        deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // Mock response when no database is configured
        return {
          id: `plan_${Date.now()}`,
          userId: ctx.user.id,
          ...input,
          status: "active",
          createdAt: new Date(),
        }
      }

      // TODO: Implement actual database insert when DB is connected
      return {
        id: `plan_${Date.now()}`,
        userId: ctx.user.id,
        ...input,
        status: "active",
        createdAt: new Date(),
      }
    }),

  // Get user's meal plans
  getUserPlans: protectedProcedure.query(async ({ ctx }) => {
    if (!process.env.DATABASE_URL) {
      // Mock data when no database is configured
      return []
    }

    // TODO: Implement actual database query when DB is connected
    return []
  }),

  // Get meal plan by ID
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    if (!process.env.DATABASE_URL) {
      // Mock data when no database is configured
      return null
    }

    // TODO: Implement actual database query when DB is connected
    return null
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        meals: z.record(z.string(), z.number()).optional(),
        boxSize: z.enum(["small", "medium"]).optional(),
        planType: z.enum(["subscription", "one-time"]).optional(),
        deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          mealPlan: {
            id: input.id,
            userId: ctx.user.id,
            ...input,
            updatedAt: new Date(),
          },
        }
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        mealPlan: {
          id: input.id,
          userId: ctx.user.id,
          ...input,
          updatedAt: new Date(),
        },
      }
    }),

  cancel: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (!process.env.DATABASE_URL) {
      return {
        success: true,
        message: "Meal plan cancelled successfully",
      }
    }

    // TODO: Implement actual database update when DB is connected
    return {
      success: true,
      message: "Meal plan cancelled successfully",
    }
  }),

  createOrder: protectedProcedure
    .input(
      z.object({
        mealPlanId: z.string(),
        deliveryDate: z.date(),
        specialInstructions: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        return {
          id: `order_${Date.now()}`,
          userId: ctx.user.id,
          mealPlanId: input.mealPlanId,
          status: "pending",
          deliveryDate: input.deliveryDate,
          specialInstructions: input.specialInstructions,
          createdAt: new Date(),
        }
      }

      // TODO: Implement actual database insert when DB is connected
      return {
        id: `order_${Date.now()}`,
        userId: ctx.user.id,
        mealPlanId: input.mealPlanId,
        status: "pending",
        deliveryDate: input.deliveryDate,
        specialInstructions: input.specialInstructions,
        createdAt: new Date(),
      }
    }),
})
