-- RBAC Implementation Migration
-- Add role-based access control to Spruce Kitchen

-- 1. Add role column to user table
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'customer' NOT NULL;

-- 2. Create permissions table
CREATE TABLE IF NOT EXISTS "permission" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "resource" text NOT NULL,
    "action" text NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "permission_name_unique" UNIQUE("name")
);

-- 3. Create role_permissions table
CREATE TABLE IF NOT EXISTS "role_permission" (
    "id" text PRIMARY KEY NOT NULL,
    "role" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "role_permission_role_permissionId_unique" UNIQUE("role", "permissionId")
);

-- 4. Create audit_log table
CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" text PRIMARY KEY NOT NULL,
    "userId" text,
    "action" text NOT NULL,
    "resource" text NOT NULL,
    "resourceId" text,
    "details" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

-- 5. Add foreign key constraints
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_permission_id_fk" 
    FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE cascade;

ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_user_id_fk" 
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE set null;

-- 6. Add role constraint to ensure valid roles
ALTER TABLE "user" ADD CONSTRAINT "user_role_check" 
    CHECK ("role" IN ('customer', 'admin', 'super_admin'));

-- 7. Insert base permissions
INSERT INTO "permission" ("id", "name", "description", "resource", "action") VALUES
-- User permissions
('perm_user_read_own', 'user:read:own', 'Read own user profile', 'user', 'read:own'),
('perm_user_write_own', 'user:write:own', 'Update own user profile', 'user', 'write:own'),
('perm_user_read_all', 'user:read:all', 'Read all user profiles', 'user', 'read:all'),
('perm_user_write_all', 'user:write:all', 'Update any user profile', 'user', 'write:all'),
('perm_user_delete_all', 'user:delete:all', 'Delete any user account', 'user', 'delete:all'),

-- Order permissions
('perm_order_read_own', 'order:read:own', 'Read own orders', 'order', 'read:own'),
('perm_order_write_own', 'order:write:own', 'Create/update own orders', 'order', 'write:own'),
('perm_order_read_all', 'order:read:all', 'Read all orders', 'order', 'read:all'),
('perm_order_write_all', 'order:write:all', 'Update any order', 'order', 'write:all'),
('perm_order_delete_all', 'order:delete:all', 'Delete any order', 'order', 'delete:all'),

-- Meal plan permissions
('perm_mealplan_read_own', 'mealplan:read:own', 'Read own meal plans', 'mealplan', 'read:own'),
('perm_mealplan_write_own', 'mealplan:write:own', 'Create/update own meal plans', 'mealplan', 'write:own'),
('perm_mealplan_read_all', 'mealplan:read:all', 'Read all meal plans', 'mealplan', 'read:all'),
('perm_mealplan_write_all', 'mealplan:write:all', 'Update any meal plan', 'mealplan', 'write:all'),
('perm_mealplan_delete_all', 'mealplan:delete:all', 'Delete any meal plan', 'mealplan', 'delete:all'),

-- Admin permissions
('perm_admin_dashboard', 'admin:dashboard', 'Access admin dashboard', 'admin', 'dashboard'),
('perm_admin_reports', 'admin:reports', 'Access admin reports', 'admin', 'reports'),
('perm_admin_users', 'admin:users', 'Manage user accounts', 'admin', 'users'),
('perm_admin_system', 'admin:system', 'System configuration', 'admin', 'system');

-- 8. Assign permissions to roles
INSERT INTO "role_permission" ("id", "role", "permissionId") VALUES
-- Customer role permissions
('rp_customer_1', 'customer', 'perm_user_read_own'),
('rp_customer_2', 'customer', 'perm_user_write_own'),
('rp_customer_3', 'customer', 'perm_order_read_own'),
('rp_customer_4', 'customer', 'perm_order_write_own'),
('rp_customer_5', 'customer', 'perm_mealplan_read_own'),
('rp_customer_6', 'customer', 'perm_mealplan_write_own'),

-- Admin role permissions (includes all customer permissions + admin permissions)
('rp_admin_1', 'admin', 'perm_user_read_own'),
('rp_admin_2', 'admin', 'perm_user_write_own'),
('rp_admin_3', 'admin', 'perm_user_read_all'),
('rp_admin_4', 'admin', 'perm_order_read_own'),
('rp_admin_5', 'admin', 'perm_order_write_own'),
('rp_admin_6', 'admin', 'perm_order_read_all'),
('rp_admin_7', 'admin', 'perm_order_write_all'),
('rp_admin_8', 'admin', 'perm_mealplan_read_own'),
('rp_admin_9', 'admin', 'perm_mealplan_write_own'),
('rp_admin_10', 'admin', 'perm_mealplan_read_all'),
('rp_admin_11', 'admin', 'perm_mealplan_write_all'),
('rp_admin_12', 'admin', 'perm_admin_dashboard'),
('rp_admin_13', 'admin', 'perm_admin_reports'),
('rp_admin_14', 'admin', 'perm_admin_users'),

-- Super Admin role permissions (all permissions)
('rp_super_1', 'super_admin', 'perm_user_read_own'),
('rp_super_2', 'super_admin', 'perm_user_write_own'),
('rp_super_3', 'super_admin', 'perm_user_read_all'),
('rp_super_4', 'super_admin', 'perm_user_write_all'),
('rp_super_5', 'super_admin', 'perm_user_delete_all'),
('rp_super_6', 'super_admin', 'perm_order_read_own'),
('rp_super_7', 'super_admin', 'perm_order_write_own'),
('rp_super_8', 'super_admin', 'perm_order_read_all'),
('rp_super_9', 'super_admin', 'perm_order_write_all'),
('rp_super_10', 'super_admin', 'perm_order_delete_all'),
('rp_super_11', 'super_admin', 'perm_mealplan_read_own'),
('rp_super_12', 'super_admin', 'perm_mealplan_write_own'),
('rp_super_13', 'super_admin', 'perm_mealplan_read_all'),
('rp_super_14', 'super_admin', 'perm_mealplan_write_all'),
('rp_super_15', 'super_admin', 'perm_mealplan_delete_all'),
('rp_super_16', 'super_admin', 'perm_admin_dashboard'),
('rp_super_17', 'super_admin', 'perm_admin_reports'),
('rp_super_18', 'super_admin', 'perm_admin_users'),
('rp_super_19', 'super_admin', 'perm_admin_system');

-- 9. Create indexes for performance
CREATE INDEX "idx_role_permission_role" ON "role_permission"("role");
CREATE INDEX "idx_audit_log_userId" ON "audit_log"("userId");
CREATE INDEX "idx_audit_log_resource" ON "audit_log"("resource");
CREATE INDEX "idx_audit_log_createdAt" ON "audit_log"("createdAt");
CREATE INDEX "idx_user_role" ON "user"("role");