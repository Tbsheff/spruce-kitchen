"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PurchaseType = "one-off" | "subscription"

interface DeliveryPlanProps {
  purchaseType?: PurchaseType
  frequency?: "monthly" | "every2months"
  onPurchaseTypeChange: (type: PurchaseType) => void
  onFrequencyChange: (frequency: "monthly" | "every2months") => void
}

export function DeliveryPlan({ purchaseType, frequency, onPurchaseTypeChange, onFrequencyChange }: DeliveryPlanProps) {
  return (
    <section aria-label="Plan and type" className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Plan</CardTitle>
          <CardDescription>Choose how you'd like to receive your meals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Purchase Type</Label>
            <RadioGroup
              value={purchaseType}
              onValueChange={(v: PurchaseType) => onPurchaseTypeChange(v)}
              className="space-y-3"
            >
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem id="one-off" value="one-off" className="mt-1" />
                <Label htmlFor="one-off" className="flex-1 cursor-pointer">
                  <div className="font-medium">One-time Purchase</div>
                  <p className="text-sm text-muted-foreground">Try our meals with no commitment</p>
                </Label>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem id="subscription" value="subscription" className="mt-1" />
                <Label htmlFor="subscription" className="flex-1 cursor-pointer">
                  <div className="font-medium">Subscription</div>
                  <p className="text-sm text-muted-foreground">Regular deliveries with flexible scheduling</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {purchaseType === "subscription" && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Delivery Schedule</Label>
              <Select value={frequency} onValueChange={onFrequencyChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose delivery frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Delivery</SelectItem>
                  <SelectItem value="every2months">Every 2 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
