import { RateCardProvider } from "@/components/dashboard/ads/rate-card-context";
import { CampaignWizard } from "@/components/dashboard/ads/wizard/campaign-wizard";
import { readPick, readStep } from "@/components/dashboard/ads/wizard/wizard-links";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams(
    Object.entries(raw).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : [],
    ),
  );
  return (
    <RateCardProvider>
      <CampaignWizard
        initial={null}
        pick={readPick(params)}
        requestedStep={readStep(params)}
      />
    </RateCardProvider>
  );
}
