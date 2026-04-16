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
 *
 * Schemas: persisted payloads are validated with Zod on read. A
 * `safeParse` failure is treated identically to missing data — the
 * key is cleared and `null` returned — so a corrupted snapshot
 * cannot wedge the flow.
 */

import { z } from "zod";
import type { OnboardingState } from "@/components/onboarding/use-onboarding-state.ts";

export const PROGRESS_STORAGE_KEY = "sk.onboarding.progress.v1";
export const COMPLETED_STORAGE_KEY = "sk.onboarding.last-completed.v1";
export const COMPLETED_ORDER_STORAGE_KEY =
  "sk.onboarding.last-completed-order.v1";
const SNAPSHOT_VERSION = 1;
const COMPLETED_ORDER_SNAPSHOT_VERSION = 1;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const COMPLETED_ORDER_STALE_AFTER_MS = 2 * 60 * 60 * 1000; // 2 hours
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

// ─── Zod schemas ─────────────────────────────────────────────────
//
// Shapes mirror `OnboardingState` (use-onboarding-state.ts) and
// `CompletedOrderSnapshot` above. Optional fields use `.optional()`
// and are dropped from the narrowed object via conditional-spread
// so they comply with `exactOptionalPropertyTypes: true`.

const PositiveInt = z.number().int().positive();
const NonNegativeInt = z.number().int().nonnegative();

const OnboardingGoalSchema = z.enum([
  "eat-better",
  "save-time",
  "stay-healthy",
  "exploring",
]);

const HouseholdSizeSchema = z.enum(["solo", "couple", "family", "big-family"]);

const CadenceSchema = z.enum(["weekly", "bi-weekly", "monthly", "one-time"]);

const SelectedMealsSchema = z.record(z.string(), PositiveInt);

const OnboardingStateSchema = z.object({
  step: z
    .number()
    .int()
    .min(0)
    .max(TOTAL_STEPS - 1),
  goal: OnboardingGoalSchema.optional(),
  diet: z.array(z.string()),
  allergens: z.array(z.string()),
  household: HouseholdSizeSchema.optional(),
  cadence: CadenceSchema.optional(),
  selectedMeals: SelectedMealsSchema,
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

const CompletedOrderMealSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: PositiveInt,
});

const CompletedOrderPricingSchema = z.object({
  discount: NonNegativeInt,
  subtotal: NonNegativeInt,
  total: NonNegativeInt,
});

const OrderDeliveryFrequencySchema = z.enum(["weekly", "bi-weekly", "monthly"]);

const CompletedOrderSnapshotSchema = z.object({
  billingType: z.enum(["one-time", "subscription"]),
  boxSize: z.enum(["small", "medium"]),
  completedAt: PositiveInt,
  deliveryFrequency: OrderDeliveryFrequencySchema.optional(),
  estimatedDeliveryDateIso: z
    .string()
    .refine((v) => Number.isFinite(new Date(v).getTime()), {
      message: "Invalid ISO date",
    }),
  id: z.string().min(1),
  meals: z.array(CompletedOrderMealSchema).min(1),
  pricing: CompletedOrderPricingSchema,
});

const PersistedCompletedOrderSchema = z.object({
  version: z.literal(COMPLETED_ORDER_SNAPSHOT_VERSION),
  snapshot: CompletedOrderSnapshotSchema,
});

type ParsedOnboardingState = z.infer<typeof OnboardingStateSchema>;
type ParsedCompletedOrderSnapshot = z.infer<
  typeof CompletedOrderSnapshotSchema
>;

/**
 * Zod narrows enum values fine, but arrays come back as `string[]`.
 * Rebuild the state with the canonical branded/readonly shape from
 * `OnboardingState`, honoring `exactOptionalPropertyTypes: true` by
 * spreading only the defined optional keys.
 */
function toOnboardingState(parsed: ParsedOnboardingState): OnboardingState {
  return {
    step: parsed.step,
    diet: parsed.diet as OnboardingState["diet"],
    allergens: parsed.allergens as OnboardingState["allergens"],
    selectedMeals: parsed.selectedMeals as OnboardingState["selectedMeals"],
    paymentComplete: parsed.paymentComplete,
    ...(parsed.goal !== undefined && { goal: parsed.goal }),
    ...(parsed.household !== undefined && { household: parsed.household }),
    ...(parsed.cadence !== undefined && { cadence: parsed.cadence }),
    ...(parsed.firstDeliveryDate !== undefined && {
      firstDeliveryDate: parsed.firstDeliveryDate,
    }),
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
    ...(parsed.deliveryFrequency !== undefined && {
      deliveryFrequency: parsed.deliveryFrequency,
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
    const result = PersistedStateSchema.safeParse(JSON.parse(raw));
    if (!result.success) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    const parsed = result.data;
    if (Date.now() - parsed.savedAt > STALE_AFTER_MS) {
      safeRemoveStorageItem(PROGRESS_STORAGE_KEY);
      return null;
    }
    return toOnboardingState(parsed.state);
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
    const payload = {
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
    const result = CompletedStateSchema.safeParse(JSON.parse(raw));
    if (!result.success) {
      safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
      return null;
    }
    const parsed = result.data;
    if (Date.now() - parsed.completedAt > STALE_AFTER_MS) {
      safeRemoveStorageItem(COMPLETED_STORAGE_KEY);
      return null;
    }
    return toOnboardingState(parsed.state);
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
    const payload = {
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
    const payload = {
      version: COMPLETED_ORDER_SNAPSHOT_VERSION,
      snapshot,
    };
    window.localStorage.setItem(
      COMPLETED_ORDER_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    /* storage full / disabled — degrade gracefully */
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
