"use client";

import * as React from "react";

/**
 * localStorage bilan sinxronlangan state. `useSyncExternalStore` orqali
 * server (getServerSnapshot) va mijoz qiymatlari to'g'ri ajratiladi, shu
 * bois hydration mismatch va effekt ichida setState chaqirilmaydi.
 * Boshqa tablar/oynalardagi o'zgarishlarga ham `storage` hodisasi orqali
 * obuna bo'ladi.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) onChange();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key],
  );

  const getSnapshot = React.useCallback((): T => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {
      // o'qib bo'lmadi — initialValue qoladi.
    }
    return initialValue;
  }, [key, initialValue]);

  const value = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialValue,
  );

  const set = React.useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        // Bir oynaning o'zida obunachilarga xabar berish uchun.
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        // yozib bo'lmadi — jim o'tamiz.
      }
    },
    [key],
  );

  return [value, set];
}
