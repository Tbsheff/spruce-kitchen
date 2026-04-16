"use client";

/**
 * Onboarding persistence layer.
 *
 * All localStorage I/O for the onboarding flow lives here so the
 * reducer hook stays focused on state transitions. Progress is
 * mirrored to localStorage on every change; stale progress
 * (> 24 hours old) is ignored so users don't resume zombie sessions.
 * The completed snapshot is written by the orchestrator at submit
 * time and consumed by the success page.
 */

import type {
  Cadence,
  HouseholdSize,
  OnboardingGoal,
  OnboardingState,
} from "@/components/onboarding/use-onboarding-state.ts";

export const PROGRESS_STORAGE_KEY = "sk.onboarding.progress.v1";
export const COMPLETED_STORAGE_KEY = "sk.onboarding.last-completed.v1";
const SNAPSHOT_VERSION = 1;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const TOTAL_STEPS = 8;

interface StoredProgress {
  savedAt: number;
  state: OnboardingState;
  version: number;
}

interface StoredCompletedOrder {
  completedAt: number;
  state: OnboardingState;
  version: number;
}

const GOALS = new Set<OnboardingGoal>([
  "eat-better",
  "save-time",
  "stay-healthy",
  "exploring",
]);
const HOUSEHOLDS = new Set<HouseholdSize>([
  "solo",
  "couple",
  "family",
  "big-family",
]);
const CADENCES = new Set<Cadence>([
  "weekly",
  "bi-weekly",
  "monthly",
  "one-time",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function parseSelectedMeals(value: unknown): Record<string, number> | null {
  if (!isObject(value)) {
    return null;
  }

  const entries = Object.entries(value);
  const selectedMeals: Record<string, number> = {};

  for (const [mealId, qty] of entries) {
    if (
      typeof mealId !== "string" ||
      typeof qty !== "number" ||
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      return null;
    }
    selectedMeals[mealId] = qty;
  }

  return selectedMeals;
}

function parseOnboardingState(value: unknown): OnboardingState | null {
  if (!isObject(value)) {
    return null;
  }

  const {
    step,
    goal,
    diet,
    allergens,
    household,
    cadence,
    selectedMeals,
    firstDeliveryDate,
    paymentComplete,
  } = value;

  if (
    typeof step !== "number" ||
    !Number.isInteger(step) ||
    step < 0 ||
    step >= TOTAL_STEPS
  ) {
    return null;
  }
  if (
    goal !== undefined &&
    (typeof goal !== "string" || !GOALS.has(goal as OnboardingGoal))
  ) {
    return null;
  }
  if (!(isStringArray(diet) && isStringArray(allergens))) {
    return null;
  }
  if (
    household !== undefined &&
    (typeof household !== "string" ||
      !HOUSEHOLDS.has(household as HouseholdSize))
  ) {
    return null;
  }
  if (
    cadence !== undefined &&
    (typeof cadence !== "string" || !CADENCES.has(cadence as Cadence))
  ) {
    return null;
  }
  const parsedMeals = parseSelectedMeals(selectedMeals);
  if (!parsedMeals || typeof paymentComplete !== "boolean") {
    return null;
  }
  if (
    firstDeliveryDate !== undefined &&
    typeof firstDeliveryDate !== "string"
  ) {
    return null;
  }

  // exactOptionalPropertyTypes: true — optional keys must be absent rather than
  // set to `undefined`. Spread each optional field conditionally so the key is
  // only present in the object when the value is defined.
  return {
    step,
    diet: diet as OnboardingState["diet"],
    allergens: allergens as OnboardingState["allergens"],
    selectedMeals: parsedMeals,
    paymentComplete,
    ...(goal !== undefined && { goal: goal as OnboardingGoal }),
    ...(household !== undefined && { household: household as HouseholdSize }),
    ...(cadence !== undefined && { cadence: cadence as Cadence }),
    ...(firstDeliveryDate !== undefined && {
      firstDeliveryDate: firstDeliveryDate as string,
    }),
  };
}

function safeRemoveStorageItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* degrade gracefully */
  }
}

function loadProgress(): OnboardingState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    const stored = parsed as Partial<StoredProgress>;
    if (
      stored.version !== SNAPSHOT_VERSION ||
      typeof stored.savedAt !== "number"
    ) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    if (Date.now() - stored.savedAt > STALE_AFTER_MS) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    const state = parseOnboardingState(stored.state);
    if (!state) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    return state;
  } catch {
    safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
    return null;
  }
}

function saveProgress(state: OnboardingState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: StoredProgress = {
      version: SNAPSHOT_VERSION,
      state,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage full / disabled — degrade gracefully */
  }
}

function clearProgress(): void {
  safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
}

function loadCompleted(): OnboardingState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) {
      safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
      return null;
    }
    const stored = parsed as Partial<StoredCompletedOrder>;
    if (
      stored.version !== SNAPSHOT_VERSION ||
      typeof stored.completedAt !== "number"
    ) {
      safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
      return null;
    }
    const state = parseOnboardingState(stored.state);
    if (!state) {
      safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
      return null;
    }
    return state;
  } catch {
    safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
    return null;
  }
}

function saveCompleted(state: OnboardingState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: StoredCompletedOrder = {
      version: SNAPSHOT_VERSION,
      completedAt: Date.now(),
      state,
    };
    window.localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* degrade gracefully */
  }
}

function clearCompleted(): void {
  safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
}

export const onboardingStorage = {
  loadProgress,
  saveProgress,
  clearProgress,
  loadCompleted,
  saveCompleted,
  clearCompleted,
};
