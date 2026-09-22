import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_TOKEN_COOKIE } from "@/lib/auth-cookie";

/**
 * Route himoyasi. Admin tokeni `httpOnly` cookie'da (`/api/auth/login`
 * yozadi) — middleware serverda ishlagani uchun uni to'g'ridan-to'g'ri o'qiy
 * oladi. Tokenning haqiqiyligini backend hal qiladi: muddati o'tgan bo'lsa
 * proksi 401 qaytaradi va client login sahifasiga yo'naltiradi.
 *
 * Himoyalanadigan sahifalar: /dashboard/*.
 * /auth/login: sessiyasi bor user bu yerga kirsa dashboard'ga yo'naltiriladi.
 */

const LOGIN_PATH = "/auth/login";
const DASHBOARD_PATH = "/dashboard";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(ADMIN_TOKEN_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname === LOGIN_PATH) {
    if (hasSession) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (hasSession) return NextResponse.next();

  return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/auth/login"],
};
