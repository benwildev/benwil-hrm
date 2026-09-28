import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/employees",
  "/attendance",
  "/tasks",
  "/leave",
  "/payroll",
  "/chat",
  "/reports",
  "/settings",
]

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookieRaw = request.cookies.get("benwil_auth_session")?.value

  let isAuthenticated = false
  let setupCompleted = false
  let mustChangePassword = false

  if (authCookieRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookieRaw))
      isAuthenticated = Boolean(parsed.token)
      setupCompleted = Boolean(parsed.setupCompleted)
      mustChangePassword = Boolean(parsed.mustChangePassword)
    } catch {
      // In case cookie was a plain string token
      isAuthenticated = Boolean(authCookieRaw)
      setupCompleted = true
      mustChangePassword = false
    }
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // 1. Mandatory password change flow:
  if (pathname === "/change-password") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (!mustChangePassword) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // 2. Authenticated user who MUST change password trying to access anything else
  if (isAuthenticated && mustChangePassword) {
    return NextResponse.redirect(new URL("/change-password", request.url))
  }

  // 3. Unauthenticated trying to access protected routes or /setup -> redirect to /login
  if ((isProtected || pathname === "/setup") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Authenticated user who hasn't completed setup trying to access protected app routes -> redirect to /setup
  if (isAuthenticated && !setupCompleted && isProtected && pathname !== "/setup") {
    return NextResponse.redirect(new URL("/setup", request.url))
  }

  // 5. Authenticated user visiting /login, /forgot-password, /reset-password -> redirect
  if (isAuthRoute && isAuthenticated) {
    const target = setupCompleted ? "/dashboard" : "/setup"
    return NextResponse.redirect(new URL(target, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - iclock (biometric device push-protocol endpoints, called by hardware — no session cookie)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!api|iclock|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
