import { Check, Clock, Star, Truck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { FaqSection } from "@/components/ui/faq-section.tsx";
import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";

type BillingType = "subscription" | "one-time";

function getBillingType(value: string | string[] | undefined): BillingType {
  return value === "one-time" ? "one-time" : "subscription";
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const billingType = getBillingType(resolvedSearchParams.billing);

  const plans = [
    {
      name: "Small Box",
      description: "Perfect for 2-3 adults",
      oneTimePrice: 89,
      meals: 10,
      servings: "2-3 people",
      totalServings: 25,
      popular: false,
      features: [
        "10 chef-crafted meals",
        "Nutritionist approved",
        "Free delivery over $50",
        "Flexible scheduling",
        "Easy 15-minute prep",
        "Real ingredients only",
      ],
    },
    {
      name: "Medium Box",
      description: "Ideal for families of 4-6",
      oneTimePrice: 169,
      meals: 10,
      servings: "4-6 people",
      totalServings: 50,
      popular: true,
      features: [
        "10 chef-crafted meals",
        "Nutritionist approved",
        "Free delivery included",
        "Priority customer support",
        "Flexible scheduling",
        "Easy 15-minute prep",
        "Real ingredients only",
        "Family portion sizes",
      ],
    },
  ];

  const faqItems = [
    {
      question: "Can I pause or cancel my subscription?",
      answer:
        "You can pause, skip, or cancel your subscription at any time through your account dashboard. No cancellation fees or commitments required.",
    },
    {
      question: "How long do the meals stay fresh?",
      answer:
        "Our meals are flash-frozen to lock in freshness and can be stored in your freezer for up to 6 months. Once thawed, consume within 3-4 days.",
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer:
        "Yes! We offer vegetarian, gluten-free, and dairy-free options. You can customize your preferences during the onboarding process or update them anytime in your account.",
    },
    {
      question: "What if I don't like a meal?",
      answer:
        "We stand behind our quality! If you're not satisfied with any meal, contact our customer service team and we'll make it right with a replacement or credit.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-bold text-4xl md:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mb-8 text-muted-foreground text-xl">
              Choose the perfect meal plan for your family. No hidden fees, no
              commitments. Cancel or pause anytime.
            </p>
            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Free delivery over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>15-minute prep time</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Chef-crafted quality</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex justify-center">
              <div
                aria-label="Billing type"
                className="rounded-lg bg-muted p-1"
                role="tablist"
              >
                <Link
                  aria-selected={billingType === "subscription"}
                  className={`inline-flex rounded-md px-6 py-2 font-medium text-sm transition-colors ${
                    billingType === "subscription"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  href="/pricing?billing=subscription"
                  role="tab"
                >
                  Subscription
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    Save 10%
                  </Badge>
                </Link>
                <Link
                  aria-selected={billingType === "one-time"}
                  className={`inline-flex rounded-md px-6 py-2 font-medium text-sm transition-colors ${
                    billingType === "one-time"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  href="/pricing?billing=one-time"
                  role="tab"
                >
                  One-Time Purchase
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto grid max-w-4xl items-stretch gap-8 md:grid-cols-2">
              {plans.map((plan) => {
                const subscriptionPrice = Math.round(plan.oneTimePrice * 0.9);
                const currentPrice =
                  billingType === "subscription"
                    ? subscriptionPrice
                    : plan.oneTimePrice;
                const pricePerServing = (
                  currentPrice / plan.totalServings
                ).toFixed(2);

                return (
                  <Card
                    className={`relative flex flex-col ${plan.popular ? "scale-105 border-primary/20 shadow-lg" : ""}`}
                    key={plan.name}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="pb-4 text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-base">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold text-3xl">
                            ${currentPrice}
                          </span>
                          {billingType === "subscription" && (
                            <span className="text-lg text-muted-foreground line-through">
                              ${plan.oneTimePrice}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-muted-foreground text-sm">
                          ${pricePerServing} per serving
                        </p>
                        {billingType === "subscription" && (
                          <p className="mt-1 font-medium text-primary text-xs">
                            Delivered monthly
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col">
                      <div className="flex-grow space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                          <span className="font-medium">
                            {plan.meals} meals
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {plan.servings}
                          </span>
                        </div>

                        <ul className="min-h-0 flex-1 space-y-3">
                          {plan.features.map((feature) => (
                            <li
                              className="flex items-center gap-3"
                              key={feature}
                            >
                              <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                          {billingType === "subscription" && (
                            <li className="flex items-center gap-3">
                              <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                              <span className="text-sm">
                                Cancel or pause anytime
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <Link className="block" href="/onboarding">
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            size="lg"
                          >
                            {billingType === "subscription"
                              ? "Start Subscription"
                              : "Order Now"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center font-bold text-3xl md:text-4xl">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-bold text-2xl text-primary">1</span>
                </div>
                <h3 className="mb-3 font-semibold text-xl">Choose Your Plan</h3>
                <p className="text-muted-foreground">
                  Select the perfect box size for your family and customize your
                  meal preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-bold text-2xl text-primary">2</span>
                </div>
                <h3 className="mb-3 font-semibold text-xl">
                  We Prepare & Deliver
                </h3>
                <p className="text-muted-foreground">
                  Our chefs craft your meals with fresh ingredients and deliver
                  them frozen to your door.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-bold text-2xl text-primary">3</span>
                </div>
                <h3 className="mb-3 font-semibold text-xl">Heat & Enjoy</h3>
                <p className="text-muted-foreground">
                  Simply heat your meals in 15 minutes or less and enjoy
                  restaurant-quality dinners at home.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqSection
          contactInfo={{
            title: "Still have questions?",
            description:
              "Our customer service team is here to help with pricing questions",
            buttonText: "Contact Support",
          }}
          description="Everything you need to know about our pricing and plans"
          items={faqItems}
          title="Frequently Asked Questions"
        />

        <section className="bg-primary/5 px-4 py-16 dark:bg-primary/10">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">
              Ready to Transform Your Dinners?
            </h2>
            <p className="mb-8 text-muted-foreground text-xl">
              Join thousands of families who have discovered the joy of
              stress-free, delicious meals.
            </p>
            <Link href="/onboarding">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Start Your First Box
              </Button>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm">
              No commitment required • Cancel anytime • Free delivery over $50
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
