"use client";

import { RateCardProvider } from "@/components/dashboard/ads/rate-card-context";
import { RateCardTab } from "@/components/dashboard/ads/rate-card-tab";
import { PageHeader } from "@/components/dashboard/page-header";
import { useT } from "@/lib/i18n/provider";

export default function RateCardPage() {
  const p = useT("portal");
  return (
    <RateCardProvider>
      <div className="mx-auto w-full max-w-[1500px] space-y-8">
        <PageHeader title={p.rateCard.title} description={p.rateCard.description} />
        <RateCardTab />
      </div>
    </RateCardProvider>
  );
}
