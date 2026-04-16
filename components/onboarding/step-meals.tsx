"use client";

import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button.tsx";
import { MealCard } from "./meal-card.tsx";
import {
  type AvailableMeal,
  computeChefsPicks,
  findExcludingAllergen,
  totalSelectedMeals,
} from "./plan-helpers.ts";
import type {
  MealId,
  OnboardingGoal,
  SelectedMeals,
} from "./use-onboarding-state.ts";

interface StepMealsProps {
  readonly allergens: readonly string[];
  readonly availableMeals: readonly AvailableMeal[];
  readonly diet: readonly string[];
  readonly goal?: OnboardingGoal;
  readonly onApplyChefsPicks: (picks: SelectedMeals) => void;
  readonly onDecrement: (mealId: MealId) => void;
  readonly onIncrement: (mealId: MealId) => void;
  readonly selectedMeals: SelectedMeals;
  readonly targetCount: number;
}

/**
 * Step 4 — Meal selection.
 *
 * Shows every available meal as a MealCard, with excluded meals
 * greyed out so the user sees their preferences being honored.
 * Provides a "Chef's picks" shortcut that fills the target count
 * in one click using goal-driven deterministic selection.
 *
 * The selection contract is strict: exactly `targetCount` meals
 * must be picked before the user can advance (enforced by the
 * orchestrator's canGoNext logic).
 */
export function StepMeals({
  availableMeals,
  selectedMeals,
  targetCount,
  diet,
  allergens,
  goal,
  onIncrement,
  onDecrement,
  onApplyChefsPicks,
}: StepMealsProps) {
  const currentTotal = totalSelectedMeals(selectedMeals);
  const remaining = targetCount - currentTotal;
  const canIncrement = remaining > 0;

  // Annotate each meal with its exclusion state so the grid stays lean.
  const annotated = useMemo(
    () =>
      availableMeals.map((meal) => ({
        meal,
        excludeReason: findExcludingAllergen(meal, allergens),
      })),
    [availableMeals, allergens]
  );

  const handleChefsPicks = () => {
    const picks = computeChefsPicks(
      goal,
      diet,
      allergens,
      availableMeals,
      targetCount
    );
    onApplyChefsPicks(picks);
  };

  return (
    <section aria-labelledby="onboarding-meals-heading" className="space-y-6">
      <div className="space-y-2">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight"
          id="onboarding-meals-heading"
        >
          Pick your first {targetCount} meals
        </h1>
        <p className="text-muted-foreground">
          Use{" "}
          <span className="font-medium text-foreground">Chef&apos;s picks</span>{" "}
          to fill your box instantly, or tap any meal to add it yourself.
        </p>
      </div>

      <div className="sticky top-28 z-10 -mx-4 flex items-center justify-between gap-4 border-border border-b bg-background/95 px-4 py-3 backdrop-blur lg:top-28">
        <div className="text-sm">
          <span
            className={`font-semibold ${
              currentTotal === targetCount ? "text-primary" : "text-foreground"
            }`}
          >
            {currentTotal} of {targetCount}
          </span>{" "}
          <span className="text-muted-foreground">meals picked</span>
          {remaining > 0 && currentTotal > 0 && (
            <span className="text-muted-foreground"> · {remaining} to go</span>
          )}
        </div>
        <Button
          className="gap-1.5"
          onClick={handleChefsPicks}
          size="sm"
          type="button"
          variant="outline"
        >
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Chef&apos;s picks
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {annotated.map(({ meal, excludeReason }) => (
          <MealCard
            canIncrement={canIncrement}
            excludeReason={excludeReason}
            isExcluded={!!excludeReason}
            key={meal.id}
            meal={meal}
            onDecrement={() => onDecrement(meal.id)}
            onIncrement={() => onIncrement(meal.id)}
            qty={selectedMeals[meal.id] || 0}
          />
        ))}
      </div>

      {allergens.length > 0 && annotated.some((a) => a.excludeReason) && (
        <p className="text-muted-foreground text-xs">
          Some meals are hidden because of your allergen preferences. You can
          change them in Settings → Preferences.
        </p>
      )}
    </section>
  );
}
