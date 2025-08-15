"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { MealSelection } from "@/components/onboarding/meal-selection"
import { BoxSizeSelection } from "@/components/onboarding/box-size-selection"
import { DeliveryPlan } from "@/components/onboarding/delivery-plan"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { useCreateMealPlan } from "@/lib/trpc/hooks"
import { trpc } from "@/lib/trpc/client"

type Size = "small" | "medium"
type PurchaseType = "one-time" | "subscription"

type Selections = {
  meals: Record<string, number>
  size?: Size
  frequency?: "weekly" | "bi-weekly" | "monthly"
  purchaseType?: PurchaseType
}

const steps = ["Select Meals", "Choose Size", "Plan & Type"] as const

function OnboardingContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(0)

  const createMealPlan = useCreateMealPlan()
  const { data: availableMeals, isLoading: mealsLoading } = trpc.mealPlan.getAvailableMeals.useQuery()

  const [data, setData] = useState<Selections>(() => ({
    meals: {},
  }))

  useMemo(() => {
    if (availableMeals && Object.keys(data.meals).length === 0) {
      const initialMeals = availableMeals.reduce((acc, meal) => ({ ...acc, [meal.id]: 1 }), {})
      setData((prev) => ({ ...prev, meals: initialMeals }))
    }
  }, [availableMeals, data.meals])

  const totalMeals = useMemo(() => Object.values(data.meals).reduce((a, b) => a + b, 0), [data.meals])
  const remaining = 10 - totalMeals

  const increment = (mealId: string) => {
    setData((prev) => {
      const currentTotal = Object.values(prev.meals).reduce((a, b) => a + b, 0)
      if (currentTotal >= 10) {
        toast({ title: "Maximum meals reached", description: "You can select up to 10 meals." })
        return prev
      }
      const nextMeals = { ...prev.meals, [mealId]: (prev.meals[mealId] || 0) + 1 }
      return { ...prev, meals: nextMeals }
    })
  }

  const decrement = (mealId: string) => {
    setData((prev) => {
      const current = prev.meals[mealId] || 0
      const nextQty = Math.max(0, current - 1)
      const nextMeals = { ...prev.meals }
      if (nextQty === 0) delete nextMeals[mealId]
      else nextMeals[mealId] = nextQty
      return { ...prev, meals: nextMeals }
    })
  }

  const saveMealPlan = async () => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to continue." })
      return false
    }

    if (!data.size || !data.purchaseType) {
      toast({ title: "Missing information", description: "Please complete all steps." })
      return false
    }

    try {
      const result = await createMealPlan.mutateAsync({
        boxSize: data.size,
        planType: data.purchaseType,
        deliveryFrequency: data.frequency,
      })

      console.log("Meal plan created:", result)

      toast({
        title: "Order created successfully!",
        description: "Redirecting to confirmation page...",
      })

      setTimeout(() => {
        router.push("/onboarding/success")
      }, 1500)

      return true
    } catch (error) {
      console.error("Failed to save meal plan:", error)
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
      })
      return false
    }
  }

  const next = async () => {
    if (step === 0) {
      if (totalMeals !== 10) {
        toast({
          title: "Please select exactly 10 meals",
          description: `You need ${remaining > 0 ? remaining + " more" : Math.abs(remaining) + " fewer"} meals.`,
        })
        return
      }
    }
    if (step === 1 && !data.size) {
      toast({ title: "Please choose a box size" })
      return
    }
    if (step === 2) {
      if (!data.purchaseType) {
        toast({ title: "Please choose a purchase type" })
        return
      }
      if (data.purchaseType === "subscription" && !data.frequency) {
        toast({ title: "Please choose a delivery schedule" })
        return
      }

      const success = await saveMealPlan()
      if (!success) return

      return
    }
    setStep((s) => s + 1)
  }

  const back = () => {
    setStep((s) => Math.max(0, s - 1))
  }

  if (mealsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading meals...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <header className="mb-8 text-center mt-[25px]">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Welcome {user?.name ? user.name.split(" ")[0] : "back"}! Build Your Meal Box
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select your meals, choose your size, and set up your delivery plan.
          </p>
        </header>

        <div className="mb-8 flex items-center justify-center gap-2 text-sm">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`h-10 px-4 rounded-full border-2 transition-colors ${
                  i === step
                    ? "bg-primary text-primary-foreground border-primary"
                    : i < step
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-muted"
                }`}
              >
                <div className="h-full flex items-center font-medium">
                  {i + 1}. {label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 transition-colors ${i < step ? "bg-primary/20" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && availableMeals && (
          <MealSelection
            meals={data.meals}
            availableMeals={availableMeals}
            totalMeals={totalMeals}
            onIncrement={increment}
            onDecrement={decrement}
          />
        )}

        {step === 1 && <BoxSizeSelection size={data.size} onSizeChange={(size) => setData((p) => ({ ...p, size }))} />}

        {step === 2 && (
          <DeliveryPlan
            purchaseType={data.purchaseType}
            frequency={data.frequency}
            onPurchaseTypeChange={(purchaseType) => setData((p) => ({ ...p, purchaseType }))}
            onFrequencyChange={(frequency) => setData((p) => ({ ...p, frequency }))}
          />
        )}

        <footer className="mt-12 flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={back}
            disabled={step === 0 || createMealPlan.isPending}
            className="flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={next}
            disabled={(step === 0 && totalMeals !== 10) || createMealPlan.isPending}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            {createMealPlan.isPending ? "Processing..." : step < steps.length - 1 ? "Next" : "Complete Order"}
            {!createMealPlan.isPending && <ArrowRight className="h-4 w-4" />}
          </Button>
        </footer>
      </main>

      <Footer />
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  )
}
