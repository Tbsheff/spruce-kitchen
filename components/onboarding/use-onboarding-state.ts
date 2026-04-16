"use client";

import { useEffect, useReducer, useRef } from "react";
import { onboardingStorage } from "@/lib/storage/onboarding-persistence.ts";
import type {
  AllergenTag,
  Cadence,
  DietTag,
  HouseholdSize,
} from "@/lib/types/enums.ts";
import { isAllergenTag, isDietTag } from "@/lib/types/enums.ts";
import type { MealId } from "@/lib/types/ids.ts";

// Re-export the enum types and runtime guards from their source modules
// so sibling onboarding files keep importing from a single module
// (back-compat with the pre-Wave-1 API surface).
export type {
  AllergenTag,
  Cadence,
  DietTag,
  HouseholdSize,
} from "@/lib/types/enums.ts";
export {
  isAllergenTag,
  isCadence,
  isDietTag,
  isHouseholdSize,
} from "@/lib/types/enums.ts";
export type { MealId } from "@/lib/types/ids.ts";
export { mealId } from "@/lib/types/ids.ts";

/**
 * Onboarding state machine for the 8-step flow.
 *
 * As of Phase 5 this hook mirrors state to localStorage so a user
 * who reloads the tab mid-flow resumes where they left off. Stored
 * progress is ignored after 24 hours to prevent zombie sessions.
 * All localStorage I/O lives in `lib/storage/onboarding-persistence`.
 *
 * Literal-union + branded types flow through this file from Wave 1:
 *  - `HouseholdSize`, `Cadence`, `DietTag`, `AllergenTag` come from
 *    `lib/types/enums.ts`.
 *  - `MealId` comes from `lib/types/ids.ts` and is used as the key
 *    of `selectedMeals` to keep raw strings out of the reducer.
 */

export type OnboardingGoal =
  | "eat-better"
  | "save-time"
  | "stay-healthy"
  | "exploring";

/**
 * Selected-meals map. Readonly to nudge consumers away from in-place
 * mutation; the reducer rebuilds the record on every change anyway.
 */
export type SelectedMeals = Readonly<Record<MealId, number>>;

/**
 * Onboarding state.
 *
 * Optional fields stay as `T?` (not `T | undefined`) to pair with
 * `exactOptionalPropertyTypes: true` in tsconfig — the persistence
 * layer builds the return object via conditional-spread so absent
 * keys are never coerced to `undefined`.
 */
export interface OnboardingState {
  readonly allergens: readonly AllergenTag[];
  readonly cadence?: Cadence;
  readonly diet: readonly DietTag[];
  readonly firstDeliveryDate?: string; // ISO date string
  readonly goal?: OnboardingGoal;
  readonly household?: HouseholdSize;
  readonly paymentComplete: boolean;
  readonly selectedMeals: SelectedMeals;
  readonly step: number;
}

export const TOTAL_STEPS = 8;

/**
 * Step labels for the progress bar. The index is the step number.
 * Order must match the reducer's step progression.
 */
export const STEP_LABELS = [
  "Welcome",
  "Your goal",
  "Diet & allergens",
  "Your plan",
  "Pick your meals",
  "Delivery",
  "Review",
  "Payment",
] as const;

/**
 * Set of valid onboarding goals. Exported for `canAdvance` and the
 * persistence-layer guard. Keep in sync with `OnboardingGoal`.
 */
export const ONBOARDING_GOALS = [
  "eat-better",
  "save-time",
  "stay-healthy",
  "exploring",
] as const satisfies readonly OnboardingGoal[];
export const ONBOARDING_GOAL_SET: ReadonlySet<OnboardingGoal> = new Set(
  ONBOARDING_GOALS
);
export function isOnboardingGoal(v: unknown): v is OnboardingGoal {
  return typeof v === "string" && (ONBOARDING_GOAL_SET as Set<string>).has(v);
}

type Action =
  | { type: "SET_GOAL"; value: OnboardingGoal }
  | { type: "TOGGLE_DIET"; value: DietTag }
  | { type: "TOGGLE_ALLERGEN"; value: AllergenTag }
  | { type: "SET_HOUSEHOLD"; value: HouseholdSize }
  | { type: "SET_CADENCE"; value: Cadence }
  | { type: "SET_MEAL_QTY"; mealId: MealId; qty: number }
  | { type: "SET_MEAL_SELECTION"; meals: SelectedMeals }
  | { type: "SET_DELIVERY_DATE"; date: string }
  | { type: "SET_PAYMENT_COMPLETE"; complete: boolean }
  | { type: "HYDRATE"; state: OnboardingState }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET" };

const initialState: OnboardingState = {
  step: 0,
  diet: [],
  allergens: [],
  selectedMeals: {} as SelectedMeals,
  paymentComplete: false,
};

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case "SET_GOAL":
      return { ...state, goal: action.value };

    case "TOGGLE_DIET": {
      if (!isDietTag(action.value)) {
        return state;
      }
      const next = state.diet.includes(action.value)
        ? state.diet.filter((v) => v !== action.value)
        : [...state.diet, action.value];
      return { ...state, diet: next };
    }

    case "TOGGLE_ALLERGEN": {
      if (!isAllergenTag(action.value)) {
        return state;
      }
      const next = state.allergens.includes(action.value)
        ? state.allergens.filter((v) => v !== action.value)
        : [...state.allergens, action.value];
      return { ...state, allergens: next };
    }

    case "SET_HOUSEHOLD":
      return { ...state, household: action.value };

    case "SET_CADENCE":
      return { ...state, cadence: action.value };

    case "SET_MEAL_QTY": {
      if (action.qty <= 0) {
        const { [action.mealId]: _removed, ...rest } = state.selectedMeals;
        return { ...state, selectedMeals: rest as SelectedMeals };
      }
      return {
        ...state,
        selectedMeals: {
          ...state.selectedMeals,
          [action.mealId]: action.qty,
        } as SelectedMeals,
      };
    }

    case "SET_MEAL_SELECTION":
      return { ...state, selectedMeals: action.meals };

    case "SET_DELIVERY_DATE":
      return { ...state, firstDeliveryDate: action.date };

    case "SET_PAYMENT_COMPLETE":
      return { ...state, paymentComplete: action.complete };

    case "HYDRATE":
      return action.state;

    case "NEXT":
      return { ...state, step: Math.min(TOTAL_STEPS - 1, state.step + 1) };

    case "BACK":
      return { ...state, step: Math.max(0, state.step - 1) };

    case "RESET":
      return initialState;
  }
}

/**
 * Exhaustive step-advance predicate — single source of truth for
 * whether the user can move from `state.step` to `state.step + 1`.
 * Every screen that renders a "Continue" button should gate on this.
 *
 * Keeping the logic here (next to the reducer) avoids drift between
 * the orchestrator's `canGoNext` and any future preview/step-jump UI.
 */
export function canAdvance(
  state: OnboardingState,
  targetMealCount: number
): boolean {
  switch (state.step) {
    case 0: // Welcome — no validation, always advance.
      return true;
    case 1: // Goal picker — must choose a goal.
      return state.goal !== undefined;
    case 2: // Diet & allergens — optional, always advance.
      return true;
    case 3: // Plan — household + cadence required.
      return state.household !== undefined && state.cadence !== undefined;
    case 4: // Meals — must match the target count exactly.
      return (
        targetMealCount > 0 &&
        Object.values(state.selectedMeals).reduce(
          (sum, qty) => sum + qty,
          0
        ) === targetMealCount
      );
    case 5: // Delivery — must pick a date.
      return Boolean(state.firstDeliveryDate);
    case 6: // Review — always ready.
      return true;
    case 7: // Payment — must complete the form.
      return state.paymentComplete;
    default:
      return false;
  }
}

// ─── Persistence ─────────────────────────────────────────────────
//
// Progress is mirrored to localStorage on every change. Stale progress
// (> 24 hours old) is ignored so users don't resume zombie sessions.
// The completed snapshot is written by the orchestrator at submit time
// and consumed by the success page. The actual storage reads/writes
// live in `lib/storage/onboarding-persistence`.

/**
 * Snapshot the current state into the "completed" slot and clear
 * the in-progress slot. Called by the orchestrator after a successful
 * mealPlan.create mutation. The success page reads this snapshot to
 * render the confirmation view.
 */
export function snapshotCompletedOrder(state: OnboardingState): void {
  onboardingStorage.saveCompleted(state);
  onboardingStorage.clearProgress();
}

export function readCompletedOrder(): OnboardingState | null {
  return onboardingStorage.loadCompleted();
}

export function clearCompletedOrder(): void {
  onboardingStorage.clearCompleted();
}

export function useOnboardingState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydrationAttempted = useRef(false);
  const lastPersistedState = useRef<string | null>(null);

  // Hydrate from localStorage once on mount. Guarded with a ref so
  // React 18 StrictMode's double-invoke doesn't double-hydrate.
  useEffect(() => {
    if (hydrationAttempted.current) {
      return;
    }
    hydrationAttempted.current = true;

    const stored = onboardingStorage.loadProgress();
    if (stored) {
      const serializedStoredState = JSON.stringify(stored);
      lastPersistedState.current = serializedStoredState;
      dispatch({ type: "HYDRATE", state: stored });
      return;
    }

    lastPersistedState.current = JSON.stringify(initialState);
  }, []);

  // Persist every state change after the initial hydration attempt.
  // We gate on hydrationAttempted so the first render (before hydrate
  // runs) doesn't overwrite stored progress with the empty initial state.
  useEffect(() => {
    if (!hydrationAttempted.current) {
      return;
    }
    const serializedState = JSON.stringify(state);
    if (serializedState === lastPersistedState.current) {
      return;
    }
    lastPersistedState.current = serializedState;
    onboardingStorage.saveProgress(state);
  }, [state]);

  return { state, dispatch };
}

/**
 * Total meals currently selected. Cheap O(n) reduce — fine for our
 * small meal list, no memoization needed.
 */
export function totalMeals(state: OnboardingState): number {
  return Object.values(state.selectedMeals).reduce((sum, qty) => sum + qty, 0);
}
