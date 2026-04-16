/**
 * API Version Configuration
 * Manages API versioning strategy and backward compatibility
 */

export const API_VERSIONS = {
  v1: "1.0.0",
  // Future versions:
  // v2: "2.0.0",
} as const;

export type ApiVersion = keyof typeof API_VERSIONS;

export const CURRENT_VERSION: ApiVersion = "v1";
export const SUPPORTED_VERSIONS: ApiVersion[] = ["v1"];

const VERSION_SEGMENT_RE = /^v\d+$/;

/**
 * Type predicate: narrows an arbitrary string to `ApiVersion` when it is
 * part of the supported-versions list.
 */
export function isApiVersion(v: string): v is ApiVersion {
  return (SUPPORTED_VERSIONS as readonly string[]).includes(v);
}

/**
 * API Version Middleware Helper
 * Extracts API version from request headers or URL
 */
export function getApiVersion(request: Request): ApiVersion {
  // Check URL path for version
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");

  // Look for /api/v1, /api/v2, etc.
  const versionSegment = pathSegments.find((segment) =>
    VERSION_SEGMENT_RE.test(segment)
  );

  if (versionSegment && isApiVersion(versionSegment)) {
    return versionSegment;
  }

  // Check Accept-Version header
  const acceptVersion = request.headers.get("Accept-Version");
  if (acceptVersion && isApiVersion(acceptVersion)) {
    return acceptVersion;
  }

  // Default to current version
  return CURRENT_VERSION;
}

/**
 * Validate if requested API version is supported
 */
export function isVersionSupported(version: string): version is ApiVersion {
  return isApiVersion(version);
}

/**
 * Get version-specific response headers
 */
export function getVersionHeaders(version: ApiVersion) {
  return {
    "API-Version": API_VERSIONS[version],
    "API-Supported-Versions": SUPPORTED_VERSIONS.join(", "),
  };
}
