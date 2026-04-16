/**
 * Single source of truth for literal-union enums used across the app.
 *
 * Each enum exports: a frozen `as const` tuple, a derived literal-union
 * type, a `ReadonlySet` for O(1) runtime membership checks, and a type
 * guard suitable for use in Zod refinements or narrowing.
 */

/** Lifecycle states an order can be in. */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_STATUS_SET: ReadonlySet<OrderStatus> = new Set(
  ORDER_STATUSES
);
/** Runtime guard for `OrderStatus`. */
export function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === "string" && (ORDER_STATUS_SET as Set<string>).has(v);
}

/** Meal-plan box size tiers. Mirrors `BoxSize` at the DB layer. */
export const PLAN_TYPES = ["small", "medium", "large"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];
export const PLAN_TYPE_SET: ReadonlySet<PlanType> = new Set(PLAN_TYPES);
/** Runtime guard for `PlanType`. */
export function isPlanType(v: unknown): v is PlanType {
  return typeof v === "string" && (PLAN_TYPE_SET as Set<string>).has(v);
}

/** Billing models offered for a meal plan. */
export const BILLING_TYPES = ["subscription", "one-time"] as const;
export type BillingType = (typeof BILLING_TYPES)[number];
export const BILLING_TYPE_SET: ReadonlySet<BillingType> = new Set(
  BILLING_TYPES
);
/** Runtime guard for `BillingType`. */
export function isBillingType(v: unknown): v is BillingType {
  return typeof v === "string" && (BILLING_TYPE_SET as Set<string>).has(v);
}

/** Box sizes surfaced in the onboarding flow. */
export const BOX_SIZES = ["small", "medium", "large"] as const;
export type BoxSize = (typeof BOX_SIZES)[number];
export const BOX_SIZE_SET: ReadonlySet<BoxSize> = new Set(BOX_SIZES);
/** Runtime guard for `BoxSize`. */
export function isBoxSize(v: unknown): v is BoxSize {
  return typeof v === "string" && (BOX_SIZE_SET as Set<string>).has(v);
}

/** Canonical dietary-preference tags used in meal metadata and onboarding. */
export const DIET_TAGS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "keto",
  "paleo",
  "high-protein",
] as const;
export type DietTag = (typeof DIET_TAGS)[number];
export const DIET_TAG_SET: ReadonlySet<DietTag> = new Set(DIET_TAGS);
/** Runtime guard for `DietTag`. */
export function isDietTag(v: unknown): v is DietTag {
  return typeof v === "string" && (DIET_TAG_SET as Set<string>).has(v);
}

/** Canonical allergen tags a meal may declare. */
export const ALLERGEN_TAGS = [
  "nuts",
  "shellfish",
  "fish",
  "eggs",
  "soy",
  "sesame",
  "gluten",
  "dairy",
] as const;
export type AllergenTag = (typeof ALLERGEN_TAGS)[number];
export const ALLERGEN_TAG_SET: ReadonlySet<AllergenTag> = new Set(
  ALLERGEN_TAGS
);
/** Runtime guard for `AllergenTag`. */
export function isAllergenTag(v: unknown): v is AllergenTag {
  return typeof v === "string" && (ALLERGEN_TAG_SET as Set<string>).has(v);
}

/** Household-size buckets used to recommend a box size and meal count. */
export const HOUSEHOLD_SIZES = [
  "solo",
  "couple",
  "family",
  "big-family",
] as const;
export type HouseholdSize = (typeof HOUSEHOLD_SIZES)[number];
export const HOUSEHOLD_SIZE_SET: ReadonlySet<HouseholdSize> = new Set(
  HOUSEHOLD_SIZES
);
/** Runtime guard for `HouseholdSize`. */
export function isHouseholdSize(v: unknown): v is HouseholdSize {
  return typeof v === "string" && (HOUSEHOLD_SIZE_SET as Set<string>).has(v);
}

/** Delivery cadences a subscriber can select. */
export const CADENCES = ["weekly", "bi-weekly", "monthly", "one-time"] as const;
export type Cadence = (typeof CADENCES)[number];
export const CADENCE_SET: ReadonlySet<Cadence> = new Set(CADENCES);
/** Runtime guard for `Cadence`. */
export function isCadence(v: unknown): v is Cadence {
  return typeof v === "string" && (CADENCE_SET as Set<string>).has(v);
}

/** Roles recognized by the RBAC layer. Mirrors `Role` in `lib/db/schema.ts`. */
export const ROLES = ["customer", "admin", "super_admin"] as const;
export type { Role } from "../db/schema.ts";
export const ROLE_SET: ReadonlySet<string> = new Set(ROLES);
/** Runtime guard for a role string. */
export function isRole(v: unknown): v is (typeof ROLES)[number] {
  return typeof v === "string" && ROLE_SET.has(v);
}
