import { cookies } from "next/headers";

import { PORTAL_TOKEN_COOKIE } from "@/lib/auth-cookie";

/** Chiqish — sessiya cookie'sini o'chiradi. Backendda token bekor qilinmaydi. */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(PORTAL_TOKEN_COOKIE);
  return Response.json({ data: { ok: true } });
}
