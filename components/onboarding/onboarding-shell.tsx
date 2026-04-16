"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Logo } from "@/components/ui/logo.tsx";
import { Progress } from "@/components/ui/progress.tsx";

interface OnboardingShellProps {
  /** Whether the Back button should be enabled */
  readonly canGoBack: boolean;
  /** Whether the primary CTA should be enabled (per-step validation) */
  readonly canGoNext: boolean;
  /** Main step content — a single step component at a time */
  readonly children: React.ReactNode;
  /** Show a pending state on the primary CTA (e.g. during async submit) */
  readonly isNextPending?: boolean;
  /** Label for the primary CTA. Defaults to "Continue". */
  readonly nextLabel?: string;
  readonly onBack: () => void;
  readonly onNext: () => void;
  /** Zero-indexed current step */
  readonly step: number;
  /** Human-readable label for the current step, shown in the progress bar */
  readonly stepLabel: string;
  /**
   * Optional side slot for the summary bar. Rendered on desktop as a
   * sticky right-side aside, and on mobile as a card above the footer.
   * Activates starting at Phase 3 (step 3+).
   */
  readonly summary?: React.ReactNode;
  /** Total number of steps in the flow */
  readonly totalSteps: number;
}

/**
 * Minimal onboarding chrome: logo, skip link, progress bar, content area
 * with optional summary sidebar, and a sticky footer with Back/Next buttons.
 *
 * Deliberately does NOT use the marketing Header/Footer — this flow is
 * for authenticated users who should not see public-nav links like
 * "Login" or "Order Now". Also does not use the authenticated sidebar
 * shell — onboarding is a modal-style linear flow where the sidebar
 * would add cognitive load without value.
 */
export function OnboardingShell({
  step,
  totalSteps,
  stepLabel,
  canGoBack,
  canGoNext,
  nextLabel = "Continue",
  isNextPending = false,
  onBack,
  onNext,
  children,
  summary,
}: OnboardingShellProps) {
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal header with brand mark + skip link + progress bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <Link
            className="transition-opacity hover:opacity-80"
            href="/dashboard"
          >
            <Logo />
          </Link>
          <Button
            asChild
            className="text-muted-foreground hover:text-foreground"
            size="sm"
            variant="ghost"
          >
            <Link href="/dashboard">Skip for now</Link>
          </Button>
        </div>
        <div className="container px-4 pb-3 lg:px-6">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{stepLabel}</span>
            <span className="text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </span>
          </div>
          <Progress
            aria-label={`Onboarding progress: step ${step + 1} of ${totalSteps}`}
            className="h-1.5"
            value={progress}
          />
        </div>
      </header>

      {/* Main content area: step content on the left, optional summary on the right */}
      <main className="flex-1">
        <div className="container px-4 py-8 lg:px-6 lg:py-12">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">{children}</div>
            {summary && (
              <aside className="lg:sticky lg:top-28 lg:self-start">
                {summary}
              </aside>
            )}
          </div>
        </div>
      </main>

      {/* Sticky footer with Back/Next — always reachable on mobile */}
      <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <Button
            className="gap-2"
            disabled={!canGoBack || isNextPending}
            onClick={onBack}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Button
            className="gap-2"
            disabled={!canGoNext || isNextPending}
            onClick={onNext}
          >
            <span>{isNextPending ? "Working…" : nextLabel}</span>
            {!isNextPending && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
