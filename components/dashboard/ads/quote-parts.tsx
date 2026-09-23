"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import type { AdQuote } from "@/lib/api/ads";
import { formatCount, formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";

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
      <QuoteLine label={c.impressions} value={formatCount(quote.impressions)} />
      <QuoteLine label={c.subtotal} value={formatSomAmount(quote.subtotalSom)} />
      {quote.discountPercent > 0 && (
        <QuoteLine
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

export function QuoteLine({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[0.9375rem]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          muted
            ? "font-mono text-muted-foreground tabular-nums"
            : "font-mono tabular-nums"
        }
      >
        {value}
      </dd>
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
  minLabel,
  maxLabel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {suffix ? ` (${suffix})` : ""}
      </Label>
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={1}
          aria-label={label}
          onValueChange={([next]) => onChange(next)}
          className="flex-1"
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
          className="h-10 w-20 shrink-0 [appearance:textfield] text-center font-mono text-[0.9375rem] tabular-nums md:text-[0.9375rem] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between pr-[5.75rem] text-xs text-muted-foreground tabular-nums">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
