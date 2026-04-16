"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Home,
  Package,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useAuth } from "@/lib/auth-context.tsx";
import {
  type CompletedOrderSnapshot,
  onboardingStorage,
} from "@/lib/storage/onboarding-persistence.ts";

const BILLING_TYPE_LABELS: Record<
  CompletedOrderSnapshot["billingType"],
  string
> = {
  "one-time": "One-time order",
  subscription: "Subscription",
};

const BOX_SIZE_LABELS: Record<CompletedOrderSnapshot["boxSize"], string> = {
  small: "Small box",
  medium: "Medium box",
};

const DELIVERY_FREQUENCY_LABELS: Record<
  NonNullable<CompletedOrderSnapshot["deliveryFrequency"]>,
  string
> = {
  weekly: "Weekly",
  "bi-weekly": "Every 2 weeks",
  monthly: "Monthly",
};

function formatCurrency(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

function formatDeliveryDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SuccessContent() {
  const { user } = useAuth();
  const [completedOrder] = useState<CompletedOrderSnapshot | null>(() =>
    onboardingStorage.loadCompletedOrder()
  );

  if (!completedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-12">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="font-bold text-3xl text-foreground md:text-4xl">
                Welcome to Spruce Kitchen
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your account is ready, but this device no longer has your latest
                confirmation snapshot.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Confirmation Unavailable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  We couldn&apos;t recover the order details from local storage.
                  The confirmation may have expired, been cleared, or been
                  created on another device.
                </p>
                <div className="rounded-lg bg-primary/5 p-4 text-muted-foreground">
                  If you just completed checkout, return to your dashboard or
                  inbox for the latest plan and delivery updates.
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
                <Link
                  className="flex items-center justify-center gap-2"
                  href="/menu"
                >
                  Explore More Meals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                className="flex-1 bg-transparent"
                variant="outline"
              >
                <Link
                  className="flex items-center justify-center gap-2"
                  href="/"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const totalMeals = completedOrder.meals.reduce(
    (count, meal) => count + meal.quantity,
    0
  );
  const billingLabel = BILLING_TYPE_LABELS[completedOrder.billingType];
  const cadenceLabel = completedOrder.deliveryFrequency
    ? DELIVERY_FREQUENCY_LABELS[completedOrder.deliveryFrequency]
    : "Single delivery";
  const deliveryDate = formatDeliveryDate(
    completedOrder.estimatedDeliveryDateIso
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Success Header */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="font-bold text-3xl text-foreground md:text-4xl">
              Welcome to Spruce Kitchen
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your order has been confirmed and your account is ready.
            </p>
          </div>

          {/* Order Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order ID:</span>
                  <div className="font-mono font-semibold">
                    {completedOrder.id}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <div className="font-semibold">
                    {formatCurrency(completedOrder.pricing.total)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Plan:</span>
                  <div className="font-semibold">{billingLabel}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Box:</span>
                  <div className="font-semibold">
                    {BOX_SIZE_LABELS[completedOrder.boxSize]}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-muted-foreground">Subtotal</div>
                  <div className="font-semibold">
                    {formatCurrency(completedOrder.pricing.subtotal)}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-muted-foreground">Discount</div>
                  <div className="font-semibold">
                    -{formatCurrency(completedOrder.pricing.discount)}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-muted-foreground">Charged today</div>
                  <div className="font-semibold">
                    {formatCurrency(completedOrder.pricing.total)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">
                  Your Meal Selection ({totalMeals} meals)
                </h4>
                <div className="grid grid-cols-1 gap-2 text-muted-foreground text-sm md:grid-cols-2">
                  {completedOrder.meals.map((meal) => (
                    <div key={meal.id}>
                      {meal.quantity}x {meal.name}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                <div>
                  <div className="font-semibold text-primary">
                    Estimated First Delivery
                  </div>
                  <div className="text-primary/80">{deliveryDate}</div>
                </div>
                <div className="text-primary">
                  <Package className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>• Delivery cadence: {cadenceLabel}</p>
                <p>• Your meals will arrive frozen in insulated packaging</p>
                <p>• Store in freezer immediately upon delivery</p>
                <p>• Each meal includes heating instructions</p>
                <p>• You'll receive tracking information via email</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Setup Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">
                    Account Created Successfully
                  </div>
                  <div className="text-green-700 text-sm">
                    You can now manage your orders and preferences
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>• Check your email for account verification</p>
                <p>• Access your account dashboard anytime</p>
                <p>• Manage delivery preferences and meal selections</p>
                <p>• View order history and upcoming deliveries</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-semibold">Prepare for Delivery</div>
                    <div className="text-muted-foreground text-sm">
                      Make sure someone is available to receive your frozen
                      meals
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-semibold">Store Properly</div>
                    <div className="text-muted-foreground text-sm">
                      Transfer meals to your freezer immediately upon arrival
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
                    3
                  </div>
                  <div>
                    <div className="font-semibold">Enjoy Your Meals</div>
                    <div className="text-muted-foreground text-sm">
                      Follow the heating instructions for the best experience
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
              <Link
                className="flex items-center justify-center gap-2"
                href="/menu"
              >
                Explore More Meals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild className="flex-1 bg-transparent" variant="outline">
              <Link className="flex items-center justify-center gap-2" href="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support Information */}
          <div className="space-y-2 border-t pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Questions about your order? We're here to help!
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Email us at </span>
              <a
                className="text-primary hover:text-primary/80"
                href="mailto:support@sprucekitchen.com"
              >
                support@sprucekitchen.com
              </a>
              <span className="text-muted-foreground"> or call </span>
              <a
                className="text-primary hover:text-primary/80"
                href="tel:+1-555-SPRUCE"
              >
                (555) SPRUCE-1
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <AuthGuard>
      <SuccessContent />
    </AuthGuard>
  );
}
