"use client";

import { useAuth } from "@/lib/auth-context.tsx";
import { welcomeSubtitle } from "./goal-picker.ts";

/**
 * Step 0 — Welcome.
 *
 * Personalized greeting with the user's first name. Neutral subtitle
 * because no goal is selected yet. This screen is purely hook + context:
 * set expectations for the upcoming flow, then let the shell's Continue
 * button advance to the goal picker.
 */
export function StepWelcome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <section aria-labelledby="onboarding-welcome-heading" className="space-y-6">
      <div className="space-y-3">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl"
          id="onboarding-welcome-heading"
        >
          Hi {firstName} 👋
        </h1>
        <p className="font-medium text-foreground text-xl">
          Let&apos;s build your first box.
        </p>
        <p className="max-w-prose text-muted-foreground">{welcomeSubtitle()}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          Here&apos;s what happens next
        </h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              1
            </span>
            <span className="text-foreground">
              Tell us what you&apos;re here for and anything you can&apos;t eat.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              2
            </span>
            <span className="text-foreground">
              Pick your household size and cadence — we&apos;ll show the price
              as you go.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              3
            </span>
            <span className="text-foreground">
              Choose your first meals and when you want them delivered.
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}
