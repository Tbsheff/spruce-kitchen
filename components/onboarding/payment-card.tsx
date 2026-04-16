"use client";

import { CreditCard, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";

interface PaymentCardProps {
  onPaymentMethodChange: (method: string) => void;
  paymentMethod?: string;
}

export function PaymentCard({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentCardProps) {
  return (
    <Card className="slide-in-from-bottom-4 animate-in duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription>
          Choose your payment method to complete the order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          className="space-y-3"
          onValueChange={onPaymentMethodChange}
          value={paymentMethod ?? null}
        >
          <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <RadioGroupItem className="mt-1" id="card" value="card" />
            <Label className="flex-1 cursor-pointer" htmlFor="card">
              <div className="flex items-center gap-2 font-medium">
                <CreditCard className="h-4 w-4" />
                Credit/Debit Card
              </div>
              <p className="text-muted-foreground text-sm">
                Pay securely with Stripe
              </p>
            </Label>
          </div>
          <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <RadioGroupItem className="mt-1" id="paypal" value="paypal" />
            <Label className="flex-1 cursor-pointer" htmlFor="paypal">
              <div className="font-medium">PayPal</div>
              <p className="text-muted-foreground text-sm">
                Pay with your PayPal account
              </p>
            </Label>
          </div>
        </RadioGroup>

        {paymentMethod === "card" && (
          <div className="space-y-4 rounded-lg bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lock className="h-4 w-4" />
              Secured by Stripe (Demo Mode)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Card Number</Label>
                <Input disabled placeholder="4242 4242 4242 4242" />
              </div>
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input disabled placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input disabled placeholder="123" />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              This is a demo. No actual payment will be processed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
