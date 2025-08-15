import { NextRequest, NextResponse } from "next/server"
import { addVersionHeaders } from "@/lib/middleware/api-versioning"
import { API_VERSIONS, SUPPORTED_VERSIONS } from "@/lib/config/api-version"

/**
 * API v1 Information Endpoint
 * Returns API version details, available endpoints, and deprecation notices
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    api: {
      version: "v1",
      versionNumber: API_VERSIONS.v1,
      supportedVersions: SUPPORTED_VERSIONS,
      deprecationNotice: null, // No deprecation for v1 yet
    },
    endpoints: {
      health: "/api/v1/health",
      info: "/api/v1/info",
      // Future endpoints will be listed here
    },
    documentation: {
      // Links to API documentation when available
      openapi: null,
      postman: null,
    },
    rateLimiting: {
      enabled: true,
      defaultLimits: {
        authenticated: "1000 requests per hour",
        anonymous: "100 requests per hour",
      },
    },
    security: {
      authentication: "Bearer tokens via better-auth",
      encryption: "HTTPS required in production",
      inputValidation: "All inputs sanitized and validated",
    },
    lastUpdated: "2024-08-15T00:00:00Z",
  })

  return addVersionHeaders(response, "v1")
}