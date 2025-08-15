import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { generateCSPHeader } from "@/lib/security/input-validation"

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

  // SECURITY: Database is REQUIRED for authentication - no exceptions
  if (!process.env.DATABASE_URL) {
    console.error('🚨 SECURITY ERROR: DATABASE_URL is required for authentication')
    console.error('🚨 Configure your database to use this application')
    
    // For protected routes, always redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("error", "service_unavailable")
      return NextResponse.redirect(loginUrl)
    }
    
    // For auth routes, show generic error
    if (isAuthRoute) {
      const errorUrl = new URL("/", request.url)
      errorUrl.searchParams.set("error", "service_unavailable")
      return NextResponse.redirect(errorUrl)
    }
    
    // Public routes can still work without database
    if (isPublicRoute) {
      const response = NextResponse.next()
      
      // SECURITY: Add security headers even when database not configured
      response.headers.set('Content-Security-Policy', generateCSPHeader())
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), location=()')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      
      if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
      }
      
      return response
    }
    
    // Default to blocking access with generic error message
    return new NextResponse(
      'Service temporarily unavailable. Please try again later.',
      { 
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      }
    )
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

    // Allow the request to continue with security headers
    const response = NextResponse.next()
    
    // SECURITY: Add comprehensive security headers
    response.headers.set('Content-Security-Policy', generateCSPHeader())
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), location=()')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // HSTS header for production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }
    
    return response
  } catch (error) {
    console.error("Middleware auth check failed:", error)

    // If there's an error checking auth and it's a protected route, redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // For public routes, continue even if auth check fails - but still add security headers
    const response = NextResponse.next()
    
    // SECURITY: Add security headers even for public routes
    response.headers.set('Content-Security-Policy', generateCSPHeader())
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), location=()')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }
    
    return response
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
