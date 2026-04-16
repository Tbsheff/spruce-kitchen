import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  NONCE_HEADER,
  generateCSPHeader,
  generateCSPNonce,
} from "@/lib/security/input-validation.ts";

/**
 * Builds a NextResponse for the downstream route with the nonce threaded
 * onto both the forwarded request headers (so server components can read
 * it via next/headers and Next.js can stamp <script nonce=...>) and the
 * response's CSP header (so the browser trusts those scripts).
 */
function buildSecureResponse(
  request: NextRequest,
  nonce: string,
  isProduction: boolean,
): NextResponse {
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set(NONCE_HEADER, nonce);
  const response = NextResponse.next({
    request: { headers: forwardedHeaders },
  });

  response.headers.set("Content-Security-Policy", generateCSPHeader(nonce));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), location=()",
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

// Define protected and public routes
const protectedRoutes = ["/onboarding", "/dashboard", "/profile", "/settings"];
const authRoutes = ["/login", "/signup"];
const publicRoutes = [
  "/",
  "/about",
  "/pricing",
  "/menu",
  "/how-it-works",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };
  const isProduction = env.NODE_ENV === "production";
  const nonce = generateCSPNonce();

  // Allow API routes and static files to pass through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // SECURITY: Database is REQUIRED for authentication - no exceptions
  if (!env.DATABASE_URL) {
    console.error(
      "🚨 SECURITY ERROR: DATABASE_URL is required for authentication"
    );
    console.error("🚨 Configure your database to use this application");

    // For protected routes, always redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "service_unavailable");
      return NextResponse.redirect(loginUrl);
    }

    // For auth routes, show generic error
    if (isAuthRoute) {
      const errorUrl = new URL("/", request.url);
      errorUrl.searchParams.set("error", "service_unavailable");
      return NextResponse.redirect(errorUrl);
    }

    // Public routes can still work without database
    if (isPublicRoute) {
      return buildSecureResponse(request, nonce, isProduction);
    }

    // Default to blocking access with generic error message
    return new NextResponse(
      "Service temporarily unavailable. Please try again later.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }

  try {
    // Only attempt auth check if database is configured
    const { auth } = await import("@/lib/auth.ts");
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const isAuthenticated = !!session?.user;

    // If user is authenticated and trying to access auth routes, redirect to onboarding
    if (isAuthenticated && isAuthRoute) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return buildSecureResponse(request, nonce, isProduction);
  } catch (error) {
    console.error("Middleware auth check failed:", error);

    // If there's an error checking auth and it's a protected route, redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return buildSecureResponse(request, nonce, isProduction);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
