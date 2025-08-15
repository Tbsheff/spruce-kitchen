/**
 * Permission Constants and Utilities
 * 
 * This file defines all available permissions in the system and provides
 * utility functions for working with permissions.
 */

// User permissions
export const USER_PERMISSIONS = {
  READ_OWN: "user:read:own",
  WRITE_OWN: "user:write:own",
  READ_ALL: "user:read:all",
  WRITE_ALL: "user:write:all",
  DELETE_ALL: "user:delete:all",
} as const

// Order permissions
export const ORDER_PERMISSIONS = {
  READ_OWN: "order:read:own",
  WRITE_OWN: "order:write:own",
  READ_ALL: "order:read:all",
  WRITE_ALL: "order:write:all",
  DELETE_ALL: "order:delete:all",
} as const

// Meal plan permissions
export const MEALPLAN_PERMISSIONS = {
  READ_OWN: "mealplan:read:own",
  WRITE_OWN: "mealplan:write:own",
  READ_ALL: "mealplan:read:all",
  WRITE_ALL: "mealplan:write:all",
  DELETE_ALL: "mealplan:delete:all",
} as const

// Admin permissions
export const ADMIN_PERMISSIONS = {
  DASHBOARD: "admin:dashboard",
  REPORTS: "admin:reports",
  USERS: "admin:users",
  SYSTEM: "admin:system",
} as const

// All permissions combined
export const PERMISSIONS = {
  USER: USER_PERMISSIONS,
  ORDER: ORDER_PERMISSIONS,
  MEALPLAN: MEALPLAN_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
} as const

// Permission groups for easier management
export const CUSTOMER_PERMISSIONS = [
  USER_PERMISSIONS.READ_OWN,
  USER_PERMISSIONS.WRITE_OWN,
  ORDER_PERMISSIONS.READ_OWN,
  ORDER_PERMISSIONS.WRITE_OWN,
  MEALPLAN_PERMISSIONS.READ_OWN,
  MEALPLAN_PERMISSIONS.WRITE_OWN,
] as const

export const ADMIN_PERMISSION_SET = [
  ...CUSTOMER_PERMISSIONS,
  USER_PERMISSIONS.READ_ALL,
  ORDER_PERMISSIONS.READ_ALL,
  ORDER_PERMISSIONS.WRITE_ALL,
  MEALPLAN_PERMISSIONS.READ_ALL,
  MEALPLAN_PERMISSIONS.WRITE_ALL,
  ADMIN_PERMISSIONS.DASHBOARD,
  ADMIN_PERMISSIONS.REPORTS,
  ADMIN_PERMISSIONS.USERS,
] as const

export const SUPER_ADMIN_PERMISSIONS = [
  ...ADMIN_PERMISSION_SET,
  USER_PERMISSIONS.WRITE_ALL,
  USER_PERMISSIONS.DELETE_ALL,
  ORDER_PERMISSIONS.DELETE_ALL,
  MEALPLAN_PERMISSIONS.DELETE_ALL,
  ADMIN_PERMISSIONS.SYSTEM,
] as const

/**
 * Check if a permission is resource-specific (contains :own or :all)
 */
export function isResourcePermission(permission: string): boolean {
  return permission.includes(":own") || permission.includes(":all")
}

/**
 * Get the resource type from a permission string
 */
export function getPermissionResource(permission: string): string | null {
  const parts = permission.split(":")
  return parts.length >= 2 ? parts[0] : null
}

/**
 * Get the action from a permission string
 */
export function getPermissionAction(permission: string): string | null {
  const parts = permission.split(":")
  return parts.length >= 2 ? parts[1] : null
}

/**
 * Get the scope from a permission string (own, all, or null)
 */
export function getPermissionScope(permission: string): "own" | "all" | null {
  const parts = permission.split(":")
  if (parts.length >= 3) {
    const scope = parts[2]
    return scope === "own" || scope === "all" ? scope : null
  }
  return null
}

/**
 * Convert an "own" permission to its "all" equivalent
 */
export function toAllPermission(permission: string): string {
  return permission.replace(":own", ":all")
}

/**
 * Convert an "all" permission to its "own" equivalent
 */
export function toOwnPermission(permission: string): string {
  return permission.replace(":all", ":own")
}

/**
 * Check if two permissions are related (same resource and action, different scope)
 */
export function areRelatedPermissions(perm1: string, perm2: string): boolean {
  const resource1 = getPermissionResource(perm1)
  const resource2 = getPermissionResource(perm2)
  const action1 = getPermissionAction(perm1)
  const action2 = getPermissionAction(perm2)
  
  return resource1 === resource2 && action1 === action2
}

/**
 * Permission hierarchy: "all" permissions include "own" permissions
 */
export function permissionIncludes(hasPermission: string, requiredPermission: string): boolean {
  // Exact match
  if (hasPermission === requiredPermission) {
    return true
  }
  
  // Check if "all" permission covers "own" permission
  if (requiredPermission.endsWith(":own") && hasPermission === toAllPermission(requiredPermission)) {
    return true
  }
  
  return false
}

/**
 * Type-safe permission strings
 */
export type UserPermission = typeof USER_PERMISSIONS[keyof typeof USER_PERMISSIONS]
export type OrderPermission = typeof ORDER_PERMISSIONS[keyof typeof ORDER_PERMISSIONS]
export type MealPlanPermission = typeof MEALPLAN_PERMISSIONS[keyof typeof MEALPLAN_PERMISSIONS]
export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS]
export type Permission = UserPermission | OrderPermission | MealPlanPermission | AdminPermission