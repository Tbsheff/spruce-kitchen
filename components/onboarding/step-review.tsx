"use client";

import {
  Calendar,
  CheckCircle,
  CreditCard,
  Package,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { getGoalDefinition, reviewHighlight } from "./goal-picker.ts";
import {
  type AvailableMeal,
  calculatePricing,
  formatCents,
  HOUSEHOLDS,
  totalSelectedMeals,
} from "./plan-helpers.ts";
import type {
  Cadence,
  HouseholdSize,
  OnboardingGoal,
  SelectedMeals,
} from "./use-onboarding-state.ts";

interface StepReviewProps {
  readonly availableMeals: readonly AvailableMeal[];
  readonly cadence?: Cadence;
  readonly firstDeliveryDate?: string;
  readonly goal?: OnboardingGoal;
  readonly household?: HouseholdSize;
  readonly selectedMeals: SelectedMeals;
}

/**
 * Step 6 — Review.
 *
 * Read-only summary of everything the user picked. The goal-driven
 * highlight banner ties the abstract numbers ("6 meals", "$71.99")
 * to the user's stated reason for being here. From the design doc §4.1:
 *   - save-time → "≈ 4 hours of kitchen time saved"
 *   - eat-better → "6 chef-crafted dishes waiting"
 *   - stay-healthy → "Hits your protein target"
 *   - exploring → neutral default
 *
 * No edit buttons — users navigate via the Back button. The shell
 * makes Back always available, so this is a one-click change away.
 */
export function StepReview({
  goal,
  household,
  cadence,
  selectedMeals,
  availableMeals,
  firstDeliveryDate,
}: StepReviewProps) {
  const pricing = calculatePricing(household, cadence);
  const householdLabel = household
    ? HOUSEHOLDS.find((h) => h.id === household)?.title
    : "—";
  const mealCount = totalSelectedMeals(selectedMeals);
  const goalDef = goal ? getGoalDefinition(goal) : null;
  const GoalIcon = goalDef?.icon ?? Sparkles;

  // Build a list of selected meal entries with quantity, in stable order
  const mealEntries = availableMeals
    .filter((m) => (selectedMeals[m.id] || 0) > 0)
    .map((m) => ({ meal: m, qty: selectedMeals[m.id] }));

  const deliveryDate = firstDeliveryDate
    ? new Date(firstDeliveryDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <section aria-labelledby="onboarding-review-heading" className="space-y-6">
      <div className="space-y-2">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight"
          id="onboarding-review-heading"
        >
          Here&apos;s your first box
        </h1>
        <p className="text-muted-foreground">
          Quick review, then you&apos;re all set.
        </p>
      </div>

      {/* Goal-driven highlight banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <GoalIcon aria-hidden="true" className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-primary text-xs uppercase tracking-wide">
            Why this matters
          </p>
          <p className="font-medium text-foreground">
            {reviewHighlight(goal, mealCount)}
          </p>
        </div>
      </div>

      {/* Plan card */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Package
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
          />
          <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Your plan
          </h2>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-baseline justify-between sm:flex-col sm:items-start sm:gap-1">
            <dt className="text-muted-foreground">Household</dt>
            <dd className="font-medium text-foreground">{householdLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between sm:flex-col sm:items-start sm:gap-1">
            <dt className="text-muted-foreground">Cadence</dt>
            <dd className="font-medium text-foreground">
              {pricing.cadenceLabel || "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between sm:flex-col sm:items-start sm:gap-1">
            <dt className="text-muted-foreground">Box size</dt>
            <dd className="font-medium text-foreground capitalize">
              {pricing.boxSize ?? "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between sm:flex-col sm:items-start sm:gap-1">
            <dt className="text-muted-foreground">Meals per box</dt>
            <dd className="font-medium text-foreground">{mealCount}</dd>
          </div>
        </dl>
      </div>

      {/* Meals card */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <CheckCircle
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
          />
          <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            What&apos;s in the box
          </h2>
        </div>
        {mealEntries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No meals selected.</p>
        ) : (
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {mealEntries.map(({ meal, qty }) => (
              <li
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                key={meal.id}
              >
                <span className="truncate text-foreground">{meal.name}</span>
                <Badge className="shrink-0" variant="secondary">
                  ×{qty}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delivery card */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Calendar
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
          />
          <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            First delivery
          </h2>
        </div>
        <p className="font-medium text-foreground">{deliveryDate}</p>
        <p className="text-muted-foreground text-xs">
          You&apos;ll get a tracking link 24 hours before delivery.
        </p>
      </div>

      {/* Pricing card */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <CreditCard
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
          />
          <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            What you&apos;ll pay
          </h2>
        </div>
        <dl className="space-y-1.5 text-sm">
          <div className="flex items-baseline justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd>{formatCents(pricing.subtotal)}</dd>
          </div>
          {pricing.discount > 0 && (
            <div className="flex items-baseline justify-between text-accent">
              <dt>Subscription 10% off</dt>
              <dd>−{formatCents(pricing.discount)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between border-border border-t pt-2 font-semibold text-base text-foreground">
            <dt>Total per box</dt>
            <dd>{formatCents(pricing.total)}</dd>
          </div>
        </dl>
        <p className="text-muted-foreground text-xs">
          {pricing.isSubscription
            ? "You'll be charged on each delivery day. Pause or cancel anytime from your dashboard."
            : "One-time charge on delivery day. No subscription."}
        </p>
      </div>
    </section>
  );
}
