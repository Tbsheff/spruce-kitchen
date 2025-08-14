"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { CheckCircle, Package, Calendar, User, ArrowRight, Home } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"

function SuccessContent() {
  const { user } = useAuth()
  const [orderNumber] = useState(() => `SK${Math.random().toString(36).substr(2, 9).toUpperCase()}`)
  const [deliveryDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7) // 7 days from now
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome to Spruce Kitchen{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-lg text-muted-foreground">Your order has been confirmed and your account is ready.</p>
          </div>

          {/* Order Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order Number:</span>
                  <div className="font-mono font-semibold">{orderNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <div className="font-semibold">$89.90</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Your Meal Selection (10 meals)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• Herb Roasted Salmon</div>
                  <div>• Tuscan Chicken Pasta</div>
                  <div>• Green Goddess Bowl</div>
                  <div>• Beef Bulgogi Rice</div>
                  <div>• Lemon Pepper Shrimp</div>
                  <div>• Butternut Squash Ravioli</div>
                  <div>• Chipotle Turkey Chili</div>
                  <div>• Miso Ginger Tofu</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div>
                  <div className="font-semibold text-primary">Expected Delivery</div>
                  <div className="text-primary/80">{deliveryDate}</div>
                </div>
                <div className="text-primary">
                  <Package className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Your meals will arrive frozen in insulated packaging</p>
                <p>• Store in freezer immediately upon delivery</p>
                <p>• Each meal includes heating instructions</p>
                <p>• You'll receive tracking information via email</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Setup Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">Account Created Successfully</div>
                  <div className="text-green-700 text-sm">You can now manage your orders and preferences</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check your email for account verification</p>
                <p>• Access your account dashboard anytime</p>
                <p>• Manage delivery preferences and meal selections</p>
                <p>• View order history and upcoming deliveries</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                    1
                  </div>
                  <div>
                    <div className="font-semibold">Prepare for Delivery</div>
                    <div className="text-sm text-muted-foreground">
                      Make sure someone is available to receive your frozen meals
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                    2
                  </div>
                  <div>
                    <div className="font-semibold">Store Properly</div>
                    <div className="text-sm text-muted-foreground">
                      Transfer meals to your freezer immediately upon arrival
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                    3
                  </div>
                  <div>
                    <div className="font-semibold">Enjoy Your Meals</div>
                    <div className="text-sm text-muted-foreground">
                      Follow the heating instructions for the best experience
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
              <Link href="/menu" className="flex items-center justify-center gap-2">
                Explore More Meals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center space-y-2 pt-8 border-t">
            <p className="text-sm text-muted-foreground">Questions about your order? We're here to help!</p>
            <p className="text-sm">
              <span className="text-muted-foreground">Email us at </span>
              <a href="mailto:support@sprucekitchen.com" className="text-primary hover:text-primary/80">
                support@sprucekitchen.com
              </a>
              <span className="text-muted-foreground"> or call </span>
              <a href="tel:+1-555-SPRUCE" className="text-primary hover:text-primary/80">
                (555) SPRUCE-1
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function OnboardingSuccessPage() {
  return (
    <AuthGuard>
      <SuccessContent />
    </AuthGuard>
  )
}
