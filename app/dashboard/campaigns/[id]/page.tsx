import { Suspense } from "react";

import { CampaignDetail } from "@/components/dashboard/ads/campaign-detail";
import { RateCardProvider } from "@/components/dashboard/ads/rate-card-context";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RateCardProvider>
      <Suspense>
        <CampaignDetail campaignId={id} />
      </Suspense>
    </RateCardProvider>
  );
}
