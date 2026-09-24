"use client";

import * as React from "react";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";

import {
  CampaignAmount,
  usePeriodText,
  slotsLabel,
} from "@/components/dashboard/ads/campaign-format";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import {
  MissingSlotCard,
  SLOT_BANNER_GRID,
  SlotBannerCard,
} from "@/components/dashboard/ads/slot-banner-card";
import { Button } from "@/components/ui/button";
import type { AdCampaign } from "@/lib/api/ads";
import { formatCount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

import { WizardSection } from "./wizard-section";
import {
  creativeReady,
  slotCreative,
  uncoveredSlots,
  type WizardStep,
} from "./wizard-model";

export function reviewChecks(campaign: AdCampaign) {
  return {
    place: campaign.slots.length > 0,
    creative: creativeReady(campaign),
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
  const { labelOf } = useRateCard();
  const checks = reviewChecks(campaign);
  const periodText = usePeriodText();
  const missing = uncoveredSlots(campaign);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHead title={r.summary} action={r.change} onAction={() => onGo("plan")} />
        <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <Cell label={t.form.name} className="sm:col-span-2 lg:col-span-4">
            <span className="text-[0.9375rem] font-medium break-words">{campaign.name}</span>
          </Cell>
          <Cell label={r.slots} className="sm:col-span-2 lg:col-span-1">
            <span className="text-sm">{slotsLabel(campaign, labelOf)}</span>
          </Cell>
          <Cell label={r.period}>
            <span className="text-sm">{periodText(campaign)}</span>
            <span className="block text-xs text-muted-foreground">
              {interpolate(t.sheet.overview.days, { days: campaign.days })}
            </span>
          </Cell>
          <Cell label={r.impressions}>
            <span className="font-mono text-[0.9375rem] tabular-nums">
              {formatCount(campaign.impressionsGoal)}
            </span>
          </Cell>
          <Cell label={r.total}>
            <span className="text-[0.9375rem]">
              <CampaignAmount campaign={campaign} />
              <span className="ms-1.5 text-xs text-muted-foreground">
                {t.rateCard.currency}
              </span>
            </span>
          </Cell>
        </dl>
      </section>

      <section className="space-y-3">
        <SectionHead title={r.ad} action={r.change} onAction={() => onGo("creative")} />
        <ul className={SLOT_BANNER_GRID}>
          {campaign.slots.map(({ slot }) => {
            // Joyning o'z banneri; eski kampaniyada umumiy (`slot: null`) card.
            const creative =
              slotCreative(campaign, slot) ??
              campaign.creatives.find((c) => c.slot === null);
            return (
              <li key={slot}>
                {creative ? (
                  <SlotBannerCard creative={creative} slot={slot} showStats={false} />
                ) : (
                  <MissingSlotCard
                    slot={slot}
                    label={interpolate(r.checks.creativeMissing, { slot: labelOf(slot) })}
                    action={
                      <Button type="button" size="sm" onClick={() => onGo("creative")}>
                        {r.change}
                      </Button>
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <WizardSection title={r.checklist}>
          <ul className="space-y-2.5">
            <Check ok={checks.place} label={r.checks.place} onFix={() => onGo("place")} />
            {missing.length === 0 ? (
              <Check ok label={r.checks.creative} onFix={() => onGo("creative")} />
            ) : (
              missing.map((slot) => (
                <Check
                  key={slot}
                  ok={false}
                  label={interpolate(r.checks.creativeMissing, { slot: labelOf(slot) })}
                  onFix={() => onGo("creative")}
                />
              ))
            )}
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
      </div>
    </div>
  );
}

function Cell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0 bg-card px-4 py-3", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
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
