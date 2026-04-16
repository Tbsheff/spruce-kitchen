import { z } from "zod";
import type { OnboardingState } from "@/components/onboarding/use-onboarding-state.ts";

export const PROGRESS_STORAGE_KEY = "sk.onboarding.progress.v1";
export const COMPLETED_STORAGE_KEY = "sk.onboarding.last-completed.v1";
export const COMPLETED_ORDER_STORAGE_KEY =
  "sk.onboarding.last-completed-order.v1";

const SNAPSHOT_VERSION = 1;
const COMPLETED_ORDER_SNAPSHOT_VERSION = 1;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const COMPLETED_ORDER_STALE_AFTER_MS = 2 * 60 * 60 * 1000;
const TOTAL_STEPS = 8;

export interface CompletedOrderMealSnapshot {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
}

export interface CompletedOrderPricingSnapshot {
  readonly discount: number;
  readonly subtotal: number;
  readonly total: number;
}

export interface CompletedOrderSnapshot {
  readonly billingType: "one-time" | "subscription";
  readonly boxSize: "small" | "medium";
  readonly completedAt: number;
  readonly deliveryFrequency?: "weekly" | "bi-weekly" | "monthly";
  readonly estimatedDeliveryDateIso: string;
  readonly id: string;
  readonly meals: readonly CompletedOrderMealSnapshot[];
  readonly pricing: CompletedOrderPricingSnapshot;
}

const PositiveInt = z.number().int().positive();
const NonNegativeInt = z.number().int().nonnegative();

const OnboardingStateSchema = z.object({
  step: z.number().int().min(0).max(TOTAL_STEPS - 1),
  goal: z
    .enum(["eat-better", "save-time", "stay-healthy", "exploring"])
    .optional(),
  diet: z.array(z.string()),
  allergens: z.array(z.string()),
  household: z.enum(["solo", "couple", "family", "big-family"]).optional(),
  cadence: z
    .enum(["weekly", "bi-weekly", "monthly", "one-time"])
    .optional(),
  selectedMeals: z.record(z.string(), PositiveInt),
  firstDeliveryDate: z.string().optional(),
  paymentComplete: z.boolean(),
});

const PersistedStateSchema = z.object({
  version: z.literal(SNAPSHOT_VERSION),
  state: OnboardingStateSchema,
  savedAt: z.number(),
});

const CompletedStateSchema = z.object({
  version: z.literal(SNAPSHOT_VERSION),
  state: OnboardingStateSchema,
  completedAt: z.number(),
});

const CompletedOrderSnapshotSchema = z.object({
  billingType: z.enum(["one-time", "subscription"]),
  boxSize: z.enum(["small", "medium"]),
  completedAt: PositiveInt,
  deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
  estimatedDeliveryDateIso: z
    .string()
    .refine((value) => Number.isFinite(new Date(value).getTime()), {
      message: "Invalid ISO date",
    }),
  id: z.string().min(1),
  meals: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        quantity: PositiveInt,
      })
    )
    .min(1),
  pricing: z.object({
    discount: NonNegativeInt,
    subtotal: NonNegativeInt,
    total: NonNegativeInt,
  }),
});

const PersistedCompletedOrderSchema = z.object({
  version: z.literal(COMPLETED_ORDER_SNAPSHOT_VERSION),
  snapshot: CompletedOrderSnapshotSchema,
});

type ParsedOnboardingState = z.infer<typeof OnboardingStateSchema>;
type ParsedCompletedOrderSnapshot = z.infer<
  typeof CompletedOrderSnapshotSchema
>;

function toOnboardingState(parsed: ParsedOnboardingState): OnboardingState {
  return {
    step: parsed.step,
    diet: parsed.diet as OnboardingState["diet"],
    allergens: parsed.allergens as OnboardingState["allergens"],
    selectedMeals: parsed.selectedMeals as OnboardingState["selectedMeals"],
    paymentComplete: parsed.paymentComplete,
    ...(parsed.goal !== undefined ? { goal: parsed.goal } : {}),
    ...(parsed.household !== undefined
      ? { household: parsed.household }
      : {}),
    ...(parsed.cadence !== undefined ? { cadence: parsed.cadence } : {}),
    ...(parsed.firstDeliveryDate !== undefined
      ? { firstDeliveryDate: parsed.firstDeliveryDate }
      : {}),
  };
}

function toCompletedOrderSnapshot(
  parsed: ParsedCompletedOrderSnapshot
): CompletedOrderSnapshot {
  return {
    billingType: parsed.billingType,
    boxSize: parsed.boxSize,
    completedAt: parsed.completedAt,
    estimatedDeliveryDateIso: parsed.estimatedDeliveryDateIso,
    id: parsed.id,
    meals: parsed.meals,
    pricing: parsed.pricing,
    ...(parsed.deliveryFrequency !== undefined
      ? { deliveryFrequency: parsed.deliveryFrequency }
      : {}),
  };
}

function safeRemoveStorageItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage failures
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
    const result = PersistedStateSchema.safeParse(JSON.parse(raw));
    if (!result.success) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    if (Date.now() - result.data.savedAt > STALE_AFTER_MS) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    return toOnboardingState(result.data.state);
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
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: SNAPSHOT_VERSION,
        state,
        savedAt: Date.now(),
      })
    );
  } catch {
    // ignore storage failures
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
    const result = CompletedStateSchema.safeParse(JSON.parse(raw));
    if (!result.success) {
      safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
      return null;
    }
    if (Date.now() - result.data.completedAt > STALE_AFTER_MS) {
      safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
      return null;
    }
    return toOnboardingState(result.data.state);
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
    window.localStorage.setItem(
      COMPLETED_STORAGE_KEY,
      JSON.stringify({
        version: SNAPSHOT_VERSION,
        state,
        completedAt: Date.now(),
      })
    );
  } catch {
    // ignore storage failures
  }
}

function clearCompleted(): void {
  safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
}

function loadCompletedOrder(): CompletedOrderSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(COMPLETED_ORDER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const result = PersistedCompletedOrderSchema.safeParse(JSON.parse(raw));
    if (!result.success) {
      safeRemoveStorageItem(COMPLETED_ORDER_STORAGE_KEY);
      return null;
    }
    const snapshot = toCompletedOrderSnapshot(result.data.snapshot);
    if (Date.now() - snapshot.completedAt > COMPLETED_ORDER_STALE_AFTER_MS) {
      safeRemoveStorageItem(COMPLETED_ORDER_STORAGE_KEY);
      return null;
    }
    return snapshot;
  } catch {
    safeRemoveStorageItem(COMPLETED_ORDER_STORAGE_KEY);
    return null;
  }
}

function saveCompletedOrder(snapshot: CompletedOrderSnapshot): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      COMPLETED_ORDER_STORAGE_KEY,
      JSON.stringify({
        version: COMPLETED_ORDER_SNAPSHOT_VERSION,
        snapshot,
      })
    );
  } catch {
    // ignore storage failures
  }
}

function clearCompletedOrder(): void {
  safeRemoveStorageItem(COMPLETED_ORDER_STORAGE_KEY);
}

export const onboardingStorage = {
  loadProgress,
  saveProgress,
  clearProgress,
  loadCompleted,
  saveCompleted,
  clearCompleted,
  loadCompletedOrder,
  saveCompletedOrder,
  clearCompletedOrder,
};
