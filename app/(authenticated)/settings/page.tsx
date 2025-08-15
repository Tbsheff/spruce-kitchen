"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/lib/auth-context"
import { User, MapPin, Utensils, CreditCard, Bell, Save, Pause, X } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { data: profile } = trpc.user.getProfile.useQuery()
  const { data: mealPlans } = trpc.mealPlan.getUserPlans.useQuery()

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updatePreferences = trpc.user.updatePreferences.useMutation({
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your dietary preferences have been updated.",
      })
    },
  })

  const updateAddress = trpc.user.updateDeliveryAddress.useMutation({
    onSuccess: () => {
      toast({
        title: "Address updated",
        description: "Your delivery address has been updated.",
      })
    },
  })

  const cancelMealPlan = trpc.mealPlan.cancel.useMutation({
    onSuccess: () => {
      toast({
        title: "Subscription cancelled",
        description: "Your meal plan has been cancelled.",
      })
    },
  })

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    instructions: "",
  })

  const [preferences, setPreferences] = useState({
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    servingSize: "medium" as "small" | "medium" | "large",
  })

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    deliveryReminders: true,
    promotions: false,
    newsletter: true,
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    await updateProfile.mutateAsync({
      name: formData.name,
      email: formData.email,
    })
  }

  const handleAddressUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateAddress.mutateAsync(addressData)
  }

  const handlePreferencesUpdate = async () => {
    await updatePreferences.mutateAsync(preferences)
  }

  const handleCancelSubscription = async (planId: string) => {
    await cancelMealPlan.mutateAsync({ id: planId })
  }

  const activePlans = mealPlans?.filter((plan) => plan.isActive) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your personal information and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Change Password</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="Current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="New password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updateProfile.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
              <CardDescription>Manage where your meals are delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddressUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={addressData.state}
                      onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={addressData.zipCode}
                      onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                      placeholder="94102"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Delivery Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={addressData.instructions}
                    onChange={(e) => setAddressData({ ...addressData, instructions: e.target.value })}
                    placeholder="Leave at front door, ring doorbell, etc."
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={updateAddress.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateAddress.isPending ? "Saving..." : "Save Address"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>Help us customize your meal selections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Serving Size</Label>
                <Select
                  value={preferences.servingSize}
                  onValueChange={(value: "small" | "medium" | "large") =>
                    setPreferences({ ...preferences, servingSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (2-3 people)</SelectItem>
                    <SelectItem value="medium">Medium (4-6 people)</SelectItem>
                    <SelectItem value="large">Large (6+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Dietary Restrictions</Label>
                <div className="flex flex-wrap gap-2">
                  {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo"].map((restriction) => (
                    <Badge
                      key={restriction}
                      variant={preferences.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const updated = preferences.dietaryRestrictions.includes(restriction)
                          ? preferences.dietaryRestrictions.filter((r) => r !== restriction)
                          : [...preferences.dietaryRestrictions, restriction]
                        setPreferences({ ...preferences, dietaryRestrictions: updated })
                      }}
                    >
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {["Nuts", "Shellfish", "Fish", "Eggs", "Soy", "Sesame"].map((allergy) => (
                    <Badge
                      key={allergy}
                      variant={preferences.allergies.includes(allergy) ? "destructive" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const updated = preferences.allergies.includes(allergy)
                          ? preferences.allergies.filter((a) => a !== allergy)
                          : [...preferences.allergies, allergy]
                        setPreferences({ ...preferences, allergies: updated })
                      }}
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handlePreferencesUpdate} disabled={updatePreferences.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your active meal plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePlans.length === 0 ? (
                <div className="text-center py-6">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No active subscriptions</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Create a meal plan to get started</p>
                  <Button className="mt-4">Create Subscription</Button>
                </div>
              ) : (
                activePlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium capitalize">{plan.planType} Box</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.billingType} • {plan.deliveryFrequency}
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this meal plan? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelSubscription(plan.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Cancel Subscription
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you'd like to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about order confirmations and delivery updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Delivery Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive reminders about upcoming deliveries</p>
                  </div>
                  <Switch
                    checked={notifications.deliveryReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, deliveryReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Promotions</Label>
                    <p className="text-sm text-muted-foreground">Get notified about special offers and discounts</p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletter</Label>
                    <p className="text-sm text-muted-foreground">Receive our weekly newsletter with recipes and tips</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
                  />
                </div>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
