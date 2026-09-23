"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  CampaignFormSheet,
  type CampaignDraft,
} from "@/components/dashboard/ads/campaign-form-sheet";
import { RateCardProvider } from "@/components/dashboard/ads/rate-card-context";
import { RateCardTab } from "@/components/dashboard/ads/rate-card-tab";
import { PageHeader } from "@/components/dashboard/page-header";
import { useT } from "@/lib/i18n/provider";

export default function RateCardPage() {
  const p = useT("portal");
  const router = useRouter();
  const [draft, setDraft] = React.useState<CampaignDraft | null>(null);

  return (
    <RateCardProvider>
      <div className="mx-auto w-full max-w-[1500px] space-y-8">
        <PageHeader title={p.rateCard.title} description={p.rateCard.description} />
        <RateCardTab onStart={setDraft} />
        <CampaignFormSheet
          target={draft ? "new" : null}
          draft={draft ?? undefined}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            router.push("/dashboard");
          }}
        />
      </div>
    </RateCardProvider>
  );
}
