import type { Clock } from "@/lib/identity/core/ports.ts";

export function SystemClock(): Clock {
  return {
    nowMs() {
      return Date.now();
    },
  };
}
