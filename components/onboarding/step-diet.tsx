"use client";

import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import type { AllergenTag, DietTag } from "./use-onboarding-state.ts";

interface StepDietProps {
  readonly allergens: readonly AllergenTag[];
  readonly diet: readonly DietTag[];
  readonly onToggleAllergen: (value: AllergenTag) => void;
  readonly onToggleDiet: (value: DietTag) => void;
}

/**
 * UI option rows for the diet + allergen toggles.
 *
 * `id` matches the literal-union token in `lib/types/enums.ts` — the
 * reducer only accepts known tags, so we ship both the canonical id
 * and a presentation label. Keeping these aligned with `DIET_TAGS` /
 * `ALLERGEN_TAGS` is the only source of drift risk, so each row is
 * `satisfies { id: DietTag }` so TS flags any typo at compile time.
 */
const DIET_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
] as const satisfies readonly { id: DietTag; label: string }[];

const ALLERGEN_OPTIONS = [
  { id: "nuts", label: "Nuts" },
  { id: "shellfish", label: "Shellfish" },
  { id: "fish", label: "Fish" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "sesame", label: "Sesame" },
] as const satisfies readonly { id: AllergenTag; label: string }[];

/**
 * Step 2 — Diet & allergens.
 *
 * Two multi-select badge groups. Everything is optional — a user
 * with no preferences can Continue without selecting anything.
 *
 * Dietary preferences are suggestions; allergens are warnings.
 * Visually we distinguish them: diet badges use the primary accent
 * when selected; allergen badges use the destructive accent so
 * users associate the red with "this meal will be excluded".
 *
 * Persistence happens at NEXT via the orchestrator, not here.
 * This component is a pure controlled view.
 */
export function StepDiet({
  diet,
  allergens,
  onToggleDiet,
  onToggleAllergen,
}: StepDietProps) {
  return (
    <section aria-labelledby="onboarding-diet-heading" className="space-y-8">
      <div className="space-y-2">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight"
          id="onboarding-diet-heading"
        >
          Anything we should know?
        </h1>
        <p className="text-muted-foreground">
          Tap what applies. Leave it blank if nothing does — totally fine.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-base text-foreground">
            Dietary preferences
          </h2>
          <span className="text-muted-foreground text-xs">
            We&apos;ll prioritize matching meals
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((option) => {
            const isSelected = diet.includes(option.id);
            return (
              <button
                aria-checked={isSelected}
                aria-label={`Toggle ${option.label} dietary preference`}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                key={option.id}
                onClick={() => onToggleDiet(option.id)}
                role="switch"
                type="button"
              >
                <Badge
                  className={cn(
                    "cursor-pointer px-4 py-1.5 font-medium text-sm transition-colors",
                    !isSelected && "hover:bg-muted"
                  )}
                  variant={isSelected ? "default" : "outline"}
                >
                  {option.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-base text-foreground">
            Allergens to avoid
          </h2>
          <span className="text-muted-foreground text-xs">
            We&apos;ll hide any meal that contains these
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((option) => {
            const isSelected = allergens.includes(option.id);
            return (
              <button
                aria-checked={isSelected}
                aria-label={`Toggle ${option.label} allergen`}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                key={option.id}
                onClick={() => onToggleAllergen(option.id)}
                role="switch"
                type="button"
              >
                <Badge
                  className={cn(
                    "cursor-pointer px-4 py-1.5 font-medium text-sm transition-colors",
                    !isSelected && "hover:bg-muted"
                  )}
                  variant={isSelected ? "destructive" : "outline"}
                >
                  {option.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        You can change these anytime from Settings → Preferences.
      </p>
    </section>
  );
}
