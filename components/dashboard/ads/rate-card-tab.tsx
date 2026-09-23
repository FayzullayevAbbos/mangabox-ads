"use client";

import * as React from "react";
import { RiArrowRightLine, RiCheckLine } from "@remixicon/react";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { NumberField, QuoteLine } from "@/components/dashboard/ads/quote-parts";
import { SlotPreview } from "@/components/dashboard/ads/slot-preview";
import { useQuote } from "@/components/dashboard/ads/use-quote";
import type { RateCardPick } from "@/components/dashboard/ads/wizard/wizard-model";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MAX_CAMPAIGN_DAYS,
  MAX_SHARE_PERCENT,
  MIN_CAMPAIGN_DAYS,
  MIN_SHARE_PERCENT,
  type AdSlot,
  type AdSlotSpec,
} from "@/lib/api/ads";
import { formatCount, formatSomAmount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function RateCardTab({
  onStart,
}: {
  onStart: (pick: RateCardPick) => void;
}) {
  const t = useT("ads");
  const { specs } = useRateCard();
  const [slot, setSlot] = React.useState<AdSlot | "">("");
  const [share, setShare] = React.useState(MIN_SHARE_PERCENT);
  const [days, setDays] = React.useState(30);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!slot && specs.length > 0) setSlot(specs[0].id);
  }, [slot, specs]);

  const selected = specs.find((s) => s.id === slot) ?? null;
  const maxDaily = specs.reduce((m, s) => Math.max(m, s.dailyImpressions), 0);

  const choose = (next: AdSlot) => {
    setSlot(next);
    // Panel ustunda emas — bosgan odam natijani ko'rishi kerak.
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        {specs.length > 0 ? (
          <p className="max-w-[62ch] text-[0.9375rem] text-muted-foreground">
            {interpolate(t.rateCard.lead, {
              count: formatCount(
                specs.reduce((sum, s) => sum + s.dailyImpressions, 0),
              ),
            })}
          </p>
        ) : (
          <Skeleton className="h-5 w-full max-w-[32rem]" />
        )}
        <p className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-3.5 shrink-0 rounded-[4px] border border-primary/45 bg-primary/15" />
          {t.rateCard.legend}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start xl:gap-8">
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
          {specs.length === 0
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[13.5rem] w-full rounded-xl" />
              ))
            : specs.map((spec) => (
                <PlaceCard
                  key={spec.id}
                  spec={spec}
                  maxDaily={maxDaily}
                  selected={spec.id === slot}
                  onChoose={() => choose(spec.id)}
                />
              ))}
        </div>

        <div ref={panelRef} className="lg:sticky lg:top-6 lg:scroll-mt-6">
          <PricePanel
            spec={selected}
            share={share}
            days={days}
            onShare={setShare}
            onDays={setDays}
            onStart={onStart}
          />
        </div>
      </div>
    </div>
  );
}

export function PlaceCard({
  spec,
  maxDaily,
  selected,
  onChoose,
}: {
  spec: AdSlotSpec;
  maxDaily: number;
  selected: boolean;
  onChoose: () => void;
}) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const moment = t.rateCard.moment[spec.id];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onChoose}
      className={cn(
        "group flex w-full gap-4 rounded-xl border bg-card p-4 text-left transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden sm:p-5",
        selected
          ? "border-primary bg-primary/[0.04] dark:bg-primary/[0.09]"
          : "border-border hover:border-primary/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-none",
      )}
    >
      <SlotPreview
        slot={spec.id}
        active={selected}
        className="w-20 shrink-0 self-start sm:w-24 xl:w-28"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold tracking-tight">
            {labelOf(spec.id)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{moment}</p>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1">
          <dt className="text-xs text-muted-foreground">
            {t.rateCard.perView}
          </dt>
          <dt className="text-xs text-muted-foreground">{t.rateCard.perDay}</dt>
          <dd className="font-mono text-lg font-semibold tabular-nums">
            {formatSomAmount(spec.cpmSom / 1000)}
            <span className="ms-1 font-sans text-xs font-normal text-muted-foreground">
              {t.rateCard.currency}
            </span>
          </dd>
          <dd className="font-mono text-lg font-semibold tabular-nums">
            {formatCount(spec.dailyImpressions)}
          </dd>
          <dd className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
            {interpolate(t.rateCard.cpm, {
              amount: formatSomAmount(spec.cpmSom),
            })}
          </dd>
          <dd className="self-center">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="presentation"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width,background-color] duration-300",
                  selected ? "bg-primary" : "bg-primary/45",
                )}
                style={{
                  width: `${Math.max(6, (spec.dailyImpressions / maxDaily) * 100)}%`,
                }}
              />
            </div>
          </dd>
        </dl>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {spec.creativeTypes.length === 1
              ? t.rateCard.cardOnly
              : spec.creativeTypes
                  .map((type) => t.rateCard.formats[type])
                  .join(" · ")}
          </span>
          {spec.image && (
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground tabular-nums">
              {spec.image.minWidth}×{spec.image.minHeight}
            </span>
          )}
          <span
            className={cn(
              "ms-auto inline-flex items-center gap-1 text-xs font-medium transition-colors",
              selected
                ? "text-primary"
                : "text-muted-foreground group-hover:text-primary",
            )}
          >
            {selected ? (
              <>
                <RiCheckLine className="size-3.5" />
                {t.rateCard.selected}
              </>
            ) : (
              <>
                {t.rateCard.choose}
                <RiArrowRightLine className="size-3.5" />
              </>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

function PricePanel({
  spec,
  share,
  days,
  onShare,
  onDays,
  onStart,
}: {
  spec: AdSlotSpec | null;
  share: number;
  days: number;
  onShare: (value: number) => void;
  onDays: (value: number) => void;
  onStart: (pick: RateCardPick) => void;
}) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const c = t.rateCard.calculator;
  const lines = React.useMemo(
    () => (spec ? [{ slot: spec.id, sharePercent: share }] : []),
    [spec, share],
  );
  const { quote, loading, belowMinimum } = useQuote(lines, days, 250);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-4 p-5">
        {spec ? (
          <SlotPreview slot={spec.id} active className="w-14 shrink-0" />
        ) : (
          <Skeleton className="h-24 w-14 shrink-0 rounded-md" />
        )}
        <div className="min-w-0">
          <h2 className="font-heading text-base font-semibold tracking-tight">
            {spec ? labelOf(spec.id) : c.title}
          </h2>
          {spec && (
            <p className="mt-1 text-sm text-muted-foreground">
              {t.rateCard.perView.toLocaleLowerCase()}{" "}
              <span className="font-mono text-foreground tabular-nums">
                {formatSomAmount(spec.cpmSom / 1000)}
              </span>{" "}
              {t.rateCard.currency}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-5 border-t border-border p-5">
        <NumberField
          label={c.share}
          value={share}
          min={MIN_SHARE_PERCENT}
          max={MAX_SHARE_PERCENT}
          onChange={onShare}
          suffix="%"
          hint={
            spec
              ? interpolate(c.shareHint, {
                  share,
                  count: formatCount(
                    Math.round((spec.dailyImpressions * share) / 100),
                  ),
                })
              : undefined
          }
        />
        <NumberField
          label={c.days}
          value={days}
          min={MIN_CAMPAIGN_DAYS}
          max={MAX_CAMPAIGN_DAYS}
          onChange={onDays}
          minLabel={interpolate(c.daysUnit, { days: MIN_CAMPAIGN_DAYS })}
          maxLabel={interpolate(c.daysUnit, { days: MAX_CAMPAIGN_DAYS })}
        />
      </div>

      <div className="border-t border-border p-5">
        {quote === null ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <p className="text-sm text-muted-foreground">
              {interpolate(c.reach, {
                count: formatCount(quote.impressions),
                days,
              })}
            </p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <Amount value={quote.totalSom} />
              <span className="text-sm text-muted-foreground">
                {t.rateCard.currency}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {interpolate(c.perDayCost, {
                amount: formatSomAmount(quote.totalSom / days),
              })}
            </p>
            {quote.discountPercent > 0 && (
              <dl className="mt-4 space-y-2 border-t border-border pt-4">
                <QuoteLine
                  label={c.subtotal}
                  value={formatSomAmount(quote.subtotalSom)}
                  muted
                />
                <QuoteLine
                  label={`${c.discountSom} ${quote.discountPercent}%`}
                  value={`−${formatSomAmount(quote.discountSom)}`}
                  muted
                />
              </dl>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border p-5">
        <Button
          className="w-full"
          disabled={!spec || quote === null || belowMinimum}
          onClick={() =>
            spec && onStart({ slot: spec.id, sharePercent: share, days })
          }
        >
          {c.start}
          <RiArrowRightLine className="size-4" />
        </Button>
        {belowMinimum && (
          <p className="mt-2 text-xs text-destructive">
            {t.form.minOrder} {c.minOrderFix}
          </p>
        )}
      </div>
    </div>
  );
}

/** Summa o'zgarganda sakramaydi — sanab yetib boradi. */
function Amount({ value }: { value: number }) {
  const [shown, setShown] = React.useState(value);
  const fromRef = React.useRef(value);
  const currentRef = React.useRef(value);

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduced || from === value) {
      fromRef.current = value;
      currentRef.current = value;
      setShown(value);
      return;
    }
    const started = performance.now();
    let frame = requestAnimationFrame(function step(now: number) {
      const p = Math.min(1, (now - started) / 420);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = from + (value - from) * eased;
      currentRef.current = next;
      setShown(next);
      if (p < 1) frame = requestAnimationFrame(step);
      else fromRef.current = value;
    });
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = currentRef.current;
    };
  }, [value]);

  return (
    <span className="font-mono text-[2rem] leading-none font-semibold tabular-nums">
      {formatSomAmount(shown)}
    </span>
  );
}
