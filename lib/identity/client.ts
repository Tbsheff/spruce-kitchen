"use client";

// Client-side entry point. `useCurrentUser` returns the same CurrentUserState
// shape that the server sees — one discriminated union consumed identically on
// both runtimes.
//
// Backed by `GET /api/identity/me`, which serializes the resolved state;
// hydration reconstructs the functional `can()` method on the client.

import { useEffect, useMemo, useState } from "react";
import type {
  CurrentUserState,
  SerializedCurrentUserState,
} from "./core/domain.ts";
import { hydrateCurrentUser } from "./core/domain.ts";

type Fetched =
  | { kind: "loading" }
  | { kind: "ready"; payload: SerializedCurrentUserState }
  | { kind: "error" };

// Single in-flight fetch shared across all hook consumers on the page.
let inflight: Promise<SerializedCurrentUserState> | null = null;

function fetchIdentity(): Promise<SerializedCurrentUserState> {
  if (inflight) {
    return inflight;
  }
  inflight = (async () => {
    try {
      const response = await fetch("/api/identity/me", {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        return { status: "anonymous" };
      }
      return (await response.json()) as SerializedCurrentUserState;
    } catch {
      return { status: "anonymous" };
    } finally {
      // Allow next consumer to refetch (e.g. after sign-in) once this resolves.
      queueMicrotask(() => {
        inflight = null;
      });
    }
  })();
  return inflight;
}

// Force a refetch on the next hook render (e.g. after sign-in / sign-out).
export function invalidateCurrentUser(): void {
  inflight = null;
}

export function useCurrentUser(): CurrentUserState {
  const [state, setState] = useState<Fetched>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchIdentity().then((payload) => {
      if (!cancelled) {
        setState({ kind: "ready", payload });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo<CurrentUserState>(() => {
    if (state.kind === "loading") {
      return { status: "loading" };
    }
    if (state.kind === "error") {
      return { status: "anonymous" };
    }
    return hydrateCurrentUser(state.payload);
  }, [state]);
}
