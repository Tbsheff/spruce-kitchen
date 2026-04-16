"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Header } from "@/components/ui/header.tsx";

const monthlyMeals = {
  january: [
    {
      id: "winter-beef-stew",
      name: "Winter Beef Stew",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "chicken-pot-pie",
      name: "Chicken Pot Pie",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "butternut-squash-soup",
      name: "Butternut Squash Soup",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "shepherd-pie",
      name: "Shepherd's Pie",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "chicken-noodle-soup",
      name: "Chicken Noodle Soup",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "beef-chili",
      name: "Hearty Beef Chili",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "mac-cheese",
      name: "Truffle Mac & Cheese",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "meatloaf",
      name: "Classic Meatloaf",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
  february: [
    {
      id: "burrito-bowls",
      name: "Burrito Bowls",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "chicken-alfredo",
      name: "Chicken Alfredo",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "chipotle-chicken-tacos",
      name: "Chipotle Chicken Tacos",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "french-dip-sandwiches",
      name: "French Dip Sandwiches",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "orange-ginger-pork-loin",
      name: "Orange Ginger Pork Loin",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "sausage-sweet-potato-sheet-pan",
      name: "Sausage & Sweet Potato Sheet Pan Dinner",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "sweet-sour-meatballs",
      name: "Sweet & Sour Meatballs",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "tex-mex-chicken",
      name: "Tex-Mex Chicken",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
  march: [
    {
      id: "spring-salmon",
      name: "Herb-Crusted Salmon",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "asparagus-risotto",
      name: "Spring Asparagus Risotto",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "lemon-chicken",
      name: "Lemon Herb Chicken",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "veggie-stir-fry",
      name: "Spring Vegetable Stir Fry",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "quinoa-salad",
      name: "Mediterranean Quinoa Salad",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "turkey-meatballs",
      name: "Turkey Meatballs Marinara",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "pesto-pasta",
      name: "Pesto Pasta Primavera",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "stuffed-peppers",
      name: "Stuffed Bell Peppers",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
};

const months = [
  { key: "january", label: "January" },
  { key: "february", label: "February" },
  { key: "march", label: "March" },
];

export default function MenuPage() {
  const [selectedMonth, setSelectedMonth] =
    useState<keyof typeof monthlyMeals>("february");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-4 font-bold text-4xl md:text-5xl">Our Meals</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Designed by Dietitians, Loved by Families.
            </p>
            <p className="mx-auto mt-2 max-w-3xl text-muted-foreground">
              Explore our monthly menus and get a closer look into the
              ingredients, instructions, and nutrition facts of all our meals
              below.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="inline-flex rounded-lg bg-muted p-1">
              {months.map((month) => (
                <button
                  className={`rounded-md px-6 py-2 font-medium text-sm transition-all duration-200 ${
                    selectedMonth === month.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  key={month.key}
                  onClick={() =>
                    setSelectedMonth(month.key as keyof typeof monthlyMeals)
                  }
                  type="button"
                >
                  {month.label}
                </button>
              ))}
            </div>

            <Button
              asChild
              className="bg-primary px-6 py-2 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
              size="lg"
            >
              <Link className="flex items-center gap-2" href="/onboarding">
                BUILD YOUR BOX
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Meals Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {monthlyMeals[selectedMonth].map((meal) => (
              <Link
                className="group block overflow-hidden rounded-lg bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg"
                href={`/menu/${meal.id}`}
                key={meal.id}
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    alt={meal.name}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    fill
                    src={meal.image || "/placeholder.svg"}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-center font-semibold text-lg transition-colors group-hover:text-orange-600">
                    {meal.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
