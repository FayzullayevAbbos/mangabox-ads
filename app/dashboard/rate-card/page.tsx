"use client";

import { useRouter } from "next/navigation";

import { RateCardProvider } from "@/components/dashboard/ads/rate-card-context";
import { RateCardTab } from "@/components/dashboard/ads/rate-card-tab";
import { newCampaignHref } from "@/components/dashboard/ads/wizard/wizard-links";
import { PageHeader } from "@/components/dashboard/page-header";
import { useT } from "@/lib/i18n/provider";

export default function RateCardPage() {
  const p = useT("portal");
  const router = useRouter();

  return (
    <RateCardProvider>
      <div className="mx-auto w-full max-w-[1500px] space-y-8">
        <PageHeader title={p.rateCard.title} description={p.rateCard.description} />
        <RateCardTab onStart={(pick) => router.push(newCampaignHref(pick))} />
      </div>
    </RateCardProvider>
  );
}
