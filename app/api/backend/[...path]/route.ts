import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { ADMIN_TOKEN_COOKIE } from "@/lib/auth-cookie";

/**
 * `bot-mangabox` backendiga server tomonidagi proksi.
 *
 * Admin API (`/api/admin/*`) `Authorization: Bearer <token>` talab qiladi
 * (`AdminPanelGuard`). Token brauzerga tushmasligi uchun u `httpOnly`
 * cookie'da saqlanadi (login paytida yoziladi) va faqat shu yerda — serverda —
 * so'rovga qo'shiladi. Lokal ishlash uchun `MANGABOX_ADMIN_TOKEN` muhit
 * o'zgaruvchisi ham qabul qilinadi.
 *
 * Proksi ataylab faqat `api/admin/*` yo'llariga ruxsat beradi: aks holda
 * admin tokeni bilan backendning istalgan endpointiga so'rov yuborish
 * mumkin bo'lib qolardi.
 */

const API_URL = (
  process.env.MANGABOX_API_URL ?? "http://localhost:3111"
).replace(/\/$/, "");

const ALLOWED_PREFIX = "api/admin/";

function jsonError(status: number, message: string): Response {
  return Response.json({ message }, { status });
}

async function forward(
  request: NextRequest,
  path: string[],
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
): Promise<Response> {
  const target = path.join("/");
  if (!target.startsWith(ALLOWED_PREFIX)) {
    return jsonError(404, "Not found");
  }

  const cookieStore = await cookies();
  const token =
    cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ??
    process.env.MANGABOX_ADMIN_TOKEN;

  if (!token) {
    return jsonError(401, "Admin tokeni yo'q — qaytadan kiring.");
  }

  // Bayt sifatida o'qiladi va Content-Type asliday uzatiladi — JSON bilan
  // birga multipart yuklashlar (banner rasmi) ham buzilmay o'tishi uchun.
  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
  const body = hasBody ? await request.arrayBuffer() : undefined;
  const contentType = request.headers.get("content-type");

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/${target}${request.nextUrl.search}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(hasBody && contentType ? { "Content-Type": contentType } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return jsonError(502, "Backendga ulanib bo'lmadi.");
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/backend/[...path]">,
) {
  const { path } = await ctx.params;
  return forward(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/backend/[...path]">,
) {
  const { path } = await ctx.params;
  return forward(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/backend/[...path]">,
) {
  const { path } = await ctx.params;
  return forward(request, path, "PUT");
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/backend/[...path]">,
) {
  const { path } = await ctx.params;
  return forward(request, path, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/backend/[...path]">,
) {
  const { path } = await ctx.params;
  return forward(request, path, "DELETE");
}
