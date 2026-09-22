"use client";

import { createContext, useContext, useMemo } from "react";

import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an <I18nProvider>");
  }
  return ctx;
}

/** Current active locale (client components). */
export function useLocale(): Locale {
  return useI18n().locale;
}

/** Full dictionary (client components). */
export function useDictionary(): Dictionary {
  return useI18n().dict;
}

/**
 * Namespaced translation accessor for client components.
 *
 * @example
 * const t = useT("auth");
 * t.login.title; // "Sign in"
 */
export function useT<NS extends keyof Dictionary>(namespace: NS): Dictionary[NS] {
  return useI18n().dict[namespace];
}
