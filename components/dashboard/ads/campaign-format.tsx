"use client";

import type { AdCampaign, AdSlot } from "@/lib/api/ads";
import { formatDate, formatSomAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "Bob oxiri 25% · Bosh sahifa karuseli 50%" */
export function slotsLabel(
  campaign: AdCampaign,
  labelOf: (slot: AdSlot | null) => string,
): string {
  if (campaign.slots.length === 0) return "—";
  return campaign.slots
    .map((line) => `${labelOf(line.slot)} ${line.sharePercent}%`)
    .join(" · ");
}

export function periodLabel(campaign: AdCampaign): string {
  return `${formatDate(campaign.startsAt)} → ${formatDate(campaign.endsAt)}`;
}

/** Chegirma bo'lsa oraliq summa chizilgan holda yonida turadi. */
export function CampaignAmount({
  campaign,
  className,
}: {
  campaign: AdCampaign;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {campaign.discountPercent > 0 && (
        <span className="mr-2 text-muted-foreground line-through">
          {formatSomAmount(campaign.subtotalSom)}
        </span>
      )}
      <span className="font-medium">{formatSomAmount(campaign.totalSom)}</span>
    </span>
  );
}
