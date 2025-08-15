import { NextRequest, NextResponse } from "next/server"

/**
 * API v1 Health Check Endpoint
 * Returns basic health status and API version information
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}