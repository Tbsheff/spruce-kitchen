import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  MEALPLAN_PERMISSIONS,
  ORDER_PERMISSIONS,
} from "@/lib/auth/permissions.ts";
import type { NewMealPlan } from "@/lib/db/schema.ts";
import { resourceProcedure } from "@/lib/identity/trpc/resource-procedure.ts";
import { secureId, secureString } from "@/lib/security/input-validation.ts";
import { rateLimitMiddleware } from "@/lib/security/rate-limiting.ts";
import { adminProcedure, requirePermission } from "@/lib/trpc/procedures.ts";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server.ts";
import { ORDER_STATUSES } from "@/lib/types/enums.ts";

const orderStatusSchema = z.enum(ORDER_STATUSES);

// Shared row loader for meal-plan handlers. Returns null when the row is
// missing so resourceProcedure can raise NOT_FOUND; throws SERVICE_UNAVAILABLE
// only when the database is unreachable (distinct from "not found").
async function loadMealPlanById(input: { id: string }) {
  if (!process.env.DATABASE_URL) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Database required for resource ownership validation",
    });
  }
  const { db } = await import("@/lib/db/index.ts");
  const { mealPlan } = await import("@/lib/db/schema.ts");
  const { eq } = await import("drizzle-orm");
  const rows = await db()
    .select()
    .from(mealPlan)
    .where(eq(mealPlan.id, input.id))
    .limit(1);
  return rows[0] ?? null;
}

export const mealPlanRouter = createTRPCRouter({
  getAvailableMeals: publicProcedure
    .use(rateLimitMiddleware("api:general"))
    .query(() => {
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
      ];
    }),

  // Create a new meal plan - requires mealplan:write:own permission
  create: requirePermission(MEALPLAN_PERMISSIONS.WRITE_OWN)
    .use(rateLimitMiddleware("user:meal_plan_create"))
    .input(
      z.object({
        boxSize: z.enum(["small", "medium"]),
        planType: z.enum(["subscription", "one-time"]),
        deliveryFrequency: z
          .enum(["weekly", "bi-weekly", "monthly"])
          .optional(),
        selectedMeals: z.record(z.string(), z.number().int().min(0)).optional(),
        firstDeliveryDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // SECURITY: Without database, cannot store meal plans - block access
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database required to create meal plans",
        });
      }

      const { db } = await import("@/lib/db/index.ts");
      const dbInstance = db();
      const { mealPlan: mealPlanTable } = await import("@/lib/db/schema.ts");
      const { nanoid } = await import("nanoid");

      const mealPlanId = nanoid();

      // Log the creation. Dates are serialized to ISO strings and optional
      // fields fall back to null so the payload conforms to AuditDetails.
      await ctx.audit.log("mealplan:create", "mealplan", mealPlanId, {
        boxSize: input.boxSize,
        planType: input.planType,
        deliveryFrequency: input.deliveryFrequency ?? null,
        selectedMeals: input.selectedMeals ?? null,
        firstDeliveryDate: input.firstDeliveryDate?.toISOString() ?? null,
      });

      // Create meal plan with proper schema mapping
      const newMealPlan = await dbInstance
        .insert(mealPlanTable)
        .values({
          id: mealPlanId,
          userId: ctx.user.id,
          planType: input.boxSize, // Map boxSize to planType
          billingType: input.planType, // Map planType to billingType
          deliveryFrequency: input.deliveryFrequency,
          selectedMeals: input.selectedMeals,
          firstDeliveryDate: input.firstDeliveryDate,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newMealPlan[0];
    }),

  // Get user's meal plans - requires mealplan:read:own permission
  getUserPlans: requirePermission(MEALPLAN_PERMISSIONS.READ_OWN).query(
    async ({ ctx }) => {
      await ctx.audit.log("mealplan:read_user_plans", "mealplan", undefined, {
        userId: ctx.user.id,
      });

      if (!process.env.DATABASE_URL) {
        // Mock data when no database is configured
        return [];
      }

      // SECURITY: Only return meal plans that belong to the authenticated user
      const { db } = await import("@/lib/db/index.ts");
      const { mealPlan } = await import("@/lib/db/schema.ts");
      const { eq, desc } = await import("drizzle-orm");

      const userPlans = await db()
        .select()
        .from(mealPlan)
        .where(eq(mealPlan.userId, ctx.user.id))
        .orderBy(desc(mealPlan.createdAt));

      return userPlans;
    }
  ),

  // Get meal plan by ID with ownership validation. The resourceProcedure
  // factory owns auth, NOT_FOUND discrimination, ownership check, and
  // audit-on-success. Handler returns the already-loaded row.
  getById: resourceProcedure({
    permission: MEALPLAN_PERMISSIONS.READ_OWN,
    resource: "mealplan",
    action: "read",
    input: z.object({ id: secureId() }),
    loadRow: loadMealPlanById,
  }).query(({ ctx }) => ctx.row),

  update: resourceProcedure({
    permission: MEALPLAN_PERMISSIONS.WRITE_OWN,
    resource: "mealplan",
    action: "update",
    input: z.object({
      id: secureId(),
      boxSize: z.enum(["small", "medium"]).optional(),
      planType: z.enum(["subscription", "one-time"]).optional(),
      deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
    }),
    loadRow: loadMealPlanById,
  }).mutation(async ({ input }) => {
    const { db } = await import("@/lib/db/index.ts");
    const { mealPlan } = await import("@/lib/db/schema.ts");
    const { eq } = await import("drizzle-orm");

    const updateData: Partial<NewMealPlan> = {
      updatedAt: new Date(),
    };
    if (input.deliveryFrequency) {
      updateData.deliveryFrequency = input.deliveryFrequency;
    }
    if (input.planType) {
      updateData.billingType = input.planType;
    }
    if (input.boxSize) {
      updateData.planType = input.boxSize;
    }

    const updatedPlan = await db()
      .update(mealPlan)
      .set(updateData)
      .where(eq(mealPlan.id, input.id))
      .returning();

    return {
      success: true,
      mealPlan: updatedPlan[0],
    };
  }),

  cancel: resourceProcedure({
    permission: MEALPLAN_PERMISSIONS.WRITE_OWN,
    resource: "mealplan",
    action: "cancel",
    input: z.object({ id: secureId() }),
    loadRow: loadMealPlanById,
  }).mutation(async ({ input }) => {
    const { db } = await import("@/lib/db/index.ts");
    const { mealPlan } = await import("@/lib/db/schema.ts");
    const { eq } = await import("drizzle-orm");

    await db()
      .update(mealPlan)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(mealPlan.id, input.id));

    return {
      success: true,
      message: "Meal plan cancelled successfully",
    };
  }),

  createOrder: requirePermission(ORDER_PERMISSIONS.WRITE_OWN)
    .input(
      z.object({
        mealPlanId: secureId(),
        deliveryDate: z.date(),
        specialInstructions: secureString(0, 1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.DATABASE_URL) {
        // SECURITY: Without database, cannot validate ownership - block access
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database required for resource ownership validation",
        });
      }

      // SECURITY: Validate that meal plan belongs to user before creating order
      const { db } = await import("@/lib/db/index.ts");
      const dbInstance = db();
      const { mealPlan: mealPlanTable, order: orderTable } = await import(
        "@/lib/db/schema.ts"
      );
      const { eq, and } = await import("drizzle-orm");
      const { nanoid } = await import("nanoid");

      const mealPlan = await dbInstance
        .select()
        .from(mealPlanTable)
        .where(
          and(
            eq(mealPlanTable.id, input.mealPlanId),
            eq(mealPlanTable.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!mealPlan.length) {
        await ctx.audit.log("order:create_denied", "order", undefined, {
          reason: "meal_plan_ownership_validation_failed",
          mealPlanId: input.mealPlanId,
          userId: ctx.user.id,
        });
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Meal plan not found or access denied",
        });
      }

      const orderId = nanoid();

      await ctx.audit.log("order:create", "order", orderId, {
        mealPlanId: input.mealPlanId,
        deliveryDate: input.deliveryDate.toISOString(),
        specialInstructions: input.specialInstructions ?? null,
      });

      // Pricing uses the shared module so displayed and charged prices
      // always match. See lib/pricing.ts.
      const { calculateOrderTotal, isBoxSize } = await import(
        "@/lib/pricing.ts"
      );
      const planRecord = mealPlan[0];
      if (!isBoxSize(planRecord.planType)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Unsupported plan type: ${planRecord.planType}`,
        });
      }
      const { total: totalAmount } = calculateOrderTotal(
        planRecord.planType,
        planRecord.billingType
      );

      // Create order with validated meal plan ownership
      const newOrder = await dbInstance
        .insert(orderTable)
        .values({
          id: orderId,
          userId: ctx.user.id,
          mealPlanId: input.mealPlanId,
          status: "pending",
          totalAmount,
          deliveryDate: input.deliveryDate,
        })
        .returning();

      return newOrder[0];
    }),

  // Admin-only endpoints
  getAllMealPlans: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["active", "paused", "cancelled"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await ctx.audit.log(
        "admin:list_meal_plans",
        "mealplan",
        undefined,
        input
      );

      if (!process.env.DATABASE_URL) {
        return {
          mealPlans: [],
          total: 0,
        };
      }

      // TODO: Implement actual database query when DB is connected
      return {
        mealPlans: [],
        total: 0,
      };
    }),

  getAllOrders: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: orderStatusSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await ctx.audit.log("admin:list_orders", "order", undefined, input);

      if (!process.env.DATABASE_URL) {
        return {
          orders: [],
          total: 0,
        };
      }

      // TODO: Implement actual database query when DB is connected
      return {
        orders: [],
        total: 0,
      };
    }),

  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: secureId(),
        status: orderStatusSchema,
        notes: secureString(0, 1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.audit.log("admin:update_order_status", "order", input.orderId, {
        newStatus: input.status,
        notes: input.notes ?? null,
        updatedBy: ctx.user.id,
      });

      if (!process.env.DATABASE_URL) {
        return {
          success: true,
          message: `Order status updated to ${input.status}`,
        };
      }

      // TODO: Implement actual database update when DB is connected
      return {
        success: true,
        message: `Order status updated to ${input.status}`,
      };
    }),
});
