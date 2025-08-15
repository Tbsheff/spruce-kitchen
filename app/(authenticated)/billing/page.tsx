"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/lib/auth-context"
import { CreditCard, Calendar, Download, Plus, Trash2, Shield, Receipt, AlertCircle } from "lucide-react"

export default function BillingPage() {
  const { user } = useAuth()
  const { data: mealPlans } = trpc.mealPlan.getUserPlans.useQuery()

  const [showAddCard, setShowAddCard] = useState(false)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  // Mock billing data
  const mockPaymentMethods = [
    {
      id: "card-1",
      type: "visa",
      last4: "4242",
      expiry: "12/25",
      isDefault: true,
    },
    {
      id: "card-2",
      type: "mastercard",
      last4: "8888",
      expiry: "08/26",
      isDefault: false,
    },
  ]

  const mockInvoices = [
    {
      id: "inv-001",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      amount: 7999,
      status: "paid",
      description: "Small Box - Weekly Subscription",
    },
    {
      id: "inv-002",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      amount: 7999,
      status: "paid",
      description: "Small Box - Weekly Subscription",
    },
    {
      id: "inv-003",
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      amount: 7999,
      status: "paid",
      description: "Small Box - Weekly Subscription",
    },
  ]

  const activePlans = mealPlans?.filter((plan) => plan.isActive) || []
  const nextBillingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Payment method added",
      description: "Your new payment method has been saved successfully.",
    })
    setShowAddCard(false)
    setCardData({ number: "", expiry: "", cvc: "", name: "" })
  }

  const getCardIcon = (type: string) => {
    return <CreditCard className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your payment methods and billing history</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPaymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getCardIcon(method.type)}
                    <div>
                      <p className="font-medium">•••• •••• •••• {method.last4}</p>
                      <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                    </div>
                    {method.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" disabled={method.isDefault}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {showAddCard ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddCard} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Add Card</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddCard(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Button variant="outline" onClick={() => setShowAddCard(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.date.toLocaleDateString()} • ${(invoice.amount / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold">${activePlans.length > 0 ? "79.99" : "0.00"}</p>
                <p className="text-sm text-muted-foreground">Due {nextBillingDate.toLocaleDateString()}</p>
              </div>

              {activePlans.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Small Box Subscription</span>
                      <span>$79.99</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Weekly delivery</span>
                      <span>10% discount applied</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Billing Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Secure Payments</p>
                  <p className="text-xs text-muted-foreground">All payments are encrypted and processed securely</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Billing Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified before each billing cycle</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
