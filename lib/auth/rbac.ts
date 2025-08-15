import { db } from "@/lib/db"
import { rolePermission, permission, user } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import type { Role, Permission } from "@/lib/db/schema"

export class RBACService {
  /**
   * Get all permissions for a given role - no cache, always fresh from DB
   */
  static async getRolePermissions(role: Role): Promise<string[]> {
    if (!process.env.DATABASE_URL) {
      return this.getMockPermissions(role)
    }

    try {
      const dbInstance = db()
      const permissions = await dbInstance
        .select({
          name: permission.name,
        })
        .from(rolePermission)
        .leftJoin(permission, eq(rolePermission.permissionId, permission.id))
        .where(eq(rolePermission.role, role))

      return permissions
        .map(p => p.name)
        .filter(Boolean) as string[]
    } catch (error) {
      console.error("Failed to fetch role permissions:", error)
      return this.getMockPermissions(role)
    }
  }

  /**
   * Check if a role has a specific permission
   */
  static async hasPermission(role: Role, permissionName: string): Promise<boolean> {
    const permissions = await this.getRolePermissions(role)
    return permissions.includes(permissionName)
  }

  /**
   * Check if a user has a specific permission
   */
  static async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
    if (!process.env.DATABASE_URL) {
      return this.hasPermission("customer", permissionName)
    }

    try {
      const dbInstance = db()
      const userData = await dbInstance
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      if (!userData.length) {
        return false
      }

      return this.hasPermission(userData[0].role as Role, permissionName)
    } catch (error) {
      console.error("Failed to check user permission:", error)
      return false
    }
  }

  /**
   * Check if a user can access a resource they own
   */
  static async canAccessOwnResource(
    userId: string, 
    resourceUserId: string, 
    permissionName: string
  ): Promise<boolean> {
    // First check if user owns the resource
    if (userId === resourceUserId) {
      return this.userHasPermission(userId, permissionName)
    }

    // If not owner, check for admin permissions
    const adminPermission = permissionName.replace(":own", ":all")
    return this.userHasPermission(userId, adminPermission)
  }

  /**
   * Get user role from database
   */
  static async getUserRole(userId: string): Promise<Role> {
    if (!process.env.DATABASE_URL) {
      return "customer"
    }

    try {
      const dbInstance = db()
      const userData = await dbInstance
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      return (userData[0]?.role as Role) || "customer"
    } catch (error) {
      console.error("Failed to get user role:", error)
      return "customer"
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  static async hasAnyRole(userId: string, roles: Role[]): Promise<boolean> {
    const userRole = await this.getUserRole(userId)
    return roles.includes(userRole)
  }

  /**
   * Check if user is admin or super_admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    return this.hasAnyRole(userId, ["admin", "super_admin"])
  }

  /**
   * Check if user is super_admin
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    return this.hasAnyRole(userId, ["super_admin"])
  }


  /**
   * Mock permissions for development without database
   */
  private static getMockPermissions(role: Role): string[] {
    const permissionMap: Record<Role, string[]> = {
      customer: [
        "user:read:own",
        "user:write:own",
        "order:read:own",
        "order:write:own",
        "mealplan:read:own",
        "mealplan:write:own",
      ],
      admin: [
        "user:read:own",
        "user:write:own",
        "user:read:all",
        "order:read:own",
        "order:write:own",
        "order:read:all",
        "order:write:all",
        "mealplan:read:own",
        "mealplan:write:own",
        "mealplan:read:all",
        "mealplan:write:all",
        "admin:dashboard",
        "admin:reports",
        "admin:users",
      ],
      super_admin: [
        "user:read:own",
        "user:write:own",
        "user:read:all",
        "user:write:all",
        "user:delete:all",
        "order:read:own",
        "order:write:own",
        "order:read:all",
        "order:write:all",
        "order:delete:all",
        "mealplan:read:own",
        "mealplan:write:own",
        "mealplan:read:all",
        "mealplan:write:all",
        "mealplan:delete:all",
        "admin:dashboard",
        "admin:reports",
        "admin:users",
        "admin:system",
      ],
    }

    return permissionMap[role] || []
  }
}

// Convenience functions for common permission checks
export const hasPermission = RBACService.hasPermission
export const userHasPermission = RBACService.userHasPermission
export const canAccessOwnResource = RBACService.canAccessOwnResource
export const isAdmin = RBACService.isAdmin
export const isSuperAdmin = RBACService.isSuperAdmin
export const getUserRole = RBACService.getUserRole
