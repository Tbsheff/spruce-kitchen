/**
 * Single source of truth for literal-union enums used across the app.
 *
 * Each enum exports: a frozen `as const` tuple, a derived literal-union
 * type, a `ReadonlySet` for O(1) runtime membership checks, and a type
 * guard suitable for use in Zod refinements or narrowing.
 *
 * Each `_xxxSet` is a module-private `ReadonlySet<string>` used by the
 * type guards (so `.has(v)` accepts an unnarrowed string without a cast),
 * while the exported `XXX_SET` is the same underlying set re-typed as
 * `ReadonlySet<Enum>` for external consumers that want the narrow type.
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
const _orderStatusSet: ReadonlySet<string> = new Set(ORDER_STATUSES);
export const ORDER_STATUS_SET: ReadonlySet<OrderStatus> =
  _orderStatusSet as ReadonlySet<OrderStatus>;
/** Runtime guard for `OrderStatus`. */
export function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === "string" && _orderStatusSet.has(v);
}

/** Meal-plan box size tiers. Mirrors `BoxSize` at the DB layer. */
export const PLAN_TYPES = ["small", "medium", "large"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];
const _planTypeSet: ReadonlySet<string> = new Set(PLAN_TYPES);
export const PLAN_TYPE_SET: ReadonlySet<PlanType> =
  _planTypeSet as ReadonlySet<PlanType>;
/** Runtime guard for `PlanType`. */
export function isPlanType(v: unknown): v is PlanType {
  return typeof v === "string" && _planTypeSet.has(v);
}

/** Billing models offered for a meal plan. */
export const BILLING_TYPES = ["subscription", "one-time"] as const;
export type BillingType = (typeof BILLING_TYPES)[number];
const _billingTypeSet: ReadonlySet<string> = new Set(BILLING_TYPES);
export const BILLING_TYPE_SET: ReadonlySet<BillingType> =
  _billingTypeSet as ReadonlySet<BillingType>;
/** Runtime guard for `BillingType`. */
export function isBillingType(v: unknown): v is BillingType {
  return typeof v === "string" && _billingTypeSet.has(v);
}

/** Box sizes surfaced in the onboarding flow. */
export const BOX_SIZES = ["small", "medium", "large"] as const;
export type BoxSize = (typeof BOX_SIZES)[number];
const _boxSizeSet: ReadonlySet<string> = new Set(BOX_SIZES);
export const BOX_SIZE_SET: ReadonlySet<BoxSize> =
  _boxSizeSet as ReadonlySet<BoxSize>;
/** Runtime guard for `BoxSize`. */
export function isBoxSize(v: unknown): v is BoxSize {
  return typeof v === "string" && _boxSizeSet.has(v);
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
const _dietTagSet: ReadonlySet<string> = new Set(DIET_TAGS);
export const DIET_TAG_SET: ReadonlySet<DietTag> =
  _dietTagSet as ReadonlySet<DietTag>;
/** Runtime guard for `DietTag`. */
export function isDietTag(v: unknown): v is DietTag {
  return typeof v === "string" && _dietTagSet.has(v);
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
const _allergenTagSet: ReadonlySet<string> = new Set(ALLERGEN_TAGS);
export const ALLERGEN_TAG_SET: ReadonlySet<AllergenTag> =
  _allergenTagSet as ReadonlySet<AllergenTag>;
/** Runtime guard for `AllergenTag`. */
export function isAllergenTag(v: unknown): v is AllergenTag {
  return typeof v === "string" && _allergenTagSet.has(v);
}

/** Household-size buckets used to recommend a box size and meal count. */
export const HOUSEHOLD_SIZES = [
  "solo",
  "couple",
  "family",
  "big-family",
] as const;
export type HouseholdSize = (typeof HOUSEHOLD_SIZES)[number];
const _householdSizeSet: ReadonlySet<string> = new Set(HOUSEHOLD_SIZES);
export const HOUSEHOLD_SIZE_SET: ReadonlySet<HouseholdSize> =
  _householdSizeSet as ReadonlySet<HouseholdSize>;
/** Runtime guard for `HouseholdSize`. */
export function isHouseholdSize(v: unknown): v is HouseholdSize {
  return typeof v === "string" && _householdSizeSet.has(v);
}

/** Delivery cadences a subscriber can select. */
export const CADENCES = ["weekly", "bi-weekly", "monthly", "one-time"] as const;
export type Cadence = (typeof CADENCES)[number];
const _cadenceSet: ReadonlySet<string> = new Set(CADENCES);
export const CADENCE_SET: ReadonlySet<Cadence> =
  _cadenceSet as ReadonlySet<Cadence>;
/** Runtime guard for `Cadence`. */
export function isCadence(v: unknown): v is Cadence {
  return typeof v === "string" && _cadenceSet.has(v);
}

/** Roles recognized by the RBAC layer. Mirrors `Role` in `lib/db/schema.ts`. */
export const ROLES = ["customer", "admin", "super_admin"] as const;
export type { Role } from "../db/schema.ts";

const _roleSet: ReadonlySet<string> = new Set(ROLES);
export const ROLE_SET: ReadonlySet<string> = _roleSet;
/** Runtime guard for a role string. */
export function isRole(v: unknown): v is (typeof ROLES)[number] {
  return typeof v === "string" && _roleSet.has(v);
}
