"use client";

import { ChefHat, Clock, Heart } from "lucide-react";

export function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-700 text-sm">
            <Heart className="h-4 w-4" />
            Family Favorites
          </div>
          <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
            Why Families Choose Spruce Kitchen Meals
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Large card - Nutritious */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-green-100 p-3">
                <ChefHat className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                  Nutritious
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Enjoy meals crafted with guidance from experienced chefs and
                  nutrition-minded experts—made with real ingredients you can
                  feel good about serving.
                </p>
              </div>
            </div>
          </div>

          {/* Small card - Effortless */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 w-fit rounded-xl bg-blue-100 p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-3 font-semibold text-gray-900 text-lg">
              Effortless
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              From freezer to table in as little as 15 minutes. Just heat,
              serve, and savor—no grocery lines, no stress.
            </p>
          </div>

          {/* Small card - Full of Flavor */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 w-fit rounded-xl bg-orange-100 p-3">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mb-3 font-semibold text-gray-900 text-lg">
              Full of Flavor
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Delight your taste buds with a mix of comforting classics and
              exciting new dishes your whole family will love.
            </p>
          </div>

          {/* Large card - Visual element */}
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-8 shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                  Ready to Get Started?
                </h3>
                <p className="mb-4 text-gray-600">
                  Join thousands of families enjoying stress-free dinners.
                </p>
                <button
                  className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  type="button"
                >
                  View Weekly Menu
                </button>
              </div>
              <div className="hidden md:block">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-200">
                  <ChefHat className="h-12 w-12 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
