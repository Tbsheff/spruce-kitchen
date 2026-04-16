// Production AuditSink that forwards to the simple-audit backend.
// This is the ONLY place in lib/identity/ that imports the simple-audit module.

import type { AuditEvent, AuditSink } from "@/lib/identity/core/ports.ts";
import { logAudit } from "@/lib/security/simple-audit.ts";

export function SimpleAuditSink(): AuditSink {
  return {
    emit(event: AuditEvent) {
      // logAudit is fire-and-forget internally (setImmediate).
      // We intentionally do not await — the AuditSink contract is sync emit.
      logAudit({
        userId: event.userId ?? null,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId ?? null,
        details: event.details ?? null,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
      }).catch((err) => {
        console.error("audit log failed:", err);
      });
    },
  };
}
