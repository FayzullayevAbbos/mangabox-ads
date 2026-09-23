"use client";

import * as React from "react";

import { getRateCard, type AdSlot, type AdSlotSpec } from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";

type RateCardValue = {
  specs: AdSlotSpec[];
  specOf: (slot: AdSlot | null) => AdSlotSpec | undefined;
  labelOf: (slot: AdSlot | null) => string;
};

const RateCardContext = React.createContext<RateCardValue | null>(null);

/**
 * Slot nomlari va rasm talablari narxnomadan keladi — hardcode qilinmaydi.
 * Katalog kamdan-kam o'zgaradi, shuning uchun sahifa ochilganda bir marta
 * yuklanadi va hamma tab shundan foydalanadi.
 */
export function RateCardProvider({ children }: { children: React.ReactNode }) {
  const [specs, setSpecs] = React.useState<AdSlotSpec[]>([]);
  const slotNames: Record<string, string> = useT("ads").slotNames;

  React.useEffect(() => {
    getRateCard()
      .then(setSpecs)
      .catch(() => setSpecs([]));
  }, []);

  const value = React.useMemo<RateCardValue>(() => {
    const bySlot = new Map(specs.map((s) => [s.id, s]));
    return {
      specs,
      specOf: (slot) => (slot ? bySlot.get(slot) : undefined),
      // Katalog hali yuklanmagan bo'lsa slot id'si ko'rinadi — bo'sh joy emas.
      labelOf: (slot) =>
        slot ? (slotNames[slot] ?? bySlot.get(slot)?.label ?? slot) : "—",
    };
  }, [specs, slotNames]);

  return (
    <RateCardContext.Provider value={value}>
      {children}
    </RateCardContext.Provider>
  );
}

export function useRateCard(): RateCardValue {
  const ctx = React.useContext(RateCardContext);
  if (!ctx) throw new Error("useRateCard must be used within RateCardProvider");
  return ctx;
}
