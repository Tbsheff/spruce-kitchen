"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Lock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { calculatePricing, formatCents } from "./plan-helpers.ts";
import type { Cadence, HouseholdSize } from "./use-onboarding-state.ts";

interface StepPaymentProps {
  readonly cadence?: Cadence;
  readonly household?: HouseholdSize;
  readonly onComplete: (complete: boolean) => void;
  readonly paymentComplete: boolean;
}

// ─── Schema ─────────────────────────────────────────────────────
//
// Validation for the demo card form. Matches the existing
// PaymentFields shape (name, cardNumber, expiry, cvc). When real
// Stripe lands this whole schema goes away alongside the form body.

const paymentSchema = z.object({
  name: z.string().trim().min(1, "Cardholder name is required"),
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d+$/, "Card number must contain only digits")
        .min(13, "Card number must be 13–19 digits")
        .max(19, "Card number must be 13–19 digits")
    ),
  expiry: z.string().regex(/^\d{2}\s*\/\s*\d{2}$/, "Use MM / YY format"),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
});

type PaymentFormValues = z.input<typeof paymentSchema>;

const EMPTY_FIELDS: PaymentFormValues = {
  name: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

const COMPLETED_DEMO_FIELDS: PaymentFormValues = {
  name: "Spruce Kitchen Demo",
  cardNumber: "4242 4242 4242 4242",
  expiry: "12 / 34",
  cvc: "123",
};

/**
 * Step 7 — Payment (DEMO MODE).
 *
 * Renders a card-shaped form with prominent DEMO MODE banner. The fields
 * are visual only — there is no real Stripe integration in this rebuild.
 * Validation is handled by react-hook-form + Zod; whenever the form is
 * valid the parent reducer's paymentComplete flag flips true.
 *
 * When real Stripe lands, replace the form contents with Stripe Elements
 * and replace the local validation with Stripe's PaymentElement onChange.
 * The DEMO MODE banner should be removed at the same time.
 */
export function StepPayment({
  household,
  cadence,
  paymentComplete,
  onComplete,
}: StepPaymentProps) {
  const pricing = calculatePricing(household, cadence);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    mode: "onChange",
    defaultValues: paymentComplete ? COMPLETED_DEMO_FIELDS : EMPTY_FIELDS,
  });

  // Propagate validity to the parent reducer. We intentionally keep the
  // form values local to this component — only the boolean travels up.
  const isValid = form.formState.isValid;
  useEffect(() => {
    if (isValid !== paymentComplete) {
      onComplete(isValid);
    }
  }, [isValid, paymentComplete, onComplete]);

  return (
    <section aria-labelledby="onboarding-payment-heading" className="space-y-6">
      <div className="space-y-2">
        <h1
          className="font-bold text-3xl text-foreground tracking-tight"
          id="onboarding-payment-heading"
        >
          Payment details
        </h1>
        <p className="text-muted-foreground">
          {pricing.isSubscription
            ? `We'll charge ${formatCents(pricing.total)} on each delivery day. Pause or cancel anytime.`
            : `We'll charge ${formatCents(pricing.total)} on your delivery day. No subscription.`}
        </p>
      </div>

      {/* DEMO MODE banner — yellow/amber, prominent. Strip when real Stripe lands. */}
      <div
        className="flex items-start gap-3 rounded-2xl border-2 border-yellow-400/50 bg-yellow-50 p-4 dark:border-yellow-500/40 dark:bg-yellow-950/40"
        role="alert"
      >
        <Info
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-yellow-700 dark:text-yellow-400"
        />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-yellow-900 dark:text-yellow-200">
            Demo mode — no real charges
          </p>
          <p className="text-yellow-800 dark:text-yellow-300/90">
            This is a placeholder card form. Type anything in the fields below
            and we&apos;ll mark payment as complete. Real Stripe integration is
            coming.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
            Card details
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cardholder name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="cc-name"
                    placeholder="Jane Doe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card number</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="cc-number"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      placeholder="MM / YY"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVC</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      placeholder="123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <p className="text-muted-foreground text-xs">
        By tapping{" "}
        <span className="font-medium text-foreground">Complete order</span>, you
        agree to Spruce Kitchen&apos;s Terms and Privacy Policy.
      </p>
    </section>
  );
}
