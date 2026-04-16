"use client";

import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { planHeadline } from "./goal-picker.ts";
import { CADENCES, HOUSEHOLDS } from "./plan-helpers.ts";
import type {
  Cadence,
  HouseholdSize,
  OnboardingGoal,
} from "./use-onboarding-state.ts";

interface StepPlanProps {
  readonly cadence?: Cadence;
  readonly goal?: OnboardingGoal;
  readonly household?: HouseholdSize;
  readonly onCadenceChange: (c: Cadence) => void;
  readonly onHouseholdChange: (h: HouseholdSize) => void;
}

/**
 * Step 3 — Plan. Combines household size and cadence into one screen.
 * This is where the summary bar activates: the moment the user picks
 * both options, pricing appears in real time.
 *
 * Headline copy adapts to the chosen goal via planHeadline().
 */
export function StepPlan({
  household,
  cadence,
  goal,
  onHouseholdChange,
  onCadenceChange,
}: StepPlanProps) {
  return (
    <section aria-labelledby="onboarding-plan-heading" className="space-y-8">
      <div className="space-y-2">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight"
          id="onboarding-plan-heading"
        >
          {planHeadline(goal)}
        </h1>
        <p className="text-muted-foreground">
          Two quick picks. You can change them anytime from Settings.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="flex items-center gap-2 font-semibold text-base text-foreground">
          <Users aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          Who are we feeding?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
          {HOUSEHOLDS.map((h) => {
            const isSelected = household === h.id;
            return (
              // biome-ignore lint/a11y/useSemanticElements: custom radio card UI — button with role="radio" is the WAI-ARIA pattern for visually styled radio groups
              <button
                aria-checked={isSelected}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border bg-card p-4 text-left transition-all",
                  "hover:border-primary/50 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                    : "border-border"
                )}
                key={h.id}
                onClick={() => onHouseholdChange(h.id)}
                role="radio"
                type="button"
              >
                <span className="font-semibold text-foreground">{h.title}</span>
                <span className="text-muted-foreground text-sm">
                  {h.people}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="flex items-center gap-2 font-semibold text-base text-foreground">
          <Clock aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          How often?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
          {CADENCES.map((c) => {
            const isSelected = cadence === c.id;
            return (
              // biome-ignore lint/a11y/useSemanticElements: custom radio card UI — button with role="radio" is the WAI-ARIA pattern for visually styled radio groups
              <button
                aria-checked={isSelected}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border bg-card p-4 text-left transition-all",
                  "hover:border-primary/50 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                    : "border-border"
                )}
                key={c.id}
                onClick={() => onCadenceChange(c.id)}
                role="radio"
                type="button"
              >
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  {c.title}
                  {c.isSubscription && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-semibold text-[10px] text-accent uppercase tracking-wide">
                      Save 10%
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground text-sm">
                  {c.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
