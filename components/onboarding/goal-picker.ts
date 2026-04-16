import type { LucideIcon } from "lucide-react";
import { Clock, Heart, Sparkles, UtensilsCrossed } from "lucide-react";
import type { OnboardingGoal } from "./use-onboarding-state.ts";

/**
 * Goal-picker: pure helpers that keep the onboarding flow's
 * personalization strategy in one place. See
 * docs/onboarding-rebuild.md §4 for the full copy matrix.
 *
 * No database writes, no analytics, no React — just static
 * metadata keyed by goal. Call from any step component.
 */

export interface GoalDefinition {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly id: OnboardingGoal;
  readonly title: string;
}

export const GOALS: readonly GoalDefinition[] = [
  {
    id: "eat-better",
    title: "Eat better food",
    description: "Chef-crafted meals with real ingredients.",
    icon: UtensilsCrossed,
  },
  {
    id: "save-time",
    title: "Save time on dinner",
    description: "Dinner ready in 5 minutes. No planning, no prep.",
    icon: Clock,
  },
  {
    id: "stay-healthy",
    title: "Stay on my nutrition",
    description: "Portion-controlled, macro-balanced meals.",
    icon: Heart,
  },
  {
    id: "exploring",
    title: "I'm just exploring",
    description: "No commitment — show me what you've got.",
    icon: Sparkles,
  },
] as const;

/**
 * Runtime set derived from the display table above. Single source of
 * truth for "is this a valid goal id?". Consumers (including the
 * reducer and persistence layer) should import this instead of
 * redefining the set — otherwise new goals will drift.
 */
export const GOAL_ID_SET: ReadonlySet<OnboardingGoal> = new Set(
  GOALS.map((g) => g.id)
);

const GOALS_BY_ID: Record<OnboardingGoal, GoalDefinition> = GOALS.reduce(
  (acc, goal) => {
    acc[goal.id] = goal;
    return acc;
  },
  {} as Record<OnboardingGoal, GoalDefinition>
);

export function getGoalDefinition(goal: OnboardingGoal): GoalDefinition {
  return GOALS_BY_ID[goal];
}

/**
 * Welcome step subtitle. Used on step 0 where no goal is selected yet,
 * so we return a neutral default. Included here so future welcome-step
 * variants (e.g. returning-user states) can route through the same helper.
 */
export function welcomeSubtitle(_goal?: OnboardingGoal): string {
  return "Four quick questions and we'll have your freezer stocked. Takes about a minute.";
}

/**
 * Plan step heading. Tone adapts to the chosen goal. Returns a
 * neutral default if no goal is selected or exploring is chosen.
 */
export function planHeadline(goal?: OnboardingGoal): string {
  switch (goal) {
    case "eat-better":
      return "How much good food, how often?";
    case "save-time":
      return "Let's get your freezer stocked.";
    case "stay-healthy":
      return "Build your weekly nutrition plan.";
    default:
      return "How much food, how often?";
  }
}

/**
 * Review step highlight line. Used on the review screen to land
 * the "why this matters" punch for the user's chosen goal.
 * Intentionally returns a non-goal default so the review step
 * always has a sensible headline.
 */
export function reviewHighlight(
  goal: OnboardingGoal | undefined,
  mealCount: number
): string {
  switch (goal) {
    case "eat-better":
      return `${mealCount} chef-crafted dishes waiting in your freezer.`;
    case "save-time":
      return `About ${Math.round(mealCount * 0.6)} hours of kitchen time saved this week.`;
    case "stay-healthy":
      return `${mealCount} portion-controlled meals hitting your targets.`;
    default:
      return `${mealCount} meals ready to go.`;
  }
}
