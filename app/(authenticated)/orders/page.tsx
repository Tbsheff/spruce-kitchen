"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  Package,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react"

export default function OrdersPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: orderHistory, isLoading } = trpc.user.getOrderHistory.useQuery({
    limit: 20,
    offset: 0,
  })

  // Mock data for demonstration when no database is connected
  const mockOrders = [
    {
      id: "order-001",
      status: "delivered" as const,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mealPlanId: "plan-1",
    },
    {
      id: "order-002",
      status: "shipped" as const,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      mealPlanId: "plan-1",
    },
    {
      id: "order-003",
      status: "preparing" as const,
      totalAmount: 14999,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      mealPlanId: "plan-2",
    },
    {
      id: "order-004",
      status: "pending" as const,
      totalAmount: 7999,
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
      mealPlanId: "plan-1",
    },
  ]

  const orders = orderHistory?.orders || mockOrders

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "preparing":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default"
      case "shipped":
        return "secondary"
      case "preparing":
        return "outline"
      case "pending":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your meal deliveries</p>
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground text-center mb-4">
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
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                      <CardDescription>Placed on {order.createdAt.toLocaleDateString()}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Delivery Date</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Amount</p>
                      <p className="text-sm text-muted-foreground">${(order.totalAmount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Box Size</p>
                      <p className="text-sm text-muted-foreground">{order.totalAmount > 10000 ? "Medium" : "Small"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                  {(order.status === "pending" || order.status === "preparing") && (
                    <Button variant="outline" size="sm">
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
  )
}
