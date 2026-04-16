"use client";

import { Calendar, Truck } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils.ts";
import { formatDeliveryChip, nextDeliverySlots } from "./plan-helpers.ts";

interface StepDeliveryProps {
  readonly onSelect: (isoDate: string) => void;
  readonly selectedDate?: string; // ISO date string
}

/**
 * Step 5 — Delivery date.
 *
 * Shows the next 6 weekday delivery slots (skipping weekends, 2-day
 * lead time) as tappable chips. The first slot gets a "Recommended"
 * badge and is the smart default if the user hits Continue without
 * picking explicitly — but we don't auto-select to keep the flow
 * deliberate.
 *
 * Trade-off: this is a chip picker rather than a full calendar.
 * Pros: faster, fewer decisions, mobile-friendly. Cons: no flexibility
 * past 2 weeks. If users complain, swap in shadcn Calendar component.
 */
export function StepDelivery({ selectedDate, onSelect }: StepDeliveryProps) {
  // Memoize so we don't recompute slots on every render. Refreshes only
  // if the component remounts — fine for a single onboarding session.
  const slots = useMemo(() => nextDeliverySlots(new Date(), 6), []);

  return (
    <section
      aria-labelledby="onboarding-delivery-heading"
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight"
          id="onboarding-delivery-heading"
        >
          When do you want your first box?
        </h1>
        <p className="text-muted-foreground">
          Pick any weekday. We&apos;ll send a tracking link 24 hours before
          delivery.
        </p>
      </div>

      <div
        aria-labelledby="onboarding-delivery-heading"
        className="grid gap-3 sm:grid-cols-3"
        role="radiogroup"
      >
        {slots.map((slot, idx) => {
          const iso = slot.toISOString();
          const isSelected = selectedDate === iso;
          const isRecommended = idx === 0;
          const { weekday, monthDay } = formatDeliveryChip(slot);
          return (
            // biome-ignore lint/a11y/useSemanticElements: custom radio card UI — button with role="radio" is the WAI-ARIA pattern for visually styled radio groups
            <button
              aria-checked={isSelected}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-2xl border bg-card p-4 text-left transition-all",
                "hover:border-primary/50 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                  : "border-border"
              )}
              key={iso}
              onClick={() => onSelect(iso)}
              role="radio"
              type="button"
            >
              {isRecommended && (
                <span className="absolute top-3 right-3 rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-[10px] text-accent uppercase tracking-wide">
                  Soonest
                </span>
              )}
              <div className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
                {weekday}
              </div>
              <div className="font-semibold text-foreground text-lg">
                {monthDay}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
        <Truck
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
        />
        <div className="space-y-1">
          <p className="font-medium text-foreground">How delivery works</p>
          <p className="text-muted-foreground">
            Meals arrive frozen in insulated packaging. Move them to your
            freezer right away — most meals stay fresh for up to 6 months.
          </p>
        </div>
      </div>
    </section>
  );
}
