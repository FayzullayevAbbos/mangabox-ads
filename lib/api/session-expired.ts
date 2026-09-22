/**
 * Sessiya tugaganda (backend 401 qaytarsa) foydalanuvchini login sahifasiga
 * qaytaramiz. Avval `/api/auth/logout` chaqiriladi — aks holda middleware
 * cookie'ni ko'rib login sahifasidan yana dashboardga uloqtiradi va tsikl
 * hosil bo'ladi.
 */

let redirecting = false;

export async function handleExpiredSession(): Promise<void> {
  if (typeof window === "undefined" || redirecting) return;
  redirecting = true;

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // tarmoq xatosi — baribir login sahifasiga o'tamiz.
  }
  window.location.assign("/auth/login");
}
