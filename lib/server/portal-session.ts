import { cookies } from "next/headers";

import { PORTAL_TOKEN_COOKIE } from "@/lib/auth-cookie";

export const API_URL = (
  process.env.MANGABOX_API_URL ?? "http://localhost:3111"
).replace(/\/$/, "");

interface LoginData {
  token: string;
  expiresAt: string;
  advertiser: unknown;
}

type Envelope<T> = { data?: T; message?: unknown } | null;

function errorMessage(body: Envelope<unknown>, fallback: string): string {
  if (typeof body?.message === "string") return body.message;
  if (Array.isArray(body?.message)) return body.message.join(", ");
  return fallback;
}

export function jsonError(status: number, message: string): Response {
  return Response.json({ message }, { status });
}

export async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function callPortal<T>(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/ads/portal/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, response: jsonError(502, "Backendga ulanib bo'lmadi.") };
  }

  const payload = (await upstream.json().catch(() => null)) as Envelope<T>;
  if (!upstream.ok || !payload?.data) {
    return {
      ok: false,
      response: jsonError(
        upstream.status === 200 || upstream.status === 201 ? 502 : upstream.status,
        errorMessage(payload, "So'rov bajarilmadi."),
      ),
    };
  }
  return { ok: true, data: payload.data };
}

export async function startSession(phone: string, password: string) {
  const result = await callPortal<LoginData>("login", { phone, password });
  if (!result.ok) return result.response;

  const { token, expiresAt, advertiser } = result.data;
  const expires = new Date(expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(PORTAL_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: Number.isNaN(expires.getTime()) ? undefined : expires,
  });
  return Response.json({ data: advertiser });
}
