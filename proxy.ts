import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

function isSessionCookiePresent(req: NextRequest) {
  return Boolean(
    req.cookies.get("authjs.session-token") ??
      req.cookies.get("__Secure-authjs.session-token"),
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow biometrics push endpoints through to /api/iclock without authentication
  if (pathname.startsWith("/iclock")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (!isSessionCookiePresent(req)) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
