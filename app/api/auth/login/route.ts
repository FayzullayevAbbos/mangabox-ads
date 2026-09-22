import { jsonError, readJson, startSession } from "@/lib/server/portal-session";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(400, "So'rov formati noto'g'ri.");

  const phone = typeof body.phone === "string" ? body.phone : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!phone || !password) {
    return jsonError(400, "Telefon va parol majburiy.");
  }

  return startSession(phone, password);
}
