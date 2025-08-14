import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected and public routes
const protectedRoutes = ["/onboarding", "/dashboard", "/profile", "/settings"]
const authRoutes = ["/login", "/signup"]
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
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API routes and static files to pass through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!process.env.DATABASE_URL) {
    // Without database, treat all routes as public for development
    return NextResponse.next()
  }

  try {
    // Only attempt auth check if database is configured
    const { auth } = await import("@/lib/auth")
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    const isAuthenticated = !!session?.user

    // If user is authenticated and trying to access auth routes, redirect to onboarding
    if (isAuthenticated && isAuthRoute) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && isProtectedRoute) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Allow the request to continue
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware auth check failed:", error)

    // If there's an error checking auth and it's a protected route, redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // For public routes, continue even if auth check fails
    return NextResponse.next()
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
}
