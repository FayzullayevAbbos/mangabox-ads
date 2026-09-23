"use client";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import type { AdCampaign } from "@/lib/api/ads";
import { formatCount, formatDateTime, formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function CampaignOverview({ campaign }: { campaign: AdCampaign }) {
  const t = useT("ads");
  const p = useT("portal");
  const o = t.sheet.overview;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        <Panel title={p.campaignPage.parameters}>
          <dl className="divide-y divide-border">
            <Row label={o.goal} value={formatCount(campaign.impressionsGoal)} mono />
            <Row label={o.dailyCap} value={formatCount(campaign.dailyCap)} mono />
            <Row
              label={o.frequencyCap}
              value={formatCount(campaign.frequencyCap)}
              mono
            />
            <Row
              label={o.paidAt}
              value={campaign.paidAt ? formatDateTime(campaign.paidAt) : o.notPaid}
            />
            {campaign.finishReason && (
              <Row
                label={o.finishReason}
                value={t.finishReason[campaign.finishReason]}
              />
            )}
          </dl>
        </Panel>

        <SlotsPanel campaign={campaign} />
      </div>

      <PricePanel campaign={campaign} />
    </div>
  );
}

function SlotsPanel({ campaign }: { campaign: AdCampaign }) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const o = t.sheet.overview;

  return (
    <Panel title={o.slots}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">{o.slots}</th>
              <th className="px-3 py-2.5 text-right font-medium">{o.share}</th>
              <th className="px-3 py-2.5 text-right font-medium">
                {o.impressions}
              </th>
              <th className="px-5 py-2.5 text-right font-medium">{o.price}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaign.slots.map((line) => (
              <tr key={line.slot}>
                <td className="px-5 py-3 font-medium">{labelOf(line.slot)}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">
                  {line.sharePercent}%
                </td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">
                  {formatCount(line.impressions)}
                </td>
                <td className="px-5 py-3 text-right font-mono font-medium tabular-nums">
                  {formatSomAmount(line.priceSom)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function PricePanel({ campaign }: { campaign: AdCampaign }) {
  const t = useT("ads");
  const p = useT("portal");
  const o = t.sheet.overview;

  return (
    <Panel title={p.campaignPage.pricing} className="lg:sticky lg:top-6">
      <dl className="space-y-3 px-5 py-4 text-[0.9375rem]">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">{o.subtotal}</dt>
          <dd className="font-mono tabular-nums">
            {formatSomAmount(campaign.subtotalSom)}
          </dd>
        </div>
        {campaign.discountPercent > 0 && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">
              {o.discount} {campaign.discountPercent}%
            </dt>
            <dd className="font-mono text-success tabular-nums">
              −{formatSomAmount(campaign.subtotalSom - campaign.totalSom)}
            </dd>
          </div>
        )}
      </dl>
      <div className="flex items-baseline justify-between gap-4 border-t border-border px-5 py-4">
        <span className="font-medium">{o.total}</span>
        <span className="font-mono text-xl font-semibold tabular-nums">
          {formatSomAmount(campaign.totalSom)}
        </span>
      </div>
    </Panel>
  );
}

function Panel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
    >
      <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3 text-[0.9375rem]">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", mono && "font-mono tabular-nums")}>
        {value}
      </dd>
    </div>
  );
}
