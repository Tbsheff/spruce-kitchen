"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

type PurchaseType = "one-time" | "subscription";

interface DeliveryPlanProps {
  frequency?: "weekly" | "bi-weekly" | "monthly";
  onFrequencyChange: (frequency: "weekly" | "bi-weekly" | "monthly") => void;
  onPurchaseTypeChange: (type: PurchaseType) => void;
  purchaseType?: PurchaseType;
}

export function DeliveryPlan({
  purchaseType,
  frequency,
  onPurchaseTypeChange,
  onFrequencyChange,
}: DeliveryPlanProps) {
  return (
    <section aria-label="Plan and type" className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Plan</CardTitle>
          <CardDescription>
            Choose how you'd like to receive your meals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="font-semibold text-base">Purchase Type</Label>
            <RadioGroup
              className="space-y-3"
              onValueChange={(v: PurchaseType) => onPurchaseTypeChange(v)}
              value={purchaseType ?? null}
            >
              <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <RadioGroupItem
                  className="mt-1"
                  id="one-time"
                  value="one-time"
                />
                <Label className="flex-1 cursor-pointer" htmlFor="one-time">
                  <div className="font-medium">One-time Purchase</div>
                  <p className="text-muted-foreground text-sm">
                    Try our meals with no commitment
                  </p>
                </Label>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <RadioGroupItem
                  className="mt-1"
                  id="subscription"
                  value="subscription"
                />
                <Label className="flex-1 cursor-pointer" htmlFor="subscription">
                  <div className="font-medium">Subscription</div>
                  <p className="text-muted-foreground text-sm">
                    Regular deliveries with flexible scheduling
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {purchaseType === "subscription" && (
            <div className="space-y-3">
              <Label className="font-semibold text-base">
                Delivery Schedule
              </Label>
              <Select onValueChange={onFrequencyChange} value={frequency ?? ""}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose delivery frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Delivery</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly Delivery</SelectItem>
                  <SelectItem value="monthly">Monthly Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
