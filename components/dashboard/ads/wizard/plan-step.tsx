"use client";

import { RiArrowDownSLine, RiTimeLine } from "@remixicon/react";

import { NumberField, QuoteSummary } from "@/components/dashboard/ads/quote-parts";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { SlotPreview } from "@/components/dashboard/ads/slot-preview";
import type { QuoteState } from "@/components/dashboard/ads/use-quote";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CAMPAIGN_NAME_LIMIT,
  MAX_CAMPAIGN_DAYS,
  MAX_SHARE_PERCENT,
  MIN_CAMPAIGN_DAYS,
  MIN_SHARE_PERCENT,
  type AdSlot,
} from "@/lib/api/ads";
import { formatCount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";

import { WizardSection } from "./wizard-section";
import type { PlanDraft, PlanErrors } from "./wizard-model";

export function PlanStep({
  plan,
  suggestedName,
  quote,
  errors,
  onChange,
}: {
  plan: PlanDraft;
  suggestedName: string;
  quote: QuoteState;
  errors: PlanErrors;
  onChange: (plan: PlanDraft) => void;
}) {
  const t = useT("ads");
  const w = useT("portal").wizard;
  const c = t.rateCard.calculator;
  const { specOf, labelOf } = useRateCard();

  const set = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) =>
    onChange({ ...plan, [key]: value });

  const setShare = (slot: AdSlot, sharePercent: number) =>
    set(
      "lines",
      plan.lines.map((line) =>
        line.slot === slot ? { ...line, sharePercent } : line,
      ),
    );

  const shareHint = (slot: AdSlot, share: number) => {
    const spec = specOf(slot);
    if (!spec) return undefined;
    return interpolate(c.shareHint, {
      share,
      count: formatCount(Math.round((spec.dailyImpressions * share) / 100)),
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:gap-8">
      <div className="space-y-6">
        <WizardSection>
          {errors.slots && (
            <p data-field-error className="text-sm text-destructive">
              {errors.slots}
            </p>
          )}
          <div className="space-y-4">
            {plan.lines.map((line) => (
              <div key={line.slot} className="flex gap-4">
                <SlotPreview slot={line.slot} active className="w-12 shrink-0 self-start" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-heading text-[0.9375rem] font-semibold">
                    {labelOf(line.slot)}
                  </p>
                  <NumberField
                    label={c.share}
                    value={line.sharePercent}
                    min={MIN_SHARE_PERCENT}
                    max={MAX_SHARE_PERCENT}
                    suffix="%"
                    hint={shareHint(line.slot, line.sharePercent)}
                    onChange={(v) => setShare(line.slot, v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </WizardSection>

        <WizardSection>
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              label={t.form.days}
              value={plan.days}
              min={MIN_CAMPAIGN_DAYS}
              max={MAX_CAMPAIGN_DAYS}
              error={errors.days}
              onChange={(v) => set("days", v)}
              minLabel={interpolate(c.daysUnit, { days: MIN_CAMPAIGN_DAYS })}
              maxLabel={interpolate(c.daysUnit, { days: MAX_CAMPAIGN_DAYS })}
            />
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 px-4 py-3 text-sm">
              <RiTimeLine className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{w.plan.startLaterTitle}</p>
                <p className="mt-0.5 text-muted-foreground">{w.plan.startLaterText}</p>
              </div>
            </div>
          </div>
        </WizardSection>

        <WizardSection>
          <div className="space-y-2">
            <Label htmlFor="wizard-name">{t.form.name}</Label>
            <Input
              id="wizard-name"
              maxLength={CAMPAIGN_NAME_LIMIT}
              placeholder={suggestedName}
              className="h-10 text-[0.9375rem] md:text-[0.9375rem]"
              value={plan.name}
              aria-invalid={errors.name ? true : undefined}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name ? (
              <p data-field-error className="text-xs text-destructive">
                {errors.name}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {interpolate(w.plan.nameHint, { name: suggestedName })}
              </p>
            )}
          </div>
        </WizardSection>

        <details className="group rounded-xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium sm:px-6 [&::-webkit-details-marker]:hidden">
            {w.plan.advanced}
            <RiArrowDownSLine className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border px-5 py-5 sm:px-6">
            <NumberField
              label={t.form.frequencyCap}
              value={plan.frequencyCap}
              min={1}
              max={10}
              onChange={(v) => set("frequencyCap", v)}
              hint={t.form.frequencyCapHint}
            />
          </div>
        </details>
      </div>

      <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6">
        <p className="text-sm font-medium">{t.form.quoteTitle}</p>
        <div className="mt-4">
          <QuoteSummary quote={quote.quote} loading={quote.loading} />
        </div>
        {quote.belowMinimum && (
          <p className="mt-3 text-xs text-destructive">
            {t.form.minOrder} {c.minOrderFix}
          </p>
        )}
      </aside>
    </div>
  );
}
