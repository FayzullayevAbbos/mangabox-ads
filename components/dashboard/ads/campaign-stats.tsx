"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { RiBarChart2Line } from "@remixicon/react";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { EmptyResult, LoadErrorState } from "@/components/dashboard/page-states";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCampaignStats,
  type AdCampaign,
  type AdCampaignReport,
  type AdReportBucket,
  type AdSlot,
} from "@/lib/api/ads";
import { formatCount, formatDayShort } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; report: AdCampaignReport };

export function CampaignStats({ campaign }: { campaign: AdCampaign }) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const [state, setState] = React.useState<State>({ status: "loading" });

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    return getCampaignStats(campaign.id)
      .then((report) => setState({ status: "ready", report }))
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "",
        }),
      );
  }, [campaign.id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-2 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-[220px] w-full" />
      </div>
    );
  }

  if (state.status === "error") {
    return <LoadErrorState message={state.message} onRetry={load} />;
  }

  const { totals, days, slots, creatives } = state.report;
  const progress = campaign.impressionsGoal
    ? Math.min(100, (totals.impressions / campaign.impressionsGoal) * 100)
    : 0;
  const ctr = totals.impressions
    ? (totals.clicks / totals.impressions) * 100
    : 0;

  const chartConfig = {
    impressions: { label: t.sheet.stats.impressions, color: "var(--primary)" },
  } satisfies ChartConfig;

  const creativeLabel = (key: string) => {
    const creative = campaign.creatives.find((c) => c.id === key);
    if (!creative) return key;
    return [creative.brandName, creative.title].filter(Boolean).join(" — ");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium">{t.sheet.stats.progress}</span>
          <span className="font-mono tabular-nums">
            {formatCount(totals.impressions)}
            <span className="text-muted-foreground">
              {" / "}
              {formatCount(campaign.impressionsGoal)}
            </span>
            <span className="ml-2 text-muted-foreground">
              {progress.toFixed(0)}%
            </span>
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border">
        <Tile label={t.sheet.stats.impressions} value={formatCount(totals.impressions)} />
        <Tile label={t.sheet.stats.views} value={formatCount(totals.views)} />
        <Tile label={t.sheet.stats.clicks} value={formatCount(totals.clicks)} />
        <Tile label={t.sheet.stats.ctr} value={`${ctr.toFixed(2)}%`} />
        {/* `uniqueViewers` faqat jamida bor — kesimlarda yo'q. */}
        <Tile
          label={t.sheet.stats.unique}
          value={formatCount(totals.uniqueViewers)}
          className="col-span-2"
        />
      </div>

      <p className="text-xs text-muted-foreground">{t.sheet.stats.hint}</p>

      <section>
        <h3 className="text-sm font-medium">{t.sheet.stats.chartTitle}</h3>
        <div className="mt-3">
          {days.every((d) => d.impressions === 0) ? (
            <EmptyResult
              icon={RiBarChart2Line}
              title={t.sheet.stats.empty}
              description=" "
            />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <BarChart
                data={days.map((d) => ({
                  label: formatDayShort(d.key),
                  impressions: d.impressions,
                }))}
                margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={36}
                  interval="preserveStartEnd"
                  fontSize={11}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="impressions"
                  fill="var(--color-impressions)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </section>

      <ShareList
        title={t.sheet.stats.bySlot}
        buckets={slots}
        total={totals.impressions}
        labelFor={(key) => labelOf(key as AdSlot)}
        empty={t.sheet.stats.empty}
      />

      <ShareList
        title={t.sheet.stats.byCreative}
        buckets={creatives}
        total={totals.impressions}
        labelFor={creativeLabel}
        empty={t.sheet.stats.empty}
      />
    </div>
  );
}

function Tile({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-background px-4 py-3 ${className ?? ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ShareList({
  title,
  buckets,
  total,
  labelFor,
  empty,
}: {
  title: string;
  buckets: AdReportBucket[];
  total: number;
  labelFor: (key: string) => string;
  empty: string;
}) {
  const t = useT("ads");
  return (
    <section>
      <h3 className="text-sm font-medium">{title}</h3>
      {buckets.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {buckets.map((bucket) => {
            const share = total
              ? Math.round((bucket.impressions / total) * 100)
              : 0;
            return (
              <li key={bucket.key}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="min-w-0 truncate">
                    {labelFor(bucket.key)}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">
                    {formatCount(bucket.impressions)}
                    <span className="ml-2 text-muted-foreground">{share}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${share}%` }}
                  />
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground tabular-nums">
                  {formatCount(bucket.clicks)} {t.sheet.stats.clicks.toLowerCase()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
