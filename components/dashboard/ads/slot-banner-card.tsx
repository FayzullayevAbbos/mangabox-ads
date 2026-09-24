"use client";

import * as React from "react";
import { RiExternalLinkLine } from "@remixicon/react";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { SlotPreview } from "@/components/dashboard/ads/slot-preview";
import { SitePreview } from "@/components/dashboard/ads/wizard/site-preview";
import { toDraft } from "@/components/dashboard/ads/wizard/wizard-model";
import type { AdCreative, AdSlot } from "@/lib/api/ads";
import { formatCount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Bir nechta joyning bannerlari bir xil to'rda — tab va tekshiruvda. */
export const SLOT_BANNER_GRID = "grid gap-3 sm:grid-cols-2 xl:grid-cols-4";

/**
 * Bitta joyning banneri: sarlavhada joy va holati, o'rtada saytdagi
 * (telefon) ko'rinishi, pastda ko'rsatish/klik va havola.
 */
export function SlotBannerCard({
  creative,
  slot: fallbackSlot,
  control,
  actions,
  showStats = true,
}: {
  creative: AdCreative;
  /** Eski umumiy (`slot: null`) card qaysi joy sifatida chizilsin. */
  slot?: AdSlot | null;
  /** Sarlavhaning o'ng tomoni (masalan "Efirda" switch). */
  control?: React.ReactNode;
  /** Pastki tugmalar. */
  actions?: React.ReactNode;
  showStats?: boolean;
}) {
  const t = useT("ads");
  const m = useT("portal").moderation;
  const { labelOf } = useRateCard();
  const c = t.sheet.creatives;

  const slot = creative.slot ?? fallbackSlot ?? null;
  const state = creative.blockedByAdmin ? "blocked" : creative.active ? "on" : "off";

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border bg-card",
        state === "blocked" ? "border-destructive/40" : "border-border",
      )}
    >
      {/* Joy — kartaning asosiy sarlavhasi: banner qayerda chiqishi. */}
      <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
        {slot && <SlotPreview slot={slot} active={state === "on"} className="w-6 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {creative.slot ? labelOf(creative.slot) : c.anySlot}
          </p>
          <p className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                state === "on" && "bg-success",
                state === "off" && "bg-muted-foreground/50",
                state === "blocked" && "bg-destructive",
              )}
            />
            {state === "blocked" ? m.blockedBadge : state === "on" ? c.active : c.inactive}
            {" · "}
            {creative.type === "image" ? c.typeImage : c.typeCard}
          </p>
        </div>
        {control}
      </div>

      {creative.blockedByAdmin && creative.blockReason && (
        <p className="border-b border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs text-destructive">
          {creative.blockReason}
        </p>
      )}

      <div
        className={cn("mx-auto w-full max-w-[320px] p-3", state !== "on" && "opacity-60")}
      >
        {slot && (
          <SitePreview
            slots={[slot]}
            note={false}
            dataOf={() => ({
              draft: toDraft(creative),
              logoSrc: creative.logoUrl,
              imageSrc: creative.type === "image" ? creative.imageUrl : null,
            })}
          />
        )}
      </div>

      <div className="mt-auto space-y-2 border-t border-border px-3 py-2">
        <div className="flex min-w-0 items-center justify-between gap-3">
          {showStats && (
            <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
              {interpolate(c.stats, {
                impressions: formatCount(creative.impressions),
                clicks: formatCount(creative.clicks),
              })}
            </span>
          )}
          <a
            href={creative.href}
            target="_blank"
            rel="noopener noreferrer"
            title={creative.href}
            className="inline-flex min-w-0 items-center gap-1 text-[0.6875rem] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            <RiExternalLinkLine className="size-3.5 shrink-0" />
            <span className="truncate">{creative.href}</span>
          </a>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </div>
    </div>
  );
}

/** Joyga banner yo'q — yuborishdan oldin to'ldirish kerak. */
export function MissingSlotCard({
  slot,
  label,
  action,
}: {
  slot: AdSlot;
  label: string;
  action?: React.ReactNode;
}) {
  const { labelOf } = useRateCard();
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-dashed border-destructive/50 bg-destructive/5">
      <div className="flex items-center gap-2.5 border-b border-destructive/20 px-3 py-2.5">
        <SlotPreview slot={slot} className="w-6 shrink-0" />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{labelOf(slot)}</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
        <p className="text-sm text-destructive">{label}</p>
        {action}
      </div>
    </div>
  );
}
