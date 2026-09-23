"use client";

import type { PaymentProvider } from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";

export const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  payme: "Payme",
  click: "Click",
  uzum: "Uzum Bank",
  paynet: "Paynet",
};

export function useProviderLabel() {
  const p = useT("portal");
  return (provider: string) =>
    provider === "card"
      ? p.pay.cardProvider
      : (PROVIDER_LABELS[provider as PaymentProvider] ?? provider);
}
