"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Plus,
  Settings,
  TrendingUp,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useAuth } from "@/lib/auth-context.tsx";
import { trpc } from "@/lib/trpc/client.ts";
import type { OrderStatus } from "@/lib/types/enums.ts";

const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  delivered: "default",
  shipped: "secondary",
  preparing: "outline",
  pending: "secondary",
  confirmed: "secondary",
  cancelled: "destructive",
};

export default function DashboardPage() {
  const { user } = useAuth();
  trpc.user.getProfile.useQuery();
  const { data: mealPlans } = trpc.mealPlan.getUserPlans.useQuery();
  const { data: orderHistory } = trpc.user.getOrderHistory.useQuery({
    limit: 5,
  });

  // Mock data for demonstration when no database is connected
  const mockOrders = [
    {
      id: "order-1",
      status: "delivered" as OrderStatus,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "order-2",
      status: "shipped" as OrderStatus,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "order-3",
      status: "preparing" as OrderStatus,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
  ];

  const mockStats = {
    totalOrders: 12,
    activeSubscriptions: 1,
    totalSpent: 95_988, // $959.88
    nextDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  };

  const orders = orderHistory?.orders || mockOrders;
  const stats = mockStats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Welcome back, {user?.name || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your meal plans
          </p>
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
            <CardTitle className="font-medium text-sm">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalOrders}</div>
            <p className="text-muted-foreground text-xs">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Plans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {stats.activeSubscriptions}
            </div>
            <p className="text-muted-foreground text-xs">Weekly subscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${(stats.totalSpent / 100).toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">Since joining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Next Delivery</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {stats.nextDelivery.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.nextDelivery.toLocaleDateString("en-US", {
                weekday: "long",
              })}
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
              <div className="py-6 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 font-semibold text-sm">No orders yet</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Start by creating your first meal plan
                </p>
                <Button asChild className="mt-4">
                  <Link href="/order">Create Order</Link>
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  className="flex items-center justify-between space-x-4"
                  key={order.id}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {order.status === "delivered" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {order.status === "shipped" && (
                        <Truck className="h-5 w-5 text-blue-500" />
                      )}
                      {order.status === "preparing" && (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      {order.status === "pending" && (
                        <AlertCircle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">
                        Order #{order.id.slice(-6)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {order.deliveryDate
                          ? order.deliveryDate.toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        ORDER_STATUS_BADGE_VARIANT[order.status] ?? "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                    <span className="font-medium text-sm">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {orders.length > 0 && (
              <>
                <Separator />
                <Button
                  asChild
                  className="w-full bg-transparent"
                  variant="outline"
                >
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
              <div className="py-6 text-center">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 font-semibold text-sm">No active plans</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Create a meal plan to get started
                </p>
                <Button asChild className="mt-4">
                  <Link href="/order">Create Plan</Link>
                </Button>
              </div>
            ) : (
              mealPlans.map((plan) => (
                <div className="space-y-3 rounded-lg border p-4" key={plan.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium capitalize">
                        {plan.planType} Box
                      </h4>
                      <p className="text-muted-foreground text-sm capitalize">
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
                      <Progress className="h-2" value={70} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/settings?plan=${plan.id}`}>Manage</Link>
                    </Button>
                    {plan.isActive && (
                      <Button size="sm" variant="outline">
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
            <Button
              asChild
              className="h-auto bg-transparent p-4"
              variant="outline"
            >
              <Link
                className="flex flex-col items-center space-y-2"
                href="/order"
              >
                <Plus className="h-6 w-6" />
                <span>Create New Order</span>
              </Link>
            </Button>

            <Button
              asChild
              className="h-auto bg-transparent p-4"
              variant="outline"
            >
              <Link
                className="flex flex-col items-center space-y-2"
                href="/settings"
              >
                <Settings className="h-6 w-6" />
                <span>Manage Subscription</span>
              </Link>
            </Button>

            <Button
              asChild
              className="h-auto bg-transparent p-4"
              variant="outline"
            >
              <Link
                className="flex flex-col items-center space-y-2"
                href="/profile"
              >
                <User className="h-6 w-6" />
                <span>Update Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
