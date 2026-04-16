import { type NextRequest, NextResponse } from "next/server";
import {
  API_VERSIONS,
  type ApiVersion,
  SUPPORTED_VERSIONS,
} from "@/lib/config/api-version.ts";
import { addVersionHeaders } from "@/lib/middleware/api-versioning.ts";

/**
 * API v1 Information Endpoint
 * Returns API version details, available endpoints, and deprecation notices
 */

/** Response shape for `GET /api/v1/info`. */
export interface InfoResponse {
  api: {
    version: ApiVersion;
    versionNumber: string;
    supportedVersions: readonly ApiVersion[];
    deprecationNotice: string | null;
  };
  documentation: {
    openapi: string | null;
    postman: string | null;
  };
  endpoints: Record<string, string>;
  lastUpdated: string;
  rateLimiting: {
    enabled: boolean;
    defaultLimits: {
      authenticated: string;
      anonymous: string;
    };
  };
  security: {
    authentication: string;
    encryption: string;
    inputValidation: string;
  };
}

export function GET(_request: NextRequest) {
  const response = NextResponse.json<InfoResponse>({
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
  });

  return addVersionHeaders(response, "v1");
}
