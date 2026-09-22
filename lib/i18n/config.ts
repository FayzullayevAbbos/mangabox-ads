/**
 * i18n configuration.
 *
 * The project starts with English only. Add a new locale by extending
 * `locales`, creating a matching dictionary folder under
 * `lib/i18n/dictionaries/<locale>/`, and registering it in
 * `lib/i18n/dictionaries.ts`.
 */

export const locales = ["en", "uz", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Human-readable names shown in the locale switcher (each in its own language). */
export const localeNames: Record<Locale, string> = {
  en: "English",
  uz: "O'zbekcha",
  ru: "Русский",
};

/** Cookie that persists the visitor's selected locale. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}
