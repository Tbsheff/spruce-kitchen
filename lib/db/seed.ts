/**
 * Database Seed Script for Development
 *
 * Creates test data including:
 * - Users with different roles
 * - Meal plans
 * - Orders
 * - RBAC permissions and roles
 * - Sample audit logs
 */

import { resolve } from "node:path";
// Load environment variables
import { config } from "dotenv";
import type { BillingType, OrderStatus, PlanType } from "@/lib/types/enums.ts";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import { scrypt } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./index.ts";
import {
  account,
  auditLog,
  mealPlan,
  type NewMealPlan,
  type NewOrder,
  type NewUser,
  order,
  permission,
  type Role,
  rateLimitRecord,
  rolePermission,
  session,
  user,
} from "./schema.ts";

const scryptAsync = promisify(scrypt);

// Password hashing function (matches better-auth's default)
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Buffer.from(salt).toString("hex");
  const derivedKey = (await scryptAsync(password, saltHex, 64)) as Buffer;
  return `${saltHex}:${derivedKey.toString("hex")}`;
}

// Sample data. Arrays are typed with the Drizzle-inferred `New*` types so
// string literals narrow correctly to the `$type<…>()` unions on the columns
// (role, planType, billingType, status) without explicit `as` casts.
type SeedUser = Omit<NewUser, "role"> & { role: Role };
type SeedMealPlan = Omit<NewMealPlan, "planType" | "billingType"> & {
  planType: PlanType;
  billingType: BillingType;
};
type SeedOrder = Omit<NewOrder, "status"> & { status: OrderStatus };

const SEED_PERMISSIONS = [
  {
    id: "user:read",
    name: "Read Users",
    description: "View user information",
    resource: "user",
    action: "read",
  },
  {
    id: "user:write",
    name: "Write Users",
    description: "Create and update users",
    resource: "user",
    action: "write",
  },
  {
    id: "user:delete",
    name: "Delete Users",
    description: "Delete user accounts",
    resource: "user",
    action: "delete",
  },
  {
    id: "mealplan:read",
    name: "Read Meal Plans",
    description: "View meal plans",
    resource: "mealplan",
    action: "read",
  },
  {
    id: "mealplan:write",
    name: "Write Meal Plans",
    description: "Create and update meal plans",
    resource: "mealplan",
    action: "write",
  },
  {
    id: "mealplan:delete",
    name: "Delete Meal Plans",
    description: "Delete meal plans",
    resource: "mealplan",
    action: "delete",
  },
  {
    id: "order:read",
    name: "Read Orders",
    description: "View orders",
    resource: "order",
    action: "read",
  },
  {
    id: "order:write",
    name: "Write Orders",
    description: "Create and update orders",
    resource: "order",
    action: "write",
  },
  {
    id: "order:delete",
    name: "Delete Orders",
    description: "Delete orders",
    resource: "order",
    action: "delete",
  },
  {
    id: "admin:users",
    name: "Manage Users",
    description: "Full user management",
    resource: "admin",
    action: "users",
  },
  {
    id: "admin:system",
    name: "System Admin",
    description: "System configuration",
    resource: "admin",
    action: "system",
  },
];

const SEED_USERS: SeedUser[] = [
  {
    id: "customer-1",
    email: "customer@test.com",
    name: "John Customer",
    emailVerified: true,
    image: null,
    role: "customer",
  },
  {
    id: "customer-2",
    email: "jane@test.com",
    name: "Jane Smith",
    emailVerified: true,
    image: null,
    role: "customer",
  },
  {
    id: "admin-1",
    email: "admin@test.com",
    name: "Admin User",
    emailVerified: true,
    image: null,
    role: "admin",
  },
  {
    id: "super-admin-1",
    email: "superadmin@test.com",
    name: "Super Admin",
    emailVerified: true,
    image: null,
    role: "super_admin",
  },
];

const SEED_MEAL_PLANS: SeedMealPlan[] = [
  {
    id: "plan-small-weekly",
    userId: "customer-1",
    planType: "small",
    billingType: "subscription",
    deliveryFrequency: "weekly",
    isActive: true,
  },
  {
    id: "plan-medium-monthly",
    userId: "customer-1",
    planType: "medium",
    billingType: "subscription",
    deliveryFrequency: "monthly",
    isActive: true,
  },
  {
    id: "plan-small-onetime",
    userId: "customer-2",
    planType: "small",
    billingType: "one-time",
    deliveryFrequency: null,
    isActive: true,
  },
  {
    id: "plan-inactive",
    userId: "customer-2",
    planType: "medium",
    billingType: "subscription",
    deliveryFrequency: "bi-weekly",
    isActive: false,
  },
];

const SEED_ORDERS: SeedOrder[] = [
  {
    id: "order-1",
    userId: "customer-1",
    mealPlanId: "plan-small-weekly",
    status: "delivered",
    totalAmount: 3999, // $39.99
    deliveryDate: new Date("2024-01-15"),
  },
  {
    id: "order-2",
    userId: "customer-1",
    mealPlanId: "plan-small-weekly",
    status: "shipped",
    totalAmount: 3999,
    deliveryDate: new Date("2024-01-22"),
  },
  {
    id: "order-3",
    userId: "customer-2",
    mealPlanId: "plan-small-onetime",
    status: "pending",
    totalAmount: 3999,
    deliveryDate: new Date("2024-01-30"),
  },
  {
    id: "order-4",
    userId: "customer-1",
    mealPlanId: "plan-medium-monthly",
    status: "confirmed",
    totalAmount: 5999, // $59.99
    deliveryDate: new Date("2024-02-01"),
  },
];

export async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  const dbInstance = db();
  const testPassword = "password123"; // Common test password
  const hashedPassword = await hashPassword(testPassword);

  try {
    // Wrap the full clear+insert sequence in one transaction so a crash
    // mid-seed rolls back cleanly instead of leaving the database in a
    // partially-wiped state that later runs can't repair.
    await dbInstance.transaction(async (tx) => {
      // 1. Clear existing data (in reverse order of dependencies)
      console.log("🧹 Cleaning existing data...");
      await tx.delete(auditLog);
      await tx.delete(rateLimitRecord);
      await tx.delete(rolePermission);
      await tx.delete(order);
      await tx.delete(mealPlan);
      await tx.delete(session);
      await tx.delete(account);
      await tx.delete(user);
      await tx.delete(permission);

      // 2. Seed permissions
      console.log("🔐 Creating permissions...");
      for (const perm of SEED_PERMISSIONS) {
        await tx.insert(permission).values({
          ...perm,
          createdAt: new Date(),
        });
      }

      // 3. Seed users and create accounts with hashed passwords
      console.log("👤 Creating users...");
      for (const userData of SEED_USERS) {
        await tx.insert(user).values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create password account for each user
        await tx.insert(account).values({
          id: crypto.randomUUID(),
          accountId: userData.email, // Use email as account ID for credential accounts
          providerId: "credential", // better-auth uses "credential" for email/password
          userId: userData.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // 4. Seed meal plans
      console.log("🍽️ Creating meal plans...");
      for (const planData of SEED_MEAL_PLANS) {
        await tx.insert(mealPlan).values({
          ...planData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // 5. Seed orders
      console.log("📦 Creating orders...");
      for (const orderData of SEED_ORDERS) {
        await tx.insert(order).values({
          ...orderData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // 6. Create sample audit logs
      console.log("📋 Creating sample audit logs...");
      const auditLogs = [
        {
          id: crypto.randomUUID(),
          userId: "customer-1",
          action: "auth:login",
          resource: "user",
          resourceId: "customer-1",
          details: { loginMethod: "email", success: true },
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          contentHash: "login-hash-1",
          createdAt: new Date(Date.now() - 86_400_000), // 1 day ago
        },
        {
          id: crypto.randomUUID(),
          userId: "customer-1",
          action: "mealplan:create",
          resource: "mealplan",
          resourceId: "plan-small-weekly",
          details: { planType: "small", billingType: "subscription" },
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          contentHash: "mealplan-hash-1",
          createdAt: new Date(Date.now() - 43_200_000), // 12 hours ago
        },
        {
          id: crypto.randomUUID(),
          userId: "admin-1",
          action: "admin:user_management",
          resource: "user",
          resourceId: "customer-2",
          details: { action: "view_profile", reason: "support_request" },
          ipAddress: "10.0.0.50",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          contentHash: "admin-hash-1",
          createdAt: new Date(Date.now() - 21_600_000), // 6 hours ago
        },
        {
          id: crypto.randomUUID(),
          userId: "customer-2",
          action: "order:create",
          resource: "order",
          resourceId: "order-3",
          details: { totalAmount: 3999, planType: "small" },
          ipAddress: "192.168.1.200",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
          contentHash: "order-hash-1",
          createdAt: new Date(Date.now() - 3_600_000), // 1 hour ago
        },
      ];

      for (const log of auditLogs) {
        await tx.insert(auditLog).values(log);
      }

      console.log("✅ Database seeded successfully!");
      console.log("\n📊 Seeded data summary:");
      console.log(`   Users: ${SEED_USERS.length}`);
      console.log(`   Permissions: ${SEED_PERMISSIONS.length}`);
      console.log(`   Meal Plans: ${SEED_MEAL_PLANS.length}`);
      console.log(`   Orders: ${SEED_ORDERS.length}`);
      console.log(`   Audit Logs: ${auditLogs.length}`);
    });

    console.log("\n🔑 Test accounts:");
    console.log("   Customer: customer@test.com");
    console.log("   Customer 2: jane@test.com");
    console.log("   Admin: admin@test.com");
    console.log("   Super Admin: superadmin@test.com");
    console.log("   Password: password123 (for all accounts)");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// CLI runner
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("\n🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
