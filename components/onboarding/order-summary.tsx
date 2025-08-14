"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Size = "small" | "medium"

interface OrderSummaryProps {
  size?: Size
}

export function OrderSummary({ size }: OrderSummaryProps) {
  return (
    <Card className="animate-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>10 Meals ({size} box)</span>
            <span>$89.90</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>$89.90</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
