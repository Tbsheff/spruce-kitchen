"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Package,
  Plus,
  Search,
  Truck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useAuth } from "@/lib/auth-context.tsx";
import { trpc } from "@/lib/trpc/client.ts";
import { isOrderStatus, type OrderStatus } from "@/lib/types/enums.ts";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";
type StatusFilter = OrderStatus | "all";

const STATUS_ICONS = {
  pending: <AlertCircle className="h-4 w-4 text-gray-500" />,
  confirmed: <Package className="h-4 w-4 text-gray-500" />,
  preparing: <Clock className="h-4 w-4 text-yellow-500" />,
  shipped: <Truck className="h-4 w-4 text-blue-500" />,
  delivered: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <Package className="h-4 w-4 text-gray-500" />,
} as const satisfies Record<OrderStatus, ReactNode>;

const STATUS_COLORS = {
  pending: "secondary",
  confirmed: "secondary",
  preparing: "outline",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
} as const satisfies Record<OrderStatus, BadgeVariant>;

function getStatusIcon(status: OrderStatus): ReactNode {
  return STATUS_ICONS[status];
}

function getStatusColor(status: OrderStatus): BadgeVariant {
  return STATUS_COLORS[status];
}

export default function OrdersPage() {
  useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: orderHistory, isLoading } = trpc.user.getOrderHistory.useQuery({
    limit: 20,
    offset: 0,
  });

  // Mock data for demonstration when no database is connected
  const mockOrders = [
    {
      id: "order-001",
      status: "delivered" as OrderStatus,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mealPlanId: "plan-1",
    },
    {
      id: "order-002",
      status: "shipped" as OrderStatus,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      mealPlanId: "plan-1",
    },
    {
      id: "order-003",
      status: "preparing" as OrderStatus,
      totalAmount: 14_999,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      mealPlanId: "plan-2",
    },
    {
      id: "order-004",
      status: "pending" as OrderStatus,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
      mealPlanId: "plan-1",
    },
  ];

  const orders = orderHistory?.orders || mockOrders;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
        <p className="ml-4 text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your meal deliveries
          </p>
        </div>
        <Button asChild>
          <Link href="/order">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            value={searchQuery}
          />
        </div>
        <Select
          onValueChange={(value) => {
            if (value === "all" || isOrderStatus(value)) {
              setStatusFilter(value);
            }
          }}
          value={statusFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">No orders found</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {orders.length === 0
                ? "You haven't placed any orders yet. Start by creating your first meal plan!"
                : "No orders match your current search criteria."}
            </p>
            <Button asChild>
              <Link href="/order">Create Your First Order</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card className="transition-shadow hover:shadow-md" key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(-6)}
                      </CardTitle>
                      <CardDescription>
                        Placed on {order.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Delivery Date</p>
                      <p className="text-muted-foreground text-sm">
                        {order.deliveryDate
                          ? order.deliveryDate.toLocaleDateString()
                          : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Total Amount</p>
                      <p className="text-muted-foreground text-sm">
                        ${(order.totalAmount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Box Size</p>
                      <p className="text-muted-foreground text-sm">
                        {order.totalAmount > 10_000 ? "Medium" : "Small"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button size="sm" variant="outline">
                      Reorder
                    </Button>
                  )}
                  {(order.status === "pending" ||
                    order.status === "preparing") && (
                    <Button size="sm" variant="outline">
                      Modify Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
