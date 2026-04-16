import { type NextRequest, NextResponse } from "next/server";
import { withApiVersioning } from "@/lib/middleware/api-versioning.ts";

/**
 * API-specific middleware that runs for all /api/* routes
 * Handles versioning, rate limiting, and API security
 */
export function middleware(request: NextRequest) {
  // Apply API versioning middleware
  const versioningResponse = withApiVersioning(request);
  if (versioningResponse) {
    return versioningResponse;
  }

  // Continue to the actual API handler
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
