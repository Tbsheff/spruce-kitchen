"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, Check, ShoppingCart } from "lucide-react"
import { MealSelection } from "@/components/onboarding/meal-selection"
import { BoxSizeSelection } from "@/components/onboarding/box-size-selection"
import { DeliveryPlan } from "@/components/onboarding/delivery-plan"
import { useAuth } from "@/lib/auth-context"
import { useCreateMealPlan } from "@/lib/trpc/hooks"
import { trpc } from "@/lib/trpc/client"

type Size = "small" | "medium"
type PurchaseType = "one-time" | "subscription"

type OrderData = {
  meals: Record<string, number>
  size?: Size
  frequency?: "weekly" | "bi-weekly" | "monthly"
  purchaseType?: PurchaseType
}

const steps = ["Select Meals", "Choose Size", "Plan & Type", "Review Order"] as const

export default function NewOrderPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(0)

  const createMealPlan = useCreateMealPlan()
  const { data: availableMeals, isLoading: mealsLoading } = trpc.mealPlan.getAvailableMeals.useQuery()

  const [data, setData] = useState<OrderData>(() => ({
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

  const createOrder = async () => {
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

      console.log("Order created:", result)

      toast({
        title: "Order created successfully!",
        description: "Redirecting to dashboard...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)

      return true
    } catch (error) {
      console.error("Failed to create order:", error)
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
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
    }
    if (step === 3) {
      const success = await createOrder()
      if (!success) return
      return
    }
    setStep((s) => s + 1)
  }

  const back = () => {
    setStep((s) => Math.max(0, s - 1))
  }

  const calculatePrice = () => {
    if (!data.size) return { subtotal: 0, discount: 0, total: 0 }

    const basePrices = {
      small: 7999, // $79.99
      medium: 14999, // $149.99
    }

    const subtotal = basePrices[data.size]
    const discount = data.purchaseType === "subscription" ? Math.round(subtotal * 0.1) : 0
    const total = subtotal - discount

    return { subtotal, discount, total }
  }

  const { subtotal, discount, total } = calculatePrice()

  if (mealsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading meals...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
          <p className="text-muted-foreground">Build your perfect meal box</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
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
                {i < step ? <Check className="h-4 w-4" /> : `${i + 1}. ${label}`}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 transition-colors ${i < step ? "bg-primary/20" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && availableMeals && (
            <MealSelection
              meals={data.meals}
              availableMeals={availableMeals}
              totalMeals={totalMeals}
              onIncrement={increment}
              onDecrement={decrement}
            />
          )}

          {step === 1 && (
            <BoxSizeSelection size={data.size} onSizeChange={(size) => setData((p) => ({ ...p, size }))} />
          )}

          {step === 2 && (
            <DeliveryPlan
              purchaseType={data.purchaseType}
              frequency={data.frequency}
              onPurchaseTypeChange={(purchaseType) => setData((p) => ({ ...p, purchaseType }))}
              onFrequencyChange={(frequency) => setData((p) => ({ ...p, frequency }))}
            />
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Review Your Order
                </CardTitle>
                <CardDescription>Confirm your meal selection and delivery preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Selected Meals ({totalMeals})</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(data.meals).map(([mealId, qty]) => {
                      const meal = availableMeals?.find((m) => m.id === mealId)
                      if (!meal || qty === 0) return null
                      return (
                        <div key={mealId} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{meal.name}</span>
                          <Badge variant="secondary">x{qty}</Badge>
                        </div>
                      )
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
                    <span className="font-medium capitalize">{data.purchaseType?.replace("-", " ")}</span>
                  </div>
                  {data.purchaseType === "subscription" && (
                    <div className="flex justify-between">
                      <span>Delivery Schedule:</span>
                      <span className="font-medium capitalize">{data.frequency?.replace("-", " ")}</span>
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
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>10 Meals ({data.size} box)</span>
                      <span>${(subtotal / 100).toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
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
                </>
              )}

              {step < 3 && <div className="text-xs text-muted-foreground">Complete all steps to see final pricing</div>}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between max-w-2xl mx-auto">
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
          className="flex items-center gap-2"
        >
          {createMealPlan.isPending ? "Processing..." : step < steps.length - 1 ? "Next" : "Create Order"}
          {!createMealPlan.isPending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
