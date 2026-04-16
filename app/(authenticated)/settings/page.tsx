"use client";

import {
  Bell,
  CreditCard,
  MapPin,
  Pause,
  Save,
  User,
  Utensils,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { z } from "zod";
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
} from "@/components/ui/alert-dialog.tsx";
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
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { toast } from "@/hooks/use-toast.ts";
import { useAuth } from "@/lib/auth-context.tsx";
import { trpc } from "@/lib/trpc/client.ts";

type ServingSize = "small" | "medium" | "large";

interface AccountFields {
  email: string;
  name: string;
}

interface PasswordFields {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
}

type FormData = AccountFields & PasswordFields;

interface AddressData {
  city: string;
  country: string;
  instructions: string;
  state: string;
  street: string;
  zipCode: string;
}

interface PreferencesData {
  allergies: string[];
  dietaryRestrictions: string[];
  servingSize: ServingSize;
}

const DEFAULT_ADDRESS_DATA: AddressData = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "United States",
  instructions: "",
};

const DEFAULT_PREFERENCES: PreferencesData = {
  dietaryRestrictions: [],
  allergies: [],
  servingSize: "medium",
};

type RawDeliveryAddress = AddressData | null | undefined;
type RawPreferences =
  | {
      dietaryRestrictions?: string[];
      allergies?: string[];
      servingSize?: ServingSize;
    }
  | null
  | undefined;

function hydrateAddress(raw: RawDeliveryAddress): AddressData {
  return {
    street: raw?.street ?? DEFAULT_ADDRESS_DATA.street,
    city: raw?.city ?? DEFAULT_ADDRESS_DATA.city,
    state: raw?.state ?? DEFAULT_ADDRESS_DATA.state,
    zipCode: raw?.zipCode ?? DEFAULT_ADDRESS_DATA.zipCode,
    country: raw?.country ?? DEFAULT_ADDRESS_DATA.country,
    instructions: raw?.instructions ?? DEFAULT_ADDRESS_DATA.instructions,
  };
}

function hydratePreferences(raw: RawPreferences): PreferencesData {
  return {
    dietaryRestrictions:
      raw?.dietaryRestrictions ?? DEFAULT_PREFERENCES.dietaryRestrictions,
    allergies: raw?.allergies ?? DEFAULT_PREFERENCES.allergies,
    servingSize: raw?.servingSize ?? DEFAULT_PREFERENCES.servingSize,
  };
}

function mergeAddress(
  edits: Partial<AddressData>,
  hydrated: AddressData
): AddressData {
  return {
    street: edits.street ?? hydrated.street,
    city: edits.city ?? hydrated.city,
    state: edits.state ?? hydrated.state,
    zipCode: edits.zipCode ?? hydrated.zipCode,
    country: edits.country ?? hydrated.country,
    instructions: edits.instructions ?? hydrated.instructions,
  };
}

function mergePreferences(
  edits: Partial<PreferencesData>,
  hydrated: PreferencesData
): PreferencesData {
  return {
    dietaryRestrictions:
      edits.dietaryRestrictions ?? hydrated.dietaryRestrictions,
    allergies: edits.allergies ?? hydrated.allergies,
    servingSize: edits.servingSize ?? hydrated.servingSize,
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: mealPlans } = trpc.mealPlan.getUserPlans.useQuery();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePreferences = trpc.user.updatePreferences.useMutation({
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your dietary preferences have been updated.",
      });
    },
  });

  const updateAddress = trpc.user.updateDeliveryAddress.useMutation({
    onSuccess: () => {
      toast({
        title: "Address updated",
        description: "Your delivery address has been updated.",
      });
    },
  });

  const cancelMealPlan = trpc.mealPlan.cancel.useMutation({
    onSuccess: () => {
      toast({
        title: "Subscription cancelled",
        description: "Your meal plan has been cancelled.",
      });
    },
  });

  const hydratedAccountData: AccountFields = {
    name: profile?.name ?? user?.name ?? "",
    email: profile?.email ?? user?.email ?? "",
  };

  // profile?.deliveryAddress is inferred as `null` by tRPC (router always returns null).
  const hydratedAddressData = hydrateAddress(
    profile?.deliveryAddress as RawDeliveryAddress
  );
  const hydratedPreferences = hydratePreferences(
    profile?.preferences as RawPreferences
  );

  const [accountEdits, setAccountEdits] = useState<Partial<AccountFields>>({});
  const [passwordData, setPasswordData] = useState<PasswordFields>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressEdits, setAddressEdits] = useState<Partial<AddressData>>({});
  const [preferenceEdits, setPreferenceEdits] = useState<
    Partial<PreferencesData>
  >({});

  const formData: FormData = {
    name: accountEdits.name ?? hydratedAccountData.name,
    email: accountEdits.email ?? hydratedAccountData.email,
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword,
  };

  const addressData = mergeAddress(addressEdits, hydratedAddressData);
  const preferences = mergePreferences(preferenceEdits, hydratedPreferences);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    deliveryReminders: true,
    promotions: false,
    newsletter: true,
  });

  const validatePasswordMatch = () => {
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const submitProfile = async () => {
    if (!validatePasswordMatch()) {
      return;
    }
    await updateProfile.mutateAsync({
      name: formData.name,
      email: formData.email,
    });
  };

  const submitAddress = async () => {
    await updateAddress.mutateAsync(addressData);
  };

  const submitPreferences = async () => {
    await updatePreferences.mutateAsync(preferences);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitProfile();
  };

  const handleAddressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAddress();
  };

  const handlePreferencesUpdate = async () => {
    await submitPreferences();
  };

  const handleCancelSubscription = async (planId: string) => {
    await cancelMealPlan.mutateAsync({ id: planId });
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const updated = preferences.dietaryRestrictions.includes(restriction)
      ? preferences.dietaryRestrictions.filter((r) => r !== restriction)
      : [...preferences.dietaryRestrictions, restriction];
    setPreferenceEdits((current) => ({
      ...current,
      dietaryRestrictions: updated,
    }));
  };

  const toggleAllergy = (allergy: string) => {
    const updated = preferences.allergies.includes(allergy)
      ? preferences.allergies.filter((a) => a !== allergy)
      : [...preferences.allergies, allergy];
    setPreferenceEdits((current) => ({
      ...current,
      allergies: updated,
    }));
  };

  const activePlans = mealPlans?.filter((plan) => plan.isActive) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs className="space-y-6" defaultValue="account">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger className="flex items-center gap-2" value="account">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="delivery">
            <MapPin className="h-4 w-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="preferences">
            <Utensils className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="subscription">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2"
            value="notifications"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      onChange={(e) =>
                        setAccountEdits((current) => ({
                          ...current,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                      value={formData.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      onChange={(e) =>
                        setAccountEdits((current) => ({
                          ...current,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter your email"
                      type="email"
                      value={formData.email}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Change Password</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        onChange={(e) =>
                          setPasswordData((current) => ({
                            ...current,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Current password"
                        type="password"
                        value={formData.currentPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        onChange={(e) =>
                          setPasswordData((current) => ({
                            ...current,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="New password"
                        type="password"
                        value={formData.newPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        onChange={(e) =>
                          setPasswordData((current) => ({
                            ...current,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Confirm password"
                        type="password"
                        value={formData.confirmPassword}
                      />
                    </div>
                  </div>
                </div>

                <Button disabled={updateProfile.isPending} type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
              <CardDescription>
                Manage where your meals are delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAddressUpdate}>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    onChange={(e) =>
                      setAddressEdits((current) => ({
                        ...current,
                        street: e.target.value,
                      }))
                    }
                    placeholder="123 Main Street"
                    value={addressData.street}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      onChange={(e) =>
                        setAddressEdits((current) => ({
                          ...current,
                          city: e.target.value,
                        }))
                      }
                      placeholder="San Francisco"
                      value={addressData.city}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      onChange={(e) =>
                        setAddressEdits((current) => ({
                          ...current,
                          state: e.target.value,
                        }))
                      }
                      placeholder="CA"
                      value={addressData.state}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      onChange={(e) =>
                        setAddressEdits((current) => ({
                          ...current,
                          zipCode: e.target.value,
                        }))
                      }
                      placeholder="94102"
                      value={addressData.zipCode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Delivery Instructions</Label>
                  <Textarea
                    id="instructions"
                    onChange={(e) =>
                      setAddressEdits((current) => ({
                        ...current,
                        instructions: e.target.value,
                      }))
                    }
                    placeholder="Leave at front door, ring doorbell, etc."
                    rows={3}
                    value={addressData.instructions}
                  />
                </div>

                <Button disabled={updateAddress.isPending} type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {updateAddress.isPending ? "Saving..." : "Save Address"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>
                Help us customize your meal selections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Serving Size</Label>
                <Select
                  onValueChange={(value: ServingSize) =>
                    setPreferenceEdits((current) => ({
                      ...current,
                      servingSize: value,
                    }))
                  }
                  value={preferences.servingSize}
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
                  {[
                    "Vegetarian",
                    "Vegan",
                    "Gluten-Free",
                    "Dairy-Free",
                    "Keto",
                    "Paleo",
                  ].map((restriction) => (
                    <Badge
                      className="cursor-pointer"
                      key={restriction}
                      onClick={() => toggleDietaryRestriction(restriction)}
                      variant={
                        preferences.dietaryRestrictions.includes(restriction)
                          ? "default"
                          : "outline"
                      }
                    >
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {["Nuts", "Shellfish", "Fish", "Eggs", "Soy", "Sesame"].map(
                    (allergy) => (
                      <Badge
                        className="cursor-pointer"
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        variant={
                          preferences.allergies.includes(allergy)
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {allergy}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <Button
                disabled={updatePreferences.isPending}
                onClick={handlePreferencesUpdate}
              >
                <Save className="mr-2 h-4 w-4" />
                {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your active meal plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePlans.length === 0 ? (
                <div className="py-6 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 font-semibold text-sm">
                    No active subscriptions
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Create a meal plan to get started
                  </p>
                  <Button className="mt-4">Create Subscription</Button>
                </div>
              ) : (
                activePlans.map((plan) => (
                  <div
                    className="space-y-4 rounded-lg border p-4"
                    key={plan.id}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium capitalize">
                          {plan.planType} Box
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {plan.billingType} • {plan.deliveryFrequency}
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel Subscription
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this meal plan?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Keep Subscription
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleCancelSubscription(plan.id)}
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

        <TabsContent className="space-y-6" value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Updates</Label>
                    <p className="text-muted-foreground text-sm">
                      Get notified about order confirmations and delivery
                      updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        orderUpdates: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Delivery Reminders</Label>
                    <p className="text-muted-foreground text-sm">
                      Receive reminders about upcoming deliveries
                    </p>
                  </div>
                  <Switch
                    checked={notifications.deliveryReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        deliveryReminders: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Promotions</Label>
                    <p className="text-muted-foreground text-sm">
                      Get notified about special offers and discounts
                    </p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        promotions: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletter</Label>
                    <p className="text-muted-foreground text-sm">
                      Receive our weekly newsletter with recipes and tips
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        newsletter: checked,
                      })
                    }
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
  );
}
