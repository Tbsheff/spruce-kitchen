"use client"

import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FaqSection } from "@/components/ui/faq-section"
import { Check, Star, Truck, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PricingPage() {
  const [billingType, setBillingType] = useState<"subscription" | "one-time">("subscription")

  const plans = [
    {
      name: "Small Box",
      description: "Perfect for 2-3 adults",
      oneTimePrice: 89,
      meals: 10,
      servings: "2-3 people",
      totalServings: 25, // 10 meals × 2.5 average servings
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
      totalServings: 50, // 10 meals × 5 average servings
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
  ]

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
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the perfect meal plan for your family. No hidden fees, no commitments. Cancel or pause anytime.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
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

        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setBillingType("subscription")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingType === "subscription"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Subscription
                  <Badge className="ml-2 bg-primary text-primary-foreground">Save 10%</Badge>
                </button>
                <button
                  onClick={() => setBillingType("one-time")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingType === "one-time"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  One-Time Purchase
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {plans.map((plan, index) => {
                const subscriptionPrice = Math.round(plan.oneTimePrice * 0.9)
                const currentPrice = billingType === "subscription" ? subscriptionPrice : plan.oneTimePrice
                const pricePerServing = (currentPrice / plan.totalServings).toFixed(2)

                return (
                  <Card
                    key={index}
                    className={`relative flex flex-col ${plan.popular ? "border-primary/20 shadow-lg scale-105" : ""}`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-base">{plan.description}</CardDescription>
                      <div className="mt-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-3xl font-bold">${currentPrice}</span>
                          {billingType === "subscription" && (
                            <span className="text-lg text-muted-foreground line-through">${plan.oneTimePrice}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">${pricePerServing} per serving</p>
                        {billingType === "subscription" && (
                          <p className="text-xs text-primary font-medium mt-1">Delivered monthly</p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                      <div className="space-y-4 flex-grow">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{plan.meals} meals</span>
                          <span className="text-sm text-muted-foreground">{plan.servings}</span>
                        </div>

                        <ul className="space-y-3 flex-1 min-h-0">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-3">
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                          {billingType === "subscription" && (
                            <li className="flex items-center gap-3">
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm">Cancel or pause anytime</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <Link href="/onboarding" className="block">
                          <Button className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground`} size="lg">
                            {billingType === "subscription" ? "Start Subscription" : "Order Now"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Choose Your Plan</h3>
                <p className="text-muted-foreground">
                  Select the perfect box size for your family and customize your meal preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">We Prepare & Deliver</h3>
                <p className="text-muted-foreground">
                  Our chefs craft your meals with fresh ingredients and deliver them frozen to your door.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Heat & Enjoy</h3>
                <p className="text-muted-foreground">
                  Simply heat your meals in 15 minutes or less and enjoy restaurant-quality dinners at home.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FaqSection
          title="Frequently Asked Questions"
          description="Everything you need to know about our pricing and plans"
          items={faqItems}
          contactInfo={{
            title: "Still have questions?",
            description: "Our customer service team is here to help with pricing questions",
            buttonText: "Contact Support",
            onContact: () => console.log("Contact support clicked"),
          }}
        />

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary/5 dark:bg-primary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Dinners?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of families who have discovered the joy of stress-free, delicious meals.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Your First Box
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No commitment required • Cancel anytime • Free delivery over $50
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
