"use client";

import { cn } from "@/lib/utils.ts";
import { getGoalDefinition } from "./goal-picker.ts";
import { calculatePricing, formatCents, HOUSEHOLDS } from "./plan-helpers.ts";
import type {
  Cadence,
  HouseholdSize,
  OnboardingGoal,
} from "./use-onboarding-state.ts";

interface SummaryBarProps {
  readonly cadence?: Cadence;
  readonly goal?: OnboardingGoal;
  readonly household?: HouseholdSize;
  readonly mealsSelected: number;
  readonly targetMeals: number;
}

/**
 * Persistent summary bar — activates starting at step 3 in the
 * onboarding flow. Renders the user's running plan choices and
 * live-calculated price.
 *
 * Before a plan is chosen (household + cadence both set), shows a
 * gentle placeholder so the user understands where pricing will
 * appear. Once both are picked, pricing updates instantly.
 *
 * On desktop this is mounted in the OnboardingShell's <aside> slot
 * and gets a sticky position. On mobile it falls below the main
 * content but above the sticky footer — so the user sees pricing
 * right before hitting Continue.
 */
export function SummaryBar({
  household,
  cadence,
  goal,
  mealsSelected,
  targetMeals,
}: SummaryBarProps) {
  const pricing = calculatePricing(household, cadence);
  const householdLabel = household
    ? HOUSEHOLDS.find((h) => h.id === household)?.title
    : null;
  const goalDef = goal ? getGoalDefinition(goal) : null;
  const GoalIcon = goalDef?.icon;

  const hasPlan = !!household && !!cadence;
  const mealsComplete = mealsSelected === targetMeals && targetMeals > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          Your box
        </h2>
        {GoalIcon && goalDef && (
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <GoalIcon aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
            {goalDef.title}
          </span>
        )}
      </div>

      {hasPlan ? (
        <>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-muted-foreground">Household</dt>
              <dd className="font-medium text-foreground">{householdLabel}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-muted-foreground">Cadence</dt>
              <dd className="font-medium text-foreground">
                {pricing.cadenceLabel}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-muted-foreground">Meals</dt>
              <dd
                className={cn(
                  "font-medium",
                  mealsComplete ? "text-primary" : "text-foreground"
                )}
              >
                {mealsSelected > 0
                  ? `${mealsSelected} / ${pricing.mealCount}`
                  : pricing.mealCount}
              </dd>
            </div>
          </dl>

          <div className="mt-4 space-y-1.5 border-border border-t pt-4 text-sm">
            <div className="flex items-baseline justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCents(pricing.subtotal)}</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex items-baseline justify-between text-accent">
                <span>Subscription 10% off</span>
                <span>−{formatCents(pricing.discount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-1 font-semibold text-base text-foreground">
              <span>Total</span>
              <span aria-live="polite">{formatCents(pricing.total)}</span>
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground leading-relaxed">
              {pricing.isSubscription
                ? "Charged on each delivery day. Pause or cancel anytime."
                : "One-time charge on delivery day."}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-4 text-muted-foreground text-sm">
          Pick your household and cadence to see pricing.
        </p>
      )}
    </div>
  );
}
