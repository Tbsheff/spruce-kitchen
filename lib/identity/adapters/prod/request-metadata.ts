import type { RequestMetadata } from "@/lib/identity/core/ports.ts";

// Extract client IP and user-agent from an incoming Request. Falls back to
// "unknown" if a header is missing — matches the previous behavior in
// lib/trpc/procedures.ts getRequestMetadata().
export function headersRequestMetadata(
  req: Request | { headers: Headers }
): RequestMetadata {
  const headers = req.headers;
  return {
    ipAddress: headers.get("x-forwarded-for") ?? "unknown",
    userAgent: headers.get("user-agent") ?? "unknown",
  };
}
