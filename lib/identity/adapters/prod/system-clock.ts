import type { Clock } from "@/lib/identity/core/ports"

export function SystemClock(): Clock {
  return {
    nowMs() {
      return Date.now()
    },
  }
}
