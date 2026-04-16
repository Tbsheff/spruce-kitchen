import { type NextRequest, NextResponse } from "next/server";
import {
  CURRENT_VERSION,
  getApiVersion,
  getVersionHeaders,
  isVersionSupported,
} from "@/lib/config/api-version.ts";

/**
 * API Versioning Middleware
 * Handles version validation and sets appropriate headers
 */
export function withApiVersioning(request: NextRequest): NextResponse | null {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return null;
  }

  // Skip versioning for auth routes (handled by better-auth)
  if (request.nextUrl.pathname.startsWith("/api/auth/")) {
    return null;
  }

  // Skip versioning for tRPC (has its own versioning strategy)
  if (request.nextUrl.pathname.startsWith("/api/trpc/")) {
    return null;
  }

  try {
    const requestedVersion = getApiVersion(request);

    // Check if version is supported
    if (!isVersionSupported(requestedVersion)) {
      return NextResponse.json(
        {
          error: "Unsupported API version",
          requestedVersion,
          supportedVersions: ["v1"], // hardcoded for now
          message:
            "Please use a supported API version in the URL path (e.g., /api/v1/) or Accept-Version header",
        },
        {
          status: 400,
          headers: getVersionHeaders(CURRENT_VERSION),
        }
      );
    }

    // For non-versioned API calls, redirect to current version
    if (!request.nextUrl.pathname.includes("/v")) {
      const newUrl = new URL(request.url);
      newUrl.pathname = newUrl.pathname.replace(
        "/api/",
        `/api/${CURRENT_VERSION}/`
      );

      return NextResponse.redirect(newUrl, 301);
    }

    return null; // Continue to next middleware/handler
  } catch (error) {
    console.error("API versioning middleware error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to process API version",
      },
      { status: 500 }
    );
  }
}

/**
 * Add version headers to API responses
 */
export function addVersionHeaders(response: NextResponse, version?: string) {
  const resolvedVersion =
    version && isVersionSupported(version) ? version : CURRENT_VERSION;
  const headers = getVersionHeaders(resolvedVersion);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
