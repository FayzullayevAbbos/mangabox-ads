"use client";

import { RiCheckLine, RiCloseLine } from "@remixicon/react";

import {
  CampaignAmount,
  periodRange,
  slotsLabel,
} from "@/components/dashboard/ads/campaign-format";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { Button } from "@/components/ui/button";
import type { AdCampaign } from "@/lib/api/ads";
import { formatCount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

import { AdPreview, type PosterPreview } from "./ad-preview";
import { WizardSection } from "./wizard-section";
import {
  creativeFromCampaign,
  creativeReady,
  mainCard,
  startDayOk,
  type WizardStep,
} from "./wizard-model";

export function reviewChecks(campaign: AdCampaign) {
  return {
    place: campaign.slots.length > 0,
    creative: creativeReady(campaign),
    date: startDayOk(campaign),
  };
}

export function ReviewStep({
  campaign,
  onGo,
}: {
  campaign: AdCampaign;
  onGo: (step: WizardStep) => void;
}) {
  const t = useT("ads");
  const w = useT("portal").wizard;
  const r = w.review;
  const { specOf, labelOf } = useRateCard();
  const checks = reviewChecks(campaign);

  const posters: PosterPreview[] = campaign.creatives.flatMap((creative) => {
    const ratio = specOf(creative.slot)?.image?.ratio;
    return creative.type === "image" && creative.slot && creative.imageUrl && ratio
      ? [{ slot: creative.slot, src: creative.imageUrl, ratio }]
      : [];
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:gap-8">
      <div className="space-y-6">
        <WizardSection>
          <SectionHead title={r.summary} action={r.change} onAction={() => onGo("plan")} />
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Item label={t.form.name} value={campaign.name} />
            <Item label={r.slots} value={slotsLabel(campaign, labelOf)} />
            <Item
              label={r.period}
              value={`${periodRange(campaign)} · ${interpolate(t.sheet.overview.days, { days: campaign.days })}`}
            />
            <Item label={r.impressions} value={formatCount(campaign.impressionsGoal)} mono />
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">{r.total}</dt>
              <dd className="mt-1 text-xl">
                <CampaignAmount campaign={campaign} />
                <span className="ms-1.5 text-sm text-muted-foreground">
                  {t.rateCard.currency}
                </span>
              </dd>
            </div>
          </dl>
        </WizardSection>

        <WizardSection>
          <SectionHead title={r.ad} action={r.change} onAction={() => onGo("creative")} />
          <div className="max-w-sm">
            <AdPreview
              draft={creativeFromCampaign(campaign)}
              logoSrc={mainCard(campaign)?.logoUrl ?? null}
              posters={posters}
            />
          </div>
        </WizardSection>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6">
        <WizardSection title={r.checklist}>
          <ul className="space-y-2.5">
            <Check ok={checks.place} label={r.checks.place} onFix={() => onGo("place")} />
            <Check ok={checks.creative} label={r.checks.creative} onFix={() => onGo("creative")} />
            <Check ok={checks.date} label={r.checks.date} onFix={() => onGo("plan")} />
          </ul>
        </WizardSection>

        <WizardSection title={r.next}>
          <ol className="space-y-3">
            {r.nextSteps.map((text, index) => (
              <li key={text} className="flex gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[0.6875rem] font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
        </WizardSection>
      </aside>
    </div>
  );
}

function SectionHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
      <Button type="button" size="sm" variant="ghost" onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 text-[0.9375rem] break-words", mono && "font-mono tabular-nums")}>
        {value}
      </dd>
    </div>
  );
}

function Check({ ok, label, onFix }: { ok: boolean; label: string; onFix: () => void }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
          ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
        )}
      >
        {ok ? <RiCheckLine className="size-3" /> : <RiCloseLine className="size-3" />}
      </span>
      {ok ? (
        <span>{label}</span>
      ) : (
        <button
          type="button"
          onClick={onFix}
          className="text-left text-destructive underline-offset-4 hover:underline"
        >
          {label}
        </button>
      )}
    </li>
  );
}
