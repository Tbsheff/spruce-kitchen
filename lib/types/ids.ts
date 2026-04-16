/**
 * Branded nominal ID types.
 *
 * Pattern from Effective TypeScript, Item 37 (branded types) and Item 40
 * (hide unsafe assertions inside typed functions). Each constructor is a
 * narrow, documented helper so the `as` cast lives in one place.
 */

declare const BrandSymbol: unique symbol;

type Brand<T, B extends string> = T & { readonly [BrandSymbol]: B };

/** User primary key. */
export type UserId = Brand<string, "UserId">;

/** Meal plan primary key. */
export type MealPlanId = Brand<string, "MealPlanId">;

/** Order primary key. */
export type OrderId = Brand<string, "OrderId">;

/** Meal (catalog item) identifier. */
export type MealId = Brand<string, "MealId">;

/** Permission row primary key. */
export type PermissionId = Brand<string, "PermissionId">;

/** Brand a string as a `UserId`. */
export function userId(s: string): UserId {
  return s as UserId;
}

/** Brand a string as a `MealPlanId`. */
export function mealPlanId(s: string): MealPlanId {
  return s as MealPlanId;
}

/** Brand a string as an `OrderId`. */
export function orderId(s: string): OrderId {
  return s as OrderId;
}

/** Brand a string as a `MealId`. */
export function mealId(s: string): MealId {
  return s as MealId;
}

/** Brand a string as a `PermissionId`. */
export function permissionId(s: string): PermissionId {
  return s as PermissionId;
}

/** Runtime guard — confirms a value is a non-empty string before branding. */
export function isBrandedString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}
