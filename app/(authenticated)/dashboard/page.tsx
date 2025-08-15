"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Settings,
  AlertCircle,
  User,
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: profile } = trpc.user.getProfile.useQuery()
  const { data: mealPlans } = trpc.mealPlan.getUserPlans.useQuery()
  const { data: orderHistory } = trpc.user.getOrderHistory.useQuery({ limit: 5 })

  // Mock data for demonstration when no database is connected
  const mockOrders = [
    {
      id: "order-1",
      status: "delivered" as const,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "order-2",
      status: "shipped" as const,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "order-3",
      status: "preparing" as const,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
  ]

  const mockStats = {
    totalOrders: 12,
    activeSubscriptions: 1,
    totalSpent: 95988, // $959.88
    nextDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  }

  const orders = orderHistory?.orders || mockOrders
  const stats = mockStats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "there"}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your meal plans</p>
        </div>
        <Button asChild>
          <Link href="/order">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Weekly subscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalSpent / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Since joining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Delivery</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.nextDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.nextDelivery.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Track your meal deliveries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-6">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No orders yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Start by creating your first meal plan</p>
                <Button asChild className="mt-4">
                  <Link href="/order">Create Order</Link>
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {order.status === "delivered" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {order.status === "shipped" && <Truck className="h-5 w-5 text-blue-500" />}
                      {order.status === "preparing" && <Clock className="h-5 w-5 text-yellow-500" />}
                      {order.status === "pending" && <AlertCircle className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "shipped"
                            ? "secondary"
                            : order.status === "preparing"
                              ? "outline"
                              : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                    <span className="text-sm font-medium">${(order.totalAmount / 100).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}

            {orders.length > 0 && (
              <>
                <Separator />
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/orders">View All Orders</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Meal Plans</CardTitle>
            <CardDescription>Manage your subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!mealPlans || mealPlans.length === 0 ? (
              <div className="text-center py-6">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No active plans</h3>
                <p className="mt-1 text-sm text-muted-foreground">Create a meal plan to get started</p>
                <Button asChild className="mt-4">
                  <Link href="/order">Create Plan</Link>
                </Button>
              </div>
            ) : (
              mealPlans.map((plan) => (
                <div key={plan.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium capitalize">{plan.planType} Box</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {plan.billingType} • {plan.deliveryFrequency}
                      </p>
                    </div>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>

                  {plan.isActive && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Next delivery progress</span>
                        <span>3 days left</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/settings?plan=${plan.id}`}>Manage</Link>
                    </Button>
                    {plan.isActive && (
                      <Button variant="outline" size="sm">
                        Pause
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild className="h-auto p-4 bg-transparent">
              <Link href="/order" className="flex flex-col items-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>Create New Order</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4 bg-transparent">
              <Link href="/settings" className="flex flex-col items-center space-y-2">
                <Settings className="h-6 w-6" />
                <span>Manage Subscription</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4 bg-transparent">
              <Link href="/profile" className="flex flex-col items-center space-y-2">
                <User className="h-6 w-6" />
                <span>Update Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
