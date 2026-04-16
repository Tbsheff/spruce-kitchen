import { type NextRequest, NextResponse } from "next/server";
import {
  createServerIdentityPorts,
  resolveCurrentUser,
} from "@/lib/identity";
import { serializeCurrentUser } from "@/lib/identity/core/domain";
import type { SerializedCurrentUserState } from "@/lib/identity/core/domain";

// Returns the resolved CurrentUserState for the caller in serializable form.
// The client hook (`useCurrentUser` in lib/identity/client.ts) fetches this
// endpoint and hydrates the payload back into a functional `CurrentUser`.
//
// This is a plain REST route rather than a tRPC procedure intentionally —
// identity lookup is a simple read and adding it to the AppRouter interferes
// with the `Parameters<typeof trpc.X.useMutation>[0]` pattern that
// lib/trpc/hooks.ts relies on.
export async function GET(request: NextRequest) {
  const ports = createServerIdentityPorts(request);
  const state = await resolveCurrentUser(ports);
  const payload: SerializedCurrentUserState = serializeCurrentUser(state);

  return NextResponse.json(payload, {
    headers: {
      // Per-session cache; the session cookie is the cache key upstream.
      "Cache-Control": "private, no-store",
    },
  });
}
