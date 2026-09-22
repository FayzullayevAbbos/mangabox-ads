"use client";

import * as React from "react";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { SelectMenu } from "@/components/dashboard/select-menu";
import { TABLE_BLEED } from "@/components/dashboard/table-bleed";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCampaignQuote,
  MAX_CAMPAIGN_DAYS,
  MAX_SHARE_PERCENT,
  MIN_CAMPAIGN_DAYS,
  MIN_SHARE_PERCENT,
  type AdQuote,
  type AdSlot,
} from "@/lib/api/ads";
import { formatCount, formatSomAmount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";

export function RateCardTab() {
  const t = useT("ads");
  const { specs } = useRateCard();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {t.rateCard.title}
        </h2>
        <div className="mt-5">
          {specs.length === 0 ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table
              containerClassName={TABLE_BLEED}
              className="min-w-[46rem] text-[0.9375rem]"
            >
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-11 px-0 text-sm font-semibold text-foreground">
                    {t.rateCard.columns.slot}
                  </TableHead>
                  <TableHead className="h-11 text-right text-sm font-semibold text-foreground">
                    {t.rateCard.columns.cpm}
                  </TableHead>
                  <TableHead className="h-11 text-right text-sm font-semibold text-foreground">
                    {t.rateCard.columns.daily}
                  </TableHead>
                  <TableHead className="h-11 text-sm font-semibold text-foreground">
                    {t.rateCard.columns.types}
                  </TableHead>
                  <TableHead className="h-11 px-0 text-sm font-semibold text-foreground">
                    {t.rateCard.columns.image}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specs.map((spec) => (
                  <TableRow key={spec.id} className="border-border">
                    <TableCell className="h-14 px-0 font-medium">
                      {spec.label}
                      <span className="block font-mono text-xs text-muted-foreground">
                        {spec.id}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatSomAmount(spec.cpmSom)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatCount(spec.dailyImpressions)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {spec.creativeTypes.length === 1
                        ? t.rateCard.cardOnly
                        : spec.creativeTypes.join(" · ")}
                    </TableCell>
                    <TableCell className="px-0 font-mono text-sm text-muted-foreground tabular-nums">
                      {spec.image
                        ? `${spec.image.minWidth}×${spec.image.minHeight}`
                        : t.rateCard.noImage}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <Separator />

      <Calculator />
    </div>
  );
}

/** Narx faqat serverdan — `POST quote` butun kampaniyani bir marta hisoblaydi. */
function Calculator() {
  const t = useT("ads");
  const { specs, labelOf } = useRateCard();
  const [slot, setSlot] = React.useState<AdSlot | "">("");
  const [share, setShare] = React.useState(25);
  const [days, setDays] = React.useState(30);
  const [quote, setQuote] = React.useState<AdQuote | null>(null);
  const [loading, setLoading] = React.useState(false);

  const selectedSpec = specs.find((s) => s.id === slot) ?? null;

  React.useEffect(() => {
    if (!slot && specs.length > 0) setSlot(specs[0].id);
  }, [slot, specs]);

  React.useEffect(() => {
    if (!slot) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      getCampaignQuote([{ slot, sharePercent: share }], days)
        .then((result) => {
          if (!cancelled) setQuote(result);
        })
        .catch(() => {
          if (!cancelled) setQuote(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slot, share, days]);

  return (
    <section>
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        {t.rateCard.calculator.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.rateCard.calculator.hint}
      </p>

      <div className="mt-5 grid gap-10 lg:grid-cols-2 lg:gap-12 [&>*]:min-w-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t.rateCard.calculator.slot}</Label>
            <SelectMenu
              fullWidth
              label={slot ? labelOf(slot) : "—"}
              value={slot}
              options={specs.map((s) => ({ value: s.id, label: s.label }))}
              onSelect={(v) => setSlot(v as AdSlot)}
            />
          </div>

          <NumberField
            label={t.rateCard.calculator.share}
            value={share}
            min={MIN_SHARE_PERCENT}
            max={MAX_SHARE_PERCENT}
            onChange={setShare}
            suffix="%"
            hint={
              selectedSpec
                ? interpolate(t.rateCard.calculator.shareHint, {
                    share,
                    count: formatCount(
                      Math.round((selectedSpec.dailyImpressions * share) / 100),
                    ),
                  })
                : undefined
            }
          />
          <NumberField
            label={t.rateCard.calculator.days}
            value={days}
            min={MIN_CAMPAIGN_DAYS}
            max={MAX_CAMPAIGN_DAYS}
            onChange={setDays}
          />
        </div>

        <div className="lg:border-l lg:border-border lg:pl-12">
          <QuoteSummary quote={quote} loading={loading} />
        </div>
      </div>
    </section>
  );
}

export function QuoteSummary({
  quote,
  loading,
}: {
  quote: AdQuote | null;
  loading: boolean;
}) {
  const t = useT("ads");
  const c = t.rateCard.calculator;

  if (!quote) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-48" />
      </div>
    );
  }

  return (
    <dl className={loading ? "space-y-3 opacity-60" : "space-y-3"}>
      <Line label={c.impressions} value={formatCount(quote.impressions)} />
      <Line label={c.subtotal} value={formatSomAmount(quote.subtotalSom)} />
      {quote.discountPercent > 0 && (
        <Line
          label={`${c.discountSom} ${quote.discountPercent}%`}
          value={`−${formatSomAmount(quote.discountSom)}`}
        />
      )}
      <Separator />
      <div className="flex items-baseline justify-between gap-4">
        <dt className="font-medium">{c.total}</dt>
        <dd className="font-mono text-xl font-semibold tabular-nums">
          {formatSomAmount(quote.totalSom)}
        </dd>
      </div>
    </dl>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[0.9375rem]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {suffix ? ` (${suffix})` : ""}
      </Label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) {
              onChange(Math.min(max, Math.max(min, Math.round(next))));
            }
          }}
          className="h-10 w-20 shrink-0 text-center font-mono text-[0.9375rem] tabular-nums md:text-[0.9375rem]"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
