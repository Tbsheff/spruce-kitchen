"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useCurrentUser } from "@/lib/identity/client.ts";

interface AuthGuardProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const state = useCurrentUser();

  useEffect(() => {
    if (state.status === "anonymous") {
      router.replace("/login");
    }
  }, [state.status, router]);

  if (state.status === "loading") {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    );
  }

  if (state.status === "anonymous") {
    return null; // Effect above is redirecting.
  }

  return <>{children}</>;
}
