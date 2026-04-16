"use client";

import { AlertTriangle, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import type { AvailableMeal } from "./plan-helpers.ts";

interface MealCardProps {
  readonly canIncrement: boolean;
  readonly excludeReason?: string | null;
  readonly isExcluded: boolean;
  readonly meal: AvailableMeal;
  readonly onDecrement: () => void;
  readonly onIncrement: () => void;
  readonly qty: number;
}

/**
 * Reusable meal card with a brand-styled CSS-only placeholder image.
 *
 * No network requests for photography yet — the placeholder is a
 * gradient with a dotted pattern and a centered UtensilsCrossed icon,
 * consistent with the landing hero card. Swap with real photos
 * by replacing the placeholder div with <Image src={meal.image} ...>
 * when assets are ready.
 *
 * When a meal contains an allergen the user flagged, the card goes
 * grey, the stepper is replaced with an exclusion message, and a
 * destructive badge overlays the image. The user still sees the meal
 * so they know we're honoring their preferences — they just can't
 * add it.
 */
export function MealCard({
  meal,
  qty,
  isExcluded,
  excludeReason,
  canIncrement,
  onIncrement,
  onDecrement,
}: MealCardProps) {
  return (
    <article
      aria-label={`${meal.name}${isExcluded ? ` — contains ${excludeReason}` : ""}`}
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card transition-all",
        isExcluded ? "opacity-70" : "hover:shadow-md",
        qty > 0 && !isExcluded && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Brand-styled placeholder image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary via-background to-primary/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, hsl(var(--brand-hookers)) 1px, transparent 1px), radial-gradient(circle at 75% 65%, hsl(var(--brand-persian)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20">
            <UtensilsCrossed
              aria-hidden="true"
              className="h-7 w-7 text-primary"
            />
          </div>
        </div>
        {qty > 0 && !isExcluded && (
          <div className="absolute top-3 right-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2 font-semibold text-primary-foreground text-sm shadow-md">
            ×{qty}
          </div>
        )}
        {isExcluded && excludeReason && (
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-center">
            <Badge className="gap-1 shadow-lg" variant="destructive">
              <AlertTriangle aria-hidden="true" className="h-3 w-3" />
              Contains {excludeReason.toLowerCase()}
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground leading-tight">
            {meal.name}
          </h3>
          <p className="text-muted-foreground text-sm">{meal.description}</p>
        </div>

        {meal.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meal.dietaryTags.map((tag) => (
              <Badge
                className="text-[10px] uppercase tracking-wide"
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-muted-foreground text-xs">
          {meal.calories} cal · {meal.protein}g protein
        </div>

        <div className="flex items-center justify-between border-border border-t pt-3">
          {isExcluded ? (
            <span className="font-medium text-muted-foreground text-xs">
              Excluded by your preferences
            </span>
          ) : (
            <>
              <span className="text-muted-foreground text-xs">
                {qty === 0 ? "Add to box" : `${qty} in box`}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  aria-label={`Remove one ${meal.name}`}
                  className="h-8 w-8 p-0"
                  disabled={qty === 0}
                  onClick={onDecrement}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  −
                </Button>
                <div className="min-w-6 text-center font-semibold text-foreground text-sm">
                  {qty}
                </div>
                <Button
                  aria-label={`Add one ${meal.name}`}
                  className="h-8 w-8 p-0"
                  disabled={!canIncrement && qty === 0}
                  onClick={onIncrement}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  +
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
