"use client";

import { RiExternalLinkLine, RiImageLine } from "@remixicon/react";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import type { AdCreative } from "@/lib/api/ads";
import { formatCount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Moderator matn va rasmni KO'RIB qaror qiladi — shuning uchun kreativ
 * ilovadagi kabi chiziladi: logotip, brend, sarlavha, matn, CTA tugmasi va
 * asosiy rang. Raqamlar (ko'rsatish/klik) ikkinchi darajali, pastda.
 */
export function CreativePreview({
  creative,
  actions,
  className,
}: {
  creative: AdCreative;
  actions?: React.ReactNode;
  className?: string;
}) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const accent = creative.accentColor || undefined;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg bg-muted/40 p-3.5",
        !creative.active && "opacity-60",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {creative.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creative.imageUrl}
            alt=""
            className="h-16 w-24 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
            <RiImageLine className="size-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {creative.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creative.logoUrl}
                alt=""
                className="size-5 shrink-0 rounded-full object-cover"
              />
            )}
            <span className="truncate text-sm font-medium">
              {creative.brandName}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {creative.type === "card" ? t.sheet.creatives.typeCard : t.sheet.creatives.typeImage}
              {" · "}
              {creative.slot ? labelOf(creative.slot) : t.sheet.creatives.anySlot}
            </span>
            {!creative.active && (
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {t.sheet.creatives.inactive}
              </span>
            )}
          </div>

          {creative.title && (
            <p className="mt-1 truncate text-[0.9375rem] font-medium">
              {creative.title}
            </p>
          )}
          {creative.body && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {creative.body}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {creative.ctaText && (
              <span
                className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
                style={
                  accent
                    ? { backgroundColor: `${accent}1f`, color: accent }
                    : undefined
                }
              >
                {creative.ctaText}
              </span>
            )}
            {/* Havola ko'rinib tursin — moderator qayerga olib borishini biladi. */}
            <a
              href={creative.href}
              target="_blank"
              rel="noopener noreferrer"
              title={creative.href}
              className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              <RiExternalLinkLine className="size-3.5 shrink-0" />
              <span className="truncate">{creative.href}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {interpolate(t.sheet.creatives.stats, {
            impressions: formatCount(creative.impressions),
            clicks: formatCount(creative.clicks),
          })}
        </span>
        {actions}
      </div>
    </div>
  );
}
