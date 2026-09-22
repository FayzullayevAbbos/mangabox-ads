import { handleExpiredSession } from "./session-expired";

export const PORTAL_BASE = "/api/backend/api/ads/portal";

export class PortalApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "PortalApiError";
  }
}

export async function throwPortalError(res: Response): Promise<never> {
  if (res.status === 401) void handleExpiredSession();
  let message = `Xatolik (${res.status})`;
  let field: string | undefined;
  try {
    const body = (await res.json()) as { message?: unknown; field?: unknown };
    if (typeof body?.message === "string") message = body.message;
    else if (Array.isArray(body?.message)) message = body.message.join(", ");
    if (typeof body?.field === "string") field = body.field;
  } catch {}
  throw new PortalApiError(res.status, message, field);
}

export async function portalRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${PORTAL_BASE}${path}`, {
    method,
    ...(body !== undefined
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
    cache: "no-store",
  });
  if (!res.ok) await throwPortalError(res);
  return (await res.json()) as T;
}
