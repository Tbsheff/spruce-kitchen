"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard.tsx";
import { BoxSizeSelection } from "@/components/onboarding/box-size-selection.tsx";
import { DeliveryPlan } from "@/components/onboarding/delivery-plan.tsx";
import { MealSelection } from "@/components/onboarding/meal-selection.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";
import { toast } from "@/hooks/use-toast.ts";
import { useAuth } from "@/lib/auth-context.tsx";
import { calculateOrderTotal } from "@/lib/pricing.ts";
import {
  type CompletedOrderSnapshot,
  onboardingStorage,
} from "@/lib/storage/onboarding-persistence.ts";
import { trpc } from "@/lib/trpc/client.ts";
import { useCreateMealPlan } from "@/lib/trpc/hooks.ts";
import type { BillingType, BoxSize, Cadence } from "@/lib/types/enums.ts";

type Size = Extract<BoxSize, "small" | "medium">;
type PurchaseType = BillingType;
type Frequency = Exclude<Cadence, "one-time">;

interface Selections {
  frequency?: Frequency;
  meals: Record<string, number>;
  purchaseType?: PurchaseType;
  size?: Size;
}

const steps = ["Select Meals", "Choose Size", "Plan & Type"] as const;
const DELIVERY_LEAD_DAYS: Record<
  NonNullable<Selections["frequency"]> | "one-time",
  number
> = {
  weekly: 7,
  "bi-weekly": 14,
  monthly: 30,
  "one-time": 7,
};

function estimateDeliveryDateIso(
  completedAt: number,
  purchaseType: PurchaseType,
  frequency: Selections["frequency"]
): string {
  const daysUntilDelivery =
    purchaseType === "subscription" && frequency
      ? DELIVERY_LEAD_DAYS[frequency]
      : DELIVERY_LEAD_DAYS["one-time"];
  const estimatedDeliveryDate = new Date(completedAt);
  estimatedDeliveryDate.setDate(
    estimatedDeliveryDate.getDate() + daysUntilDelivery
  );
  return estimatedDeliveryDate.toISOString();
}

function getStepValidationError(
  step: number,
  selections: Selections,
  totalMeals: number
): { description?: string; title: string } | null {
  if (step === 0 && totalMeals !== 10) {
    const remaining = 10 - totalMeals;
    return {
      title: "Please select exactly 10 meals",
      description: `You need ${remaining > 0 ? `${remaining} more` : `${Math.abs(remaining)} fewer`} meals.`,
    };
  }
  if (step === 1 && !selections.size) {
    return { title: "Please choose a box size" };
  }
  if (step !== 2) {
    return null;
  }
  if (!selections.purchaseType) {
    return { title: "Please choose a purchase type" };
  }
  if (selections.purchaseType === "subscription" && !selections.frequency) {
    return { title: "Please choose a delivery schedule" };
  }
  return null;
}

function OnboardingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const createMealPlan = useCreateMealPlan();
  const { data: availableMeals, isLoading: mealsLoading } =
    trpc.mealPlan.getAvailableMeals.useQuery();

  const [data, setData] = useState<Selections>(() => ({
    meals: {},
  }));

  useEffect(() => {
    if (availableMeals && Object.keys(data.meals).length === 0) {
      const initialMeals: Record<string, number> = {};
      for (const meal of availableMeals) {
        initialMeals[meal.id] = 1;
      }
      setData((prev) => ({ ...prev, meals: initialMeals }));
    }
  }, [availableMeals, data.meals]);

  const totalMeals = useMemo(
    () => Object.values(data.meals).reduce((a, b) => a + b, 0),
    [data.meals]
  );

  const increment = (mealId: string) => {
    setData((prev) => {
      const currentTotal = Object.values(prev.meals).reduce((a, b) => a + b, 0);
      if (currentTotal >= 10) {
        toast({
          title: "Maximum meals reached",
          description: "You can select up to 10 meals.",
        });
        return prev;
      }
      const nextMeals = {
        ...prev.meals,
        [mealId]: (prev.meals[mealId] || 0) + 1,
      };
      return { ...prev, meals: nextMeals };
    });
  };

  const decrement = (mealId: string) => {
    setData((prev) => {
      const current = prev.meals[mealId] || 0;
      const nextQty = Math.max(0, current - 1);
      const nextMeals = { ...prev.meals };
      if (nextQty === 0) {
        delete nextMeals[mealId];
      } else {
        nextMeals[mealId] = nextQty;
      }
      return { ...prev, meals: nextMeals };
    });
  };

  const saveMealPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue.",
      });
      return false;
    }

    if (!(data.size && data.purchaseType)) {
      toast({
        title: "Missing information",
        description: "Please complete all steps.",
      });
      return false;
    }

    try {
      onboardingStorage.clearCompletedOrder();
      const result = await createMealPlan.mutateAsync({
        boxSize: data.size,
        planType: data.purchaseType,
        deliveryFrequency: data.frequency,
        selectedMeals: data.meals,
      });

      if (result === undefined) {
        throw new Error("Meal plan creation returned no result");
      }

      const completedAt = Date.now();
      const pricing = calculateOrderTotal(data.size, data.purchaseType);
      const mealLookup = new Map(
        (availableMeals ?? []).map((meal) => [meal.id, meal.name])
      );
      const completedOrder: CompletedOrderSnapshot = {
        billingType: data.purchaseType,
        boxSize: data.size,
        completedAt,
        estimatedDeliveryDateIso: estimateDeliveryDateIso(
          completedAt,
          data.purchaseType,
          data.frequency
        ),
        id: result.id,
        meals: Object.entries(data.meals)
          .filter(([, quantity]) => quantity > 0)
          .map(([mealId, quantity]) => ({
            id: mealId,
            name: mealLookup.get(mealId) ?? mealId,
            quantity,
          })),
        pricing,
        ...(data.purchaseType === "subscription" && data.frequency
          ? { deliveryFrequency: data.frequency }
          : {}),
      };

      onboardingStorage.saveCompletedOrder(completedOrder);
      onboardingStorage.clearProgress();

      console.log("Meal plan created:", result);

      toast({
        title: "Order created successfully!",
        description: "Redirecting to confirmation page...",
      });

      setTimeout(() => {
        router.push("/onboarding/success");
      }, 1500);

      return true;
    } catch (error) {
      console.error("Failed to save meal plan:", error);
      toast({
        title: "Order failed",
        description:
          "There was an error processing your order. Please try again.",
      });
      return false;
    }
  };

  const next = async () => {
    const validationError = getStepValidationError(step, data, totalMeals);
    if (validationError) {
      toast(validationError);
      return;
    }
    if (step === 2) {
      const success = await saveMealPlan();
      if (!success) {
        return;
      }

      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  if (mealsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
            <p className="mt-4 text-muted-foreground">Loading meals...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <header className="mt-[25px] mb-8 text-center">
          <h1 className="font-bold text-3xl text-foreground md:text-4xl">
            Welcome {user?.name ? user.name.split(" ")[0] : "back"}! Build Your
            Meal Box
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select your meals, choose your size, and set up your delivery plan.
          </p>
        </header>

        <div className="mb-8 flex items-center justify-center gap-2 text-sm">
          {steps.map((label, i) => {
            const getStepClass = () => {
              if (i === step) {
                return "border-primary bg-primary text-primary-foreground";
              }
              if (i < step) {
                return "border-primary/20 bg-primary/10 text-primary";
              }
              return "border-muted bg-muted text-muted-foreground";
            };
            const stepClass = getStepClass();
            return (
              <div className="flex items-center gap-2" key={label}>
                <div
                  className={`h-10 rounded-full border-2 px-4 transition-colors ${stepClass}`}
                >
                  <div className="flex h-full items-center font-medium">
                    {i + 1}. {label}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 transition-colors ${i < step ? "bg-primary/20" : "bg-muted"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {step === 0 && availableMeals && (
          <MealSelection
            availableMeals={availableMeals}
            meals={data.meals}
            onDecrement={decrement}
            onIncrement={increment}
            totalMeals={totalMeals}
          />
        )}

        {step === 1 && (
          <BoxSizeSelection
            onSizeChange={(size) => setData((p) => ({ ...p, size }))}
            {...(data.size === undefined ? {} : { size: data.size })}
          />
        )}

        {step === 2 && (
          <DeliveryPlan
            onFrequencyChange={(frequency) =>
              setData((p) => ({ ...p, frequency }))
            }
            onPurchaseTypeChange={(purchaseType) =>
              setData((p) => ({ ...p, purchaseType }))
            }
            {...(data.frequency === undefined
              ? {}
              : { frequency: data.frequency })}
            {...(data.purchaseType === undefined
              ? {}
              : { purchaseType: data.purchaseType })}
          />
        )}

        <footer className="mx-auto mt-12 flex max-w-2xl items-center justify-between">
          <Button
            className="flex items-center gap-2 bg-transparent"
            disabled={step === 0 || createMealPlan.isPending}
            onClick={back}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            disabled={
              (step === 0 && totalMeals !== 10) || createMealPlan.isPending
            }
            onClick={next}
          >
            {(() => {
              if (createMealPlan.isPending) {
                return "Processing...";
              }
              if (step < steps.length - 1) {
                return "Next";
              }
              return "Complete Order";
            })()}
            {!createMealPlan.isPending && <ArrowRight className="h-4 w-4" />}
          </Button>
        </footer>
      </main>

      <Footer />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}
