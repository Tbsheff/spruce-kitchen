"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Lock } from "lucide-react"

interface PaymentCardProps {
  paymentMethod?: string
  onPaymentMethodChange: (method: string) => void
}

export function PaymentCard({ paymentMethod, onPaymentMethodChange }: PaymentCardProps) {
  return (
    <Card className="animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription>Choose your payment method to complete the order.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem id="card" value="card" className="mt-1" />
            <Label htmlFor="card" className="flex-1 cursor-pointer">
              <div className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit/Debit Card
              </div>
              <p className="text-sm text-muted-foreground">Pay securely with Stripe</p>
            </Label>
          </div>
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem id="paypal" value="paypal" className="mt-1" />
            <Label htmlFor="paypal" className="flex-1 cursor-pointer">
              <div className="font-medium">PayPal</div>
              <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
            </Label>
          </div>
        </RadioGroup>

        {paymentMethod === "card" && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Secured by Stripe (Demo Mode)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Card Number</Label>
                <Input placeholder="4242 4242 4242 4242" disabled />
              </div>
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" disabled />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input placeholder="123" disabled />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">This is a demo. No actual payment will be processed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
