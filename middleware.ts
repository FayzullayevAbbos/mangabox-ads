import { NextResponse, type NextRequest } from "next/server";

import { PORTAL_TOKEN_COOKIE } from "@/lib/auth-cookie";

const AUTH_PATHS = ["/auth/login", "/auth/register"];
const DASHBOARD_PATH = "/dashboard";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(PORTAL_TOKEN_COOKIE);
  const { pathname } = request.nextUrl;

  if (AUTH_PATHS.includes(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (hasSession) return NextResponse.next();

  return NextResponse.redirect(new URL(AUTH_PATHS[0], request.url));
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/auth/login", "/auth/register"],
};
