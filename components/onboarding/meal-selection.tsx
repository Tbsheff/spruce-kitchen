"use client";

import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface Meal {
  allergens: string[];
  calories: number;
  carbs: number;
  description: string;
  dietaryTags: string[];
  fat: number;
  id: string;
  image: string;
  name: string;
  protein: number;
}

interface MealSelectionProps {
  availableMeals: Meal[];
  meals: Record<string, number>;
  onDecrement: (mealId: string) => void;
  onIncrement: (mealId: string) => void;
  totalMeals: number;
}

export function MealSelection({
  meals,
  availableMeals,
  totalMeals,
  onIncrement,
  onDecrement,
}: MealSelectionProps) {
  const remaining = 10 - totalMeals;

  return (
    <section aria-label="Select meals" className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 font-medium text-orange-700 text-sm">
          Adjust your meal quantities • Total: {totalMeals}/10
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableMeals.map((meal) => {
          const qty = meals[meal.id] || 0;
          return (
            <Card className="transition-shadow hover:shadow-md" key={meal.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start justify-between gap-2 text-lg">
                  <span className="leading-tight">{meal.name}</span>
                  {qty > 0 && (
                    <span className="rounded-full bg-orange-50 px-2 py-1 font-medium text-orange-600 text-sm">
                      x{qty}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {meal.description}
                </CardDescription>
                <div className="mt-2 flex flex-wrap gap-1">
                  {meal.dietaryTags.map((tag) => (
                    <Badge className="text-xs" key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-1 text-muted-foreground text-xs">
                  {meal.calories} cal • {meal.protein}g protein
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    className="h-8 w-8 p-0"
                    disabled={qty === 0}
                    onClick={() => onDecrement(meal.id)}
                    size="sm"
                    variant="outline"
                  >
                    −
                  </Button>
                  <div className="min-w-8 text-center font-medium text-lg">
                    {qty}
                  </div>
                  <Button
                    className="h-8 w-8 p-0"
                    disabled={remaining <= 0 && qty === 0}
                    onClick={() => onIncrement(meal.id)}
                    size="sm"
                    variant="outline"
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
