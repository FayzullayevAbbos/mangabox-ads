"use client";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { HEX_RE, type AdSlot } from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";

import type { CreativeDraft } from "./wizard-model";

export type PosterPreview = {
  slot: AdSlot;
  src: string;
  ratio: number;
};

export function AdPreview({
  draft,
  logoSrc,
  posters,
}: {
  draft: CreativeDraft;
  logoSrc: string | null;
  posters: PosterPreview[];
}) {
  const w = useT("portal").wizard.creative;
  const { labelOf } = useRateCard();
  const accent = HEX_RE.test(draft.accentColor.trim())
    ? draft.accentColor.trim()
    : undefined;
  const brand = draft.brandName.trim() || w.previewBrand;
  const title = draft.title.trim() || w.previewTitle;
  const cta = draft.ctaText.trim() || w.ctaPlaceholder;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none">
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2.5">
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} alt="" className="size-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
                style={accent ? { backgroundColor: `${accent}26`, color: accent } : undefined}
              >
                {brand.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate text-sm font-medium">{brand}</span>
          </div>
          <p className="text-[0.9375rem] leading-snug font-semibold text-balance">
            {title}
          </p>
          {draft.body.trim() && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {draft.body.trim()}
            </p>
          )}
          <span
            className="flex h-9 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
            style={accent ? { backgroundColor: accent, color: "#fff" } : undefined}
          >
            {cta}
          </span>
        </div>
      </div>

      {posters.map((poster) => (
        <figure key={poster.slot} className="space-y-1.5">
          <div
            className="overflow-hidden rounded-xl border border-border bg-muted"
            style={{ aspectRatio: poster.ratio }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster.src} alt="" className="size-full object-cover" />
          </div>
          <figcaption className="text-xs text-muted-foreground">
            {labelOf(poster.slot)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
