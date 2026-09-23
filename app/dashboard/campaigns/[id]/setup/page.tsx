import { RateCardProvider } from "@/components/dashboard/ads/rate-card-context";
import { CampaignSetup } from "@/components/dashboard/ads/wizard/campaign-setup";
import { readStep } from "@/components/dashboard/ads/wizard/wizard-links";

export default async function CampaignSetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const [{ id }, { step }] = await Promise.all([params, searchParams]);
  return (
    <RateCardProvider>
      <CampaignSetup
        campaignId={id}
        requestedStep={readStep(new URLSearchParams({ step: step ?? "" }))}
      />
    </RateCardProvider>
  );
}
