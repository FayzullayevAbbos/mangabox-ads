import type { Advertiser } from "./ads";
import { PORTAL_BASE, portalRequest } from "./portal";
import { handleExpiredSession } from "./session-expired";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const PUBLIC_ROUTES = ["/api/auth/login", "/api/auth/register"];

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = (await res.json().catch(() => null)) as
    | { data?: T; message?: unknown }
    | null;

  if (!res.ok) {
    if (res.status === 401 && !PUBLIC_ROUTES.includes(url)) {
      void handleExpiredSession();
    }
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : typeof body?.message === "string"
        ? body.message
        : `Xatolik (${res.status})`;
    throw new AuthError(res.status, message);
  }
  return body?.data as T;
}

function postJson(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export interface RegisterPayload {
  phone: string;
  password: string;
  name: string;
  legalName?: string;
  inn?: string;
  email?: string;
}

export interface ProfilePayload {
  name?: string;
  legalName?: string;
  inn?: string;
  email?: string;
}

export const MIN_PASSWORD_LENGTH = 8;

export function portalLogin(phone: string, password: string) {
  return request<Advertiser>("/api/auth/login", postJson({ phone, password }));
}

export function portalRegister(payload: RegisterPayload) {
  return request<Advertiser>("/api/auth/register", postJson(payload));
}

export function portalLogout() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function getAdvertiser() {
  return request<Advertiser | null>(`${PORTAL_BASE}/auth/me`);
}

export async function updateProfile(payload: ProfilePayload) {
  const { data } = await portalRequest<{ data: Advertiser }>(
    "/auth/me",
    "PATCH",
    payload,
  );
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const { data } = await portalRequest<{ data: { ok: boolean } }>(
    "/auth/change-password",
    "POST",
    { currentPassword, newPassword },
  );
  return data;
}
