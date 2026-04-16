"use client";

import { Camera, Mail, Save, Shield, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
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
import { Separator } from "@/components/ui/separator.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { toast } from "@/hooks/use-toast.ts";
import { useAuth } from "@/lib/auth-context.tsx";
import { trpc } from "@/lib/trpc/client.ts";

export default function ProfilePage() {
  const { user } = useAuth();
  trpc.user.getProfile.useQuery();

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

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      name: formData.name,
      email: formData.email,
    });
  };

  const accountAge = user?.createdAt
    ? Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      alt={user?.name || ""}
                      src={user?.image ?? ""}
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-transparent p-0"
                    size="sm"
                    variant="outline"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Member since
                </span>
                <span className="font-medium text-sm">
                  {accountAge > 0 ? `${accountAge} days ago` : "Today"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Account status
                </span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Email verified
                </span>
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
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
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter your email"
                      type="email"
                      value={formData.email}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="City, State"
                    value={formData.location}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    value={formData.bio}
                  />
                </div>

                <Button disabled={updateProfile.isPending} type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Communication Preferences
              </CardTitle>
              <CardDescription>
                Choose how you'd like to hear from us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-muted-foreground text-sm">
                      Get notified about your order status
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-muted-foreground text-sm">
                      Receive promotions and special offers
                    </p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Newsletter</p>
                    <p className="text-muted-foreground text-sm">
                      Weekly recipes and cooking tips
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
              <Button className="w-full bg-transparent" variant="outline">
                Manage Email Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
