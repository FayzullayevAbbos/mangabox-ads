/**
 * Admin sessiyasi. Backend (`bot-mangabox`) Bearer token bilan ishlaydi —
 * token brauzer JS'iga tushmasligi uchun `httpOnly` cookie'da saqlanadi va
 * faqat server tomonida (proksi, login/logout route'lari, middleware)
 * o'qiladi.
 */
export const ADMIN_TOKEN_COOKIE = "mangabox_admin_token";
