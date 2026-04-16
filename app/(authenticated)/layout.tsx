"use client";

import {
  Bell,
  CreditCard,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { AuthGuard } from "@/components/auth/auth-guard.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import { useAuth } from "@/lib/auth-context.tsx";

const navigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home },
      { title: "My Orders", href: "/orders", icon: Package },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "New Order", href: "/order", icon: ShoppingCart },
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Profile", href: "/profile", icon: User },
      { title: "Billing", href: "/billing", icon: CreditCard },
    ],
  },
] as const;

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1" />
                <NotificationButton />
                <UserMenu />
              </div>
            </header>
            <div className="flex-1 p-4 lg:p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link
          className="flex items-center gap-2 font-semibold"
          href="/dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            S
          </div>
          <span>Spruce Kitchen</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className="w-full justify-start"
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-muted-foreground text-xs">
          © 2024 Spruce Kitchen
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function NotificationButton() {
  return (
    <Button className="h-8 w-8" size="icon" variant="ghost">
      <Bell className="h-4 w-4" />
      <span className="sr-only">Notifications</span>
    </Button>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-8 w-8 rounded-full" variant="ghost">
          <Avatar className="h-8 w-8">
            <AvatarImage alt={user?.name || ""} src={user?.image ?? ""} />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user?.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
