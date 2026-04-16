import { type NextRequest, NextResponse } from "next/server";

/**
 * API v1 Health Check Endpoint
 * Returns basic health status and API version information
 */

/** Response shape for `GET /api/v1/health`. */
export interface HealthResponse {
  environment: string | undefined;
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
}

export function GET(_request: NextRequest) {
  return NextResponse.json<HealthResponse>({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
