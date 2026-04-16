// Server-only helpers for RSC / server actions. These wrap the pure
// resolveCurrentUser() with per-request memoization (via React.cache) and
// provide a redirect-on-anonymous convenience.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { CurrentUser, CurrentUserState } from "./core/domain.ts";
import { createServerIdentityPorts, resolveCurrentUser } from "./index.ts";

// Cached per render. Multiple calls within one request hit the same resolver.
export const currentUser = cache(async (): Promise<CurrentUserState> => {
  const h = await headers();
  return resolveCurrentUser(createServerIdentityPorts({ headers: h }));
});

// Convenience for pages/layouts that must be authenticated. Redirects to
// /login when anonymous; returns the resolved CurrentUser otherwise.
export async function requireUser(): Promise<CurrentUser> {
  const state = await currentUser();
  if (state.status !== "authenticated") {
    redirect("/login");
  }
  return state.user;
}
