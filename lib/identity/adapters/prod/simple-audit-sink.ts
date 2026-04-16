// Production AuditSink that forwards to the existing SimpleAuditService.
// This is the ONLY place in lib/identity/ that imports SimpleAuditService.

import { SimpleAuditService } from "@/lib/security/simple-audit"
import type { AuditEvent, AuditSink } from "@/lib/identity/core/ports"

export function SimpleAuditSink(): AuditSink {
  return {
    emit(event: AuditEvent) {
      // SimpleAuditService.log is fire-and-forget internally (setImmediate).
      // We intentionally do not await — the AuditSink contract is sync emit.
      void SimpleAuditService.log({
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        details: event.details as Record<string, unknown> | undefined,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      })
    },
  }
}
