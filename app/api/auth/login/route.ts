import { cookies } from "next/headers";

import { ADMIN_TOKEN_COOKIE } from "@/lib/auth-cookie";

/**
 * Admin kirishi. Brauzer parolni shu route'ga yuboradi, u esa backendning
 * `POST /api/admin/auth/login` endpointiga murojaat qiladi va qaytgan tokenni
 * `httpOnly` cookie'ga yozadi — token hech qachon client JS'ga tushmaydi.
 */

const API_URL = (
  process.env.MANGABOX_API_URL ?? "http://localhost:3111"
).replace(/\/$/, "");

interface LoginResponse {
  data?: {
    token: string;
    expiresAt: string;
    admin: { id: string; phone: string; name: string };
  };
  message?: string;
}

export async function POST(request: Request) {
  let body: { phone?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ message: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? body.phone : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!phone || !password) {
    return Response.json(
      { message: "Telefon va parol majburiy." },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { message: "Backendga ulanib bo'lmadi." },
      { status: 502 },
    );
  }

  const payload = (await upstream.json().catch(() => null)) as LoginResponse | null;

  if (!upstream.ok || !payload?.data) {
    return Response.json(
      { message: payload?.message ?? "Kirib bo'lmadi." },
      { status: upstream.status === 200 ? 502 : upstream.status },
    );
  }

  const { token, expiresAt, admin } = payload.data;
  const expires = new Date(expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Token muddati backendda belgilanadi — cookie ham o'sha paytda tugaydi.
    expires: Number.isNaN(expires.getTime()) ? undefined : expires,
  });

  return Response.json({ data: admin });
}
