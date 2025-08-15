import { pgTable, text, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"), // customer, admin, super_admin
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  roleIdx: index("idx_user_role").on(table.role),
}))

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const mealPlan = pgTable("meal_plan", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  planType: text("plan_type").notNull(), // 'small' or 'medium'
  billingType: text("billing_type").notNull(), // 'subscription' or 'one-time'
  deliveryFrequency: text("delivery_frequency"), // 'weekly', 'bi-weekly', 'monthly'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const order = pgTable("order", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  mealPlanId: text("meal_plan_id").references(() => mealPlan.id),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'preparing', 'shipped', 'delivered'
  totalAmount: integer("total_amount").notNull(), // in cents
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// RBAC Tables
export const permission = pgTable("permission", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const rolePermission = pgTable("role_permission", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),
  permissionId: text("permissionId")
    .notNull()
    .references(() => permission.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  roleIdx: index("idx_role_permission_role").on(table.role),
  uniqueRolePermission: index("role_permission_role_permissionId_unique").on(table.role, table.permissionId),
}))

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resourceId"),
  details: jsonb("details"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  // Integrity protection fields
  contentHash: text("contentHash").notNull(), // SHA-256 hash of log content
  previousHash: text("previousHash"), // Hash of previous log entry for chain integrity
  signature: text("signature"), // Optional digital signature for high-security environments
}, (table) => ({
  userIdIdx: index("idx_audit_log_userId").on(table.userId),
  resourceIdx: index("idx_audit_log_resource").on(table.resource),
  createdAtIdx: index("idx_audit_log_createdAt").on(table.createdAt),
  contentHashIdx: index("idx_audit_log_content_hash").on(table.contentHash),
}))

// Rate limiting table for security
export const rateLimitRecord = pgTable("rate_limit_record", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(), // IP address or user ID
  action: text("action").notNull(), // login, api_call, etc.
  windowStart: timestamp("windowStart").notNull(),
  requestCount: integer("requestCount").notNull().default(1),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  identifierActionIdx: index("idx_rate_limit_identifier_action").on(table.identifier, table.action),
  windowStartIdx: index("idx_rate_limit_window_start").on(table.windowStart),
}))

// Types
export type User = typeof user.$inferSelect
export type Role = "customer" | "admin" | "super_admin"
export type Permission = typeof permission.$inferSelect
export type RolePermission = typeof rolePermission.$inferSelect
export type AuditLog = typeof auditLog.$inferSelect
export type RateLimitRecord = typeof rateLimitRecord.$inferSelect
