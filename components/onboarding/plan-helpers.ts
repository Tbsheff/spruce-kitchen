import { calculateOrderTotal } from "@/lib/pricing.ts";
import type {
  Cadence,
  BoxSize as EnumBoxSize,
  HouseholdSize,
} from "@/lib/types/enums.ts";
import type { MealId } from "@/lib/types/ids.ts";
import type {
  OnboardingGoal,
  OnboardingState,
  SelectedMeals,
} from "./use-onboarding-state.ts";

/**
 * Re-exported `MealId` constructor — callers that only import from
 * `plan-helpers.ts` (the nearest module with meal-related helpers)
 * can brand raw strings without a second import.
 */
// biome-ignore lint/performance/noBarrelFile: intentional re-export for module ergonomics
export { mealId } from "@/lib/types/ids.ts";

/**
 * Plan helpers — pricing math and chef's-picks selection.
 *
 * All functions here are pure. They take inputs and return outputs
 * with no side effects, no React, no hooks. The orchestrator page
 * calls them at step boundaries.
 *
 * Design doc: docs/onboarding-rebuild.md §§4.2, 5.1
 */

/**
 * Onboarding box size. The pricing engine currently supports only
 * `small` and `medium` even though the broader enum also includes
 * `large`, so we narrow explicitly here.
 */
export type BoxSize = Extract<EnumBoxSize, "small" | "medium">;

/**
 * Meal shape shared between step-meals, summary-bar, and chefsPicks.
 * Matches the output of trpc.mealPlan.getAvailableMeals — see
 * lib/trpc/routers/mealPlan.ts. All fields are `readonly` because
 * this record is passed through a reducer and consumed in render —
 * nobody should be mutating it in place.
 */
export interface AvailableMeal {
  readonly allergens: readonly string[];
  readonly calories: number;
  readonly carbs: number;
  readonly description: string;
  readonly dietaryTags: readonly string[];
  readonly fat: number;
  readonly id: MealId;
  readonly image: string;
  readonly name: string;
  readonly protein: number;
}

// ─── Household → box size + meal count ───────────────────────────

export const HOUSEHOLDS: readonly {
  readonly id: HouseholdSize;
  readonly title: string;
  readonly people: string;
}[] = [
  { id: "solo", title: "Just me", people: "1 person" },
  { id: "couple", title: "Couple", people: "2 people" },
  { id: "family", title: "Family", people: "3–4 people" },
  { id: "big-family", title: "Big family", people: "5+ people" },
] as const;

/**
 * Runtime set derived from the display table above. Single source of
 * truth for "is this a valid household id?" — importing modules should
 * use this instead of redefining their own set (avoids drift if a new
 * household tier is ever added).
 */
export const HOUSEHOLD_ID_SET: ReadonlySet<HouseholdSize> = new Set(
  HOUSEHOLDS.map((h) => h.id)
);

export const CADENCES: readonly {
  readonly id: Cadence;
  readonly title: string;
  readonly subtitle: string;
  readonly isSubscription: boolean;
}[] = [
  {
    id: "weekly",
    title: "Weekly",
    subtitle: "A fresh box every week",
    isSubscription: true,
  },
  {
    id: "bi-weekly",
    title: "Every 2 weeks",
    subtitle: "Good balance of fresh & flexible",
    isSubscription: true,
  },
  {
    id: "monthly",
    title: "Monthly",
    subtitle: "Stock up, skip the shuffle",
    isSubscription: true,
  },
  {
    id: "one-time",
    title: "Just this once",
    subtitle: "No commitment — one box only",
    isSubscription: false,
  },
] as const;

export const CADENCE_ID_SET: ReadonlySet<Cadence> = new Set(
  CADENCES.map((c) => c.id)
);

const CADENCE_BY_ID: Record<Cadence, (typeof CADENCES)[number]> = {
  weekly: CADENCES[0],
  "bi-weekly": CADENCES[1],
  monthly: CADENCES[2],
  "one-time": CADENCES[3],
};

export function householdToBoxSize(h: HouseholdSize): BoxSize {
  return h === "solo" || h === "couple" ? "small" : "medium";
}

/**
 * Recommended meal count per box based on household size.
 * Drives the step-4 target count and the chef's-picks auto-fill.
 */
export function recommendedMealCount(h: HouseholdSize): number {
  switch (h) {
    case "solo":
      return 4;
    case "couple":
      return 6;
    case "family":
      return 10;
    case "big-family":
      return 12;
    default:
      return 10;
  }
}

// ─── Pricing ─────────────────────────────────────────────────────

export interface PricingBreakdown {
  readonly boxSize: BoxSize | null;
  /** Human-friendly cadence label, or empty string if no cadence chosen */
  readonly cadenceLabel: string;
  /** Discount in cents (positive number) */
  readonly discount: number;
  readonly isSubscription: boolean;
  readonly mealCount: number;
  /** Subtotal in cents */
  readonly subtotal: number;
  /** Total in cents */
  readonly total: number;
}

/**
 * Compute the full pricing breakdown for a given household + cadence.
 * Returns zeros if either is missing — safe to call before the user
 * has finished step 3.
 */
export function calculatePricing(
  household: HouseholdSize | undefined,
  cadence: Cadence | undefined
): PricingBreakdown {
  if (!(household && cadence)) {
    return {
      boxSize: null,
      mealCount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
      isSubscription: false,
      cadenceLabel: "",
    };
  }
  const boxSize = householdToBoxSize(household);
  const mealCount = recommendedMealCount(household);
  const cadenceDef = CADENCE_BY_ID[cadence];
  const isSubscription = cadenceDef.isSubscription;
  const { subtotal, discount, total } = calculateOrderTotal(
    boxSize,
    isSubscription ? "subscription" : "one-time"
  );
  return {
    boxSize,
    mealCount,
    subtotal,
    discount,
    total,
    isSubscription,
    cadenceLabel: cadenceDef.title,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Allergen filtering & chef's picks ───────────────────────────

/**
 * Case-insensitive check: does this meal contain any user allergen?
 * Returns the matching allergen name for display, or null if allowed.
 */
export function findExcludingAllergen(
  meal: Pick<AvailableMeal, "allergens">,
  userAllergens: readonly string[]
): string | null {
  if (!(meal.allergens?.length && userAllergens.length)) {
    return null;
  }

  const allergenLookup = createNormalizedValueMap(userAllergens);
  for (const mealAllergen of meal.allergens) {
    const matchingAllergen = allergenLookup.get(mealAllergen.toLowerCase());
    if (matchingAllergen) {
      return matchingAllergen;
    }
  }
  return null;
}

/**
 * Chef's picks: deterministic meal selection based on goal, dietary
 * preferences, allergens, and target count. See §4.2 of the design doc.
 *
 * Strategy:
 *   1. Filter out allergen-conflicting meals
 *   2. Sort remaining meals by goal-specific priority
 *   3. Boost meals matching the user's dietary preferences
 *   4. Fill the target count, round-robin if fewer unique meals than target
 */
export function computeChefsPicks(
  goal: OnboardingGoal | undefined,
  diet: readonly string[],
  allergens: readonly string[],
  availableMeals: readonly AvailableMeal[],
  targetCount: number
): SelectedMeals {
  if (targetCount <= 0 || availableMeals.length === 0) {
    return {} as SelectedMeals;
  }

  const allergenLookup = createNormalizedValueMap(allergens);
  const dietTokens = normalizeLowercaseList(diet);
  const wantsVegetarian = dietTokens.includes("vegetarian");

  const rankedMeals: {
    meal: AvailableMeal;
    dietMatch: number;
    goalScore: number;
  }[] = [];
  for (const meal of availableMeals) {
    if (hasMatchingAllergen(meal.allergens, allergenLookup)) {
      continue;
    }

    const lowerTags = normalizeLowercaseList(meal.dietaryTags);
    rankedMeals.push({
      meal,
      dietMatch: matchesDiet(lowerTags, dietTokens, wantsVegetarian) ? 1 : 0,
      goalScore: goalPriority(goal, meal),
    });
  }

  if (rankedMeals.length === 0) {
    return {} as SelectedMeals;
  }

  rankedMeals.sort((a, b) => {
    if (a.dietMatch !== b.dietMatch) {
      return b.dietMatch - a.dietMatch;
    }
    if (a.goalScore !== b.goalScore) {
      return b.goalScore - a.goalScore;
    }
    return a.meal.id.localeCompare(b.meal.id);
  });

  const sorted = rankedMeals.map(({ meal }) => meal);

  const result: Record<MealId, number> = {} as Record<MealId, number>;
  for (let index = 0; index < targetCount; index += 1) {
    const meal = sorted[index % sorted.length];
    result[meal.id] = (result[meal.id] || 0) + 1;
  }
  return result as SelectedMeals;
}

function createNormalizedValueMap(
  values: readonly string[]
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const value of values) {
    const normalized = value.trim().toLowerCase();
    if (!normalized || lookup.has(normalized)) {
      continue;
    }
    lookup.set(normalized, value);
  }
  return lookup;
}

function normalizeLowercaseList(values: readonly string[]): string[] {
  const normalized: string[] = [];
  for (const value of values) {
    const lowered = value.trim().toLowerCase();
    if (lowered) {
      normalized.push(lowered);
    }
  }
  return normalized;
}

function hasMatchingAllergen(
  mealAllergens: readonly string[],
  allergenLookup: Map<string, string>
): boolean {
  if (allergenLookup.size === 0) {
    return false;
  }

  for (const allergen of mealAllergens) {
    if (allergenLookup.has(allergen.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function matchesDiet(
  lowerTags: readonly string[],
  dietTokens: readonly string[],
  wantsVegetarian: boolean
): boolean {
  if (dietTokens.length === 0) {
    return false;
  }

  if (
    wantsVegetarian &&
    (lowerTags.includes("vegetarian") || lowerTags.includes("vegan"))
  ) {
    return true;
  }

  for (const dietToken of dietTokens) {
    for (const tag of lowerTags) {
      if (tag.includes(dietToken) || dietToken.includes(tag)) {
        return true;
      }
    }
  }

  return false;
}

function goalPriority(
  goal: OnboardingGoal | undefined,
  meal: AvailableMeal
): number {
  switch (goal) {
    case "eat-better":
      return meal.dietaryTags.length;
    case "save-time":
      return -meal.description.length;
    case "stay-healthy":
      return meal.protein;
    default:
      return 0;
  }
}

/**
 * Sum the quantities in a selectedMeals map. Tiny helper used by
 * the summary bar and the meals step counter.
 */
export function totalSelectedMeals(
  selectedMeals: OnboardingState["selectedMeals"]
): number {
  return Object.values(selectedMeals).reduce((sum, qty) => sum + qty, 0);
}

// ─── Delivery slots ──────────────────────────────────────────────

/**
 * Compute the next N available delivery slots starting from a given
 * date. Skips weekends (no Saturday/Sunday delivery) and adds a 2-day
 * lead time minimum so we never offer same-day or next-day slots.
 *
 * Pure function — no side effects, deterministic for a given fromDate.
 */
export function nextDeliverySlots(
  fromDate: Date = new Date(),
  count = 6
): Date[] {
  const slots: Date[] = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 2); // minimum 2-day lead time

  let safety = 0;
  while (slots.length < count && safety < 30) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      slots.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    safety++;
  }
  return slots;
}

/**
 * Format a delivery date as a friendly chip label like "Mon · Apr 14".
 */
export function formatDeliveryChip(date: Date): {
  weekday: string;
  monthDay: string;
} {
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    monthDay: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };
}
