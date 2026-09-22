/**
 * Admin sessiyasi (client tomoni).
 *
 * Kirish/chiqish Next route'lari orqali ketadi (`/api/auth/*`) — token o'sha
 * yerda `httpOnly` cookie'ga yoziladi. Qolgan so'rovlar `/api/backend/*`
 * proksisidan o'tadi.
 */

import { handleExpiredSession } from "./session-expired";

export interface AdminAccount {
  id: string;
  phone: string;
  name: string;
}

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = (await res.json().catch(() => null)) as
    | { data?: T; message?: string }
    | null;

  if (!res.ok) {
    // Login so'rovining o'zi 401 qaytarsa — bu shunchaki noto'g'ri parol.
    // Qolgan hollarda sessiya tugagan, foydalanuvchini kirishga qaytaramiz.
    if (res.status === 401 && url !== "/api/auth/login") {
      void handleExpiredSession();
    }
    throw new AuthError(res.status, body?.message ?? `Xatolik (${res.status})`);
  }
  return body?.data as T;
}

export function adminLogin(phone: string, password: string) {
  return request<AdminAccount>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
}

export function adminLogout() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

/** Joriy admin — `GET /api/admin/auth/me`. */
export function getAdminAccount() {
  return request<AdminAccount>("/api/backend/api/admin/auth/me");
}

/** Parolni almashtirish — `POST /api/admin/auth/change-password`. */
export function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
) {
  return request<{ ok: boolean }>(
    "/api/backend/api/admin/auth/change-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    },
  );
}
