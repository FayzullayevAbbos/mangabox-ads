import {
  callPortal,
  jsonError,
  readJson,
  startSession,
} from "@/lib/server/portal-session";

const FIELDS = ["phone", "password", "name", "legalName", "inn", "email"] as const;

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(400, "So'rov formati noto'g'ri.");

  const payload: Record<string, string> = {};
  for (const key of FIELDS) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) payload[key] = value.trim();
  }
  if (!payload.phone || !payload.password || !payload.name) {
    return jsonError(400, "Telefon, parol va nom majburiy.");
  }
  payload.password = body.password as string;

  const registered = await callPortal("register", payload);
  if (!registered.ok) return registered.response;

  return startSession(payload.phone, payload.password);
}
