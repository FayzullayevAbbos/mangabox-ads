/**
 * Dictionary registry.
 *
 * English is the source of truth for the dictionary *shape*. The `Dictionary`
 * type widens the English literals to their base types (string/number/…), so
 * every other locale must provide the same keys but may use different text.
 * A missing key in any locale is a compile-time error.
 */

import type { Locale } from "../config";
import { en } from "./en";
import { uz } from "./uz";
import { ru } from "./ru";

/** Widen literal types so locales can differ in text while sharing keys. */
type DeepWiden<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends ReadonlyArray<infer U>
        ? DeepWiden<U>[]
        : { -readonly [K in keyof T]: DeepWiden<T[K]> };

export type Dictionary = DeepWiden<typeof en>;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  uz,
  ru,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
