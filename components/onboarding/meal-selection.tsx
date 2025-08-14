"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Meal {
  id: string
  name: string
  description: string
  image: string
  dietaryTags: string[]
  allergens: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface MealSelectionProps {
  meals: Record<string, number>
  availableMeals: Meal[]
  totalMeals: number
  onIncrement: (mealId: string) => void
  onDecrement: (mealId: string) => void
}

export function MealSelection({ meals, availableMeals, totalMeals, onIncrement, onDecrement }: MealSelectionProps) {
  const remaining = 10 - totalMeals

  return (
    <section aria-label="Select meals" className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
          Adjust your meal quantities • Total: {totalMeals}/10
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableMeals.map((meal) => {
          const qty = meals[meal.id] || 0
          return (
            <Card key={meal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-start justify-between gap-2">
                  <span className="leading-tight">{meal.name}</span>
                  {qty > 0 && (
                    <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      x{qty}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">{meal.description}</CardDescription>
                <div className="flex flex-wrap gap-1 mt-2">
                  {meal.dietaryTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {meal.calories} cal • {meal.protein}g protein
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDecrement(meal.id)}
                    disabled={qty === 0}
                    className="h-8 w-8 p-0"
                  >
                    −
                  </Button>
                  <div className="min-w-8 text-center font-medium text-lg">{qty}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onIncrement(meal.id)}
                    disabled={remaining <= 0 && qty === 0}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
