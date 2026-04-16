"use client";

import { ArrowLeft, ArrowRight, Check, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BoxSizeSelection } from "@/components/onboarding/box-size-selection.tsx";
import { DeliveryPlan } from "@/components/onboarding/delivery-plan.tsx";
import { MealSelection } from "@/components/onboarding/meal-selection.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { toast } from "@/hooks/use-toast.ts";
import { useAuth } from "@/lib/auth-context.tsx";
import { trpc } from "@/lib/trpc/client.ts";
import { useCreateMealPlan } from "@/lib/trpc/hooks.ts";
import type { BillingType, BoxSize, Cadence } from "@/lib/types/enums.ts";

type Size = Extract<BoxSize, "small" | "medium">;
type PurchaseType = BillingType;
type Frequency = Exclude<Cadence, "one-time">;

interface OrderData {
  frequency?: Frequency;
  meals: Record<string, number>;
  purchaseType?: PurchaseType;
  size?: Size;
}

const steps = [
  "Select Meals",
  "Choose Size",
  "Plan & Type",
  "Review Order",
] as const;

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const createMealPlan = useCreateMealPlan();
  const { data: availableMeals, isLoading: mealsLoading } =
    trpc.mealPlan.getAvailableMeals.useQuery();

  const [data, setData] = useState<OrderData>(() => ({
    meals: {},
  }));

  useMemo(() => {
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
  const remaining = 10 - totalMeals;

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

  const createOrder = async () => {
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
      const result = await createMealPlan.mutateAsync({
        boxSize: data.size,
        planType: data.purchaseType,
        deliveryFrequency: data.frequency,
      });

      if (result === undefined) {
        throw new Error("Meal plan creation returned no result");
      }

      console.log("Order created:", result);

      toast({
        title: "Order created successfully!",
        description: "Redirecting to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

      return true;
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: "Order failed",
        description:
          "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const validateStep0 = () => {
    if (totalMeals !== 10) {
      toast({
        title: "Please select exactly 10 meals",
        description: `You need ${remaining > 0 ? `${remaining} more` : `${Math.abs(remaining)} fewer`} meals.`,
      });
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (!data.size) {
      toast({ title: "Please choose a box size" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!data.purchaseType) {
      toast({ title: "Please choose a purchase type" });
      return false;
    }
    if (data.purchaseType === "subscription" && !data.frequency) {
      toast({ title: "Please choose a delivery schedule" });
      return false;
    }
    return true;
  };

  const next = async () => {
    if (step === 0 && !validateStep0()) {
      return;
    }
    if (step === 1 && !validateStep1()) {
      return;
    }
    if (step === 2 && !validateStep2()) {
      return;
    }
    if (step === 3) {
      await createOrder();
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const calculatePrice = () => {
    if (!data.size) {
      return { subtotal: 0, discount: 0, total: 0 };
    }

    const basePrices = {
      small: 7999, // $79.99
      medium: 14_999, // $149.99
    };

    const subtotal = basePrices[data.size];
    const discount =
      data.purchaseType === "subscription" ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;

    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculatePrice();

  if (mealsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
        <p className="ml-4 text-muted-foreground">Loading meals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Create New Order
          </h1>
          <p className="text-muted-foreground">Build your perfect meal box</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        {steps.map((label, i) => {
          const getStepClasses = () => {
            if (i === step) {
              return "border-primary bg-primary text-primary-foreground";
            }
            if (i < step) {
              return "border-primary/20 bg-primary/10 text-primary";
            }
            return "border-muted bg-muted text-muted-foreground";
          };
          return (
            <div className="flex items-center gap-2" key={label}>
              <div
                className={`h-10 rounded-full border-2 px-4 transition-colors ${getStepClasses()}`}
              >
                <div className="flex h-full items-center font-medium">
                  {i < step ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    `${i + 1}. ${label}`
                  )}
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Review Your Order
                </CardTitle>
                <CardDescription>
                  Confirm your meal selection and delivery preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-2 font-medium">
                    Selected Meals ({totalMeals})
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(data.meals).map(([mealId, qty]) => {
                      const meal = availableMeals?.find((m) => m.id === mealId);
                      if (!meal || qty === 0) {
                        return null;
                      }
                      return (
                        <div
                          className="flex items-center justify-between rounded bg-muted p-2"
                          key={mealId}
                        >
                          <span className="text-sm">{meal.name}</span>
                          <Badge variant="secondary">x{qty}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Box Size:</span>
                    <span className="font-medium capitalize">{data.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Type:</span>
                    <span className="font-medium capitalize">
                      {data.purchaseType?.replace("-", " ")}
                    </span>
                  </div>
                  {data.purchaseType === "subscription" && (
                    <div className="flex justify-between">
                      <span>Delivery Schedule:</span>
                      <span className="font-medium capitalize">
                        {data.frequency?.replace("-", " ")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.size && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>10 Meals ({data.size} box)</span>
                    <span>${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Subscription Discount (10%)</span>
                      <span>-${(discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {step < 3 && (
                <div className="text-muted-foreground text-xs">
                  Complete all steps to see final pricing
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mx-auto flex max-w-2xl items-center justify-between">
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
          className="flex items-center gap-2"
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
            return "Create Order";
          })()}
          {!createMealPlan.isPending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
