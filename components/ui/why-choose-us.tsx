"use client"

import { ChefHat, Clock, Heart } from "lucide-react"

export function WhyChooseUs() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
            <Heart className="h-4 w-4" />
            Family Favorites
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Families Choose Spruce Kitchen Meals
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large card - Nutritious */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <ChefHat className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Nutritious</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enjoy meals crafted with guidance from experienced chefs and nutrition-minded experts—made with real
                  ingredients you can feel good about serving.
                </p>
              </div>
            </div>
          </div>

          {/* Small card - Effortless */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Effortless</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              From freezer to table in as little as 15 minutes. Just heat, serve, and savor—no grocery lines, no stress.
            </p>
          </div>

          {/* Small card - Full of Flavor */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Full of Flavor</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Delight your taste buds with a mix of comforting classics and exciting new dishes your whole family will
              love.
            </p>
          </div>

          {/* Large card - Visual element */}
          <div className="lg:col-span-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-4">Join thousands of families enjoying stress-free dinners.</p>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                  View Weekly Menu
                </button>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-orange-200 rounded-full flex items-center justify-center">
                  <ChefHat className="h-12 w-12 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
