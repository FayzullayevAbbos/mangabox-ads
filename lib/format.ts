/**
 * Pul formatlash yordamchilari.
 * Backend summalarni tiyinda qaytaradi (1 so'm = 100 tiyin).
 */

/** Tiyin → so'm (raqam sifatida). */
export function tiyinToSom(tiyin: number): number {
  return tiyin / 100;
}

/**
 * Tiyin summasini probel bilan ajratilgan so'mga aylantiradi.
 * Masalan: 450000000 → "4 500 000"
 */
export function formatSom(tiyin: number): string {
  const som = Math.round(tiyinToSom(tiyin));
  return new Intl.NumberFormat("ru-RU").format(som).replace(/\u00A0/g, " ");
}

/**
 * Valyuta belgisi bilan to'liq summa.
 * Masalan: 450000000 → "UZS 4 500 000"
 */
export function formatMoney(tiyin: number, currency = "UZS"): string {
  return `${currency} ${formatSom(tiyin)}`;
}

/** Qisqartirilgan summa: 1 200 000 → "1.2M", 4 500 → "4.5K". */
export function formatCompactSom(tiyin: number): string {
  const som = tiyinToSom(tiyin);
  if (som >= 1_000_000) return `${(som / 1_000_000).toFixed(som % 1_000_000 === 0 ? 0 : 1)}M`;
  if (som >= 1_000) return `${(som / 1_000).toFixed(som % 1_000 === 0 ? 0 : 1)}K`;
  return String(Math.round(som));
}

/**
 * Analitika API summalari (pro obuna, homiylik) **so'mda** keladi — tiyinda
 * emas. Shuning uchun ular uchun alohida formatlagich: 45000 → "45 000".
 */
export function formatSomAmount(som: number): string {
  return new Intl.NumberFormat("ru-RU")
    .format(Math.round(som))
    .replace(/\u00A0/g, " ");
}

/** Oddiy son: 12345 → "12 345". */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("ru-RU")
    .format(value)
    .replace(/\u00A0/g, " ");
}

const MONTHS_UZ = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
  "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
];

/** Sana → "12 Iyn, 14:32" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]}, ${time}`;
}

/** Kun kaliti ("2026-07-23") → "23 Iyl". Analitika grafiklari uchun. */
export function formatDayShort(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]}`;
}

/** Sana → "12 Iyn 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`;
}

/** Oy kaliti yorlig'i: "Iyn" yoki "Iyn 25" (yil farqlansa). */
export function monthLabel(year: number, monthIndex: number, currentYear: number): string {
  const base = MONTHS_UZ[monthIndex];
  return year === currentYear ? base : `${base} ${String(year).slice(2)}`;
}

/**
 * `Date` → `YYYY-MM-DD` (mahalliy kalendar kuni). `toISOString()` ataylab
 * ishlatilmaydi — u UTC'ga o'tkazib kunni bir kun orqaga surib yuboradi.
 */
export function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Bugungi kun kaliti. */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Kun kaliti ("2026-07-23") → "23 Iyl 2026". Sana ustunlari uchun. */
export function formatDayKey(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`;
}
