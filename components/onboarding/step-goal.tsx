"use client";

import { cn } from "@/lib/utils.ts";
import { GOALS } from "./goal-picker.ts";
import type { OnboardingGoal } from "./use-onboarding-state.ts";

interface StepGoalProps {
  readonly onSelect: (goal: OnboardingGoal) => void;
  readonly selectedGoal?: OnboardingGoal;
}

/**
 * Step 1 — Goal picker.
 *
 * Four full-width radio-style cards. Each card is large and
 * thumb-friendly, with icon + title + one-line explanation.
 * Selected state: persian ring + subtle primary tint.
 *
 * Single-click advances the user closer to the value moment —
 * no secondary confirmation needed. They pick, they see the
 * Continue button light up, they move on.
 */
export function StepGoal({ selectedGoal, onSelect }: StepGoalProps) {
  return (
    <section aria-labelledby="onboarding-goal-heading" className="space-y-6">
      <div className="space-y-2">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight"
          id="onboarding-goal-heading"
        >
          What brings you here?
        </h1>
        <p className="text-muted-foreground">
          Pick the one that fits best. We&apos;ll use it to tailor your first
          suggestions.
        </p>
      </div>

      <div
        aria-labelledby="onboarding-goal-heading"
        className="grid gap-3 sm:grid-cols-2"
        role="radiogroup"
      >
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoal === goal.id;
          return (
            // biome-ignore lint/a11y/useSemanticElements: custom radio card UI — button with role="radio" is the WAI-ARIA pattern for visually styled radio groups
            <button
              aria-checked={isSelected}
              className={cn(
                "group flex items-start gap-4 rounded-2xl border bg-card p-5 text-left transition-all",
                "hover:border-primary/50 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                  : "border-border"
              )}
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              role="radio"
              type="button"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="font-semibold text-foreground">
                  {goal.title}
                </div>
                <p className="text-muted-foreground text-sm">
                  {goal.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
