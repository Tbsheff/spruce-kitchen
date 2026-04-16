// Production AuditSink that forwards to the existing SimpleAuditService.
// This is the ONLY place in lib/identity/ that imports SimpleAuditService.

import type { AuditEvent, AuditSink } from "@/lib/identity/core/ports.ts";
import type { AuditDetails } from "@/lib/security/simple-audit.ts";
import { SimpleAuditService } from "@/lib/security/simple-audit.ts";

export function SimpleAuditSink(): AuditSink {
  return {
    emit(event: AuditEvent) {
      // SimpleAuditService.log is fire-and-forget internally (setImmediate).
      // We intentionally do not await — the AuditSink contract is sync emit.
      SimpleAuditService.log({
        userId: event.userId ?? null,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId ?? null,
        details: (event.details as AuditDetails | undefined) ?? null,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
      }).catch((err) => {
        console.error("audit log failed:", err);
      });
    },
  };
}
