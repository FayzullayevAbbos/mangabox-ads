import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { PORTAL_TOKEN_COOKIE } from "@/lib/auth-cookie";

const API_URL = (
  process.env.MANGABOX_API_URL ?? "http://localhost:3111"
).replace(/\/$/, "");

const ALLOWED_PREFIX = "api/ads/portal/";

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
  const token = cookieStore.get(PORTAL_TOKEN_COOKIE)?.value;

  if (!token) {
    return jsonError(401, "Sessiya topilmadi — qaytadan kiring.");
  }

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
