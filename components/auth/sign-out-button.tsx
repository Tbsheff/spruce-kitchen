"use client";

import type { VariantProps } from "class-variance-authority";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { Button, type buttonVariants } from "@/components/ui/button.tsx";
import { useAuth } from "@/lib/auth-context.tsx";

interface SignOutButtonProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly size?: VariantProps<typeof buttonVariants>["size"];
  readonly variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function SignOutButton({
  variant = "ghost",
  size = "default",
  className,
}: SignOutButtonProps) {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={className}
      disabled={isLoading}
      onClick={handleSignOut}
      size={size}
      variant={variant}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {size !== "sm" && <span className="ml-2">Sign Out</span>}
    </Button>
  );
}
