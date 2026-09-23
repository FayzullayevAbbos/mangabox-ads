"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RiArrowLeftLine, RiErrorWarningLine } from "@remixicon/react";

import {
  actionsFor,
  useCampaignActions,
} from "@/components/dashboard/ads/campaign-actions";
import {
  CampaignFormSheet,
  type CampaignFormTarget,
} from "@/components/dashboard/ads/campaign-form-sheet";
import { periodRange } from "@/components/dashboard/ads/campaign-format";
import { CampaignOrders } from "@/components/dashboard/ads/campaign-orders";
import { CampaignOverview } from "@/components/dashboard/ads/campaign-overview";
import { CampaignStats } from "@/components/dashboard/ads/campaign-stats";
import { CampaignStatusBadge } from "@/components/dashboard/ads/campaign-status-badge";
import { CreativeManager } from "@/components/dashboard/ads/creative-manager";
import { LoadErrorState } from "@/components/dashboard/page-states";
import { SectionInfo } from "@/components/dashboard/section-info";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCampaign, type AdCampaign } from "@/lib/api/ads";
import { formatCount, formatDate, formatSomAmount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; campaign: AdCampaign };

const TABS = ["overview", "creatives", "stats", "orders"] as const;
type Tab = (typeof TABS)[number];

function isTab(value: string | null): value is Tab {
  return TABS.includes(value as Tab);
}

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const p = useT("portal");
  const [state, setState] = React.useState<State>({ status: "loading" });
  const [formTarget, setFormTarget] = React.useState<CampaignFormTarget>(null);

  const load = React.useCallback(
    (quiet = false) => {
      if (!quiet) setState({ status: "loading" });
      return getCampaign(campaignId)
        .then((campaign) => setState({ status: "ready", campaign }))
        .catch((err: unknown) =>
          setState({
            status: "error",
            message: err instanceof Error ? err.message : p.campaignPage.notFound,
          }),
        );
    },
    [campaignId, p.campaignPage.notFound],
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  const reload = React.useCallback(() => void load(true), [load]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <Link
        href="/dashboard"
        className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RiArrowLeftLine className="size-4" />
        {p.campaignPage.back}
      </Link>

      {state.status === "loading" && <DetailSkeleton />}

      {state.status === "error" && (
        <LoadErrorState message={state.message} onRetry={() => void load()} />
      )}

      {state.status === "ready" && (
        <Loaded
          campaign={state.campaign}
          onChanged={reload}
          onEdit={() => setFormTarget(state.campaign)}
        />
      )}

      <CampaignFormSheet
        target={formTarget}
        onClose={() => setFormTarget(null)}
        onSaved={() => {
          setFormTarget(null);
          reload();
        }}
      />
    </div>
  );
}

function Loaded({
  campaign,
  onChanged,
  onEdit,
}: {
  campaign: AdCampaign;
  onChanged: () => void;
  onEdit: () => void;
}) {
  const t = useT("ads");
  const p = useT("portal");
  const actions = useCampaignActions(() => onChanged());
  const allowed = actionsFor(campaign);
  const busy = actions.isBusy(campaign.id);
  const hint = p.nextAction[campaign.nextAction].trim();

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance break-words sm:text-3xl">
              {campaign.name}
            </h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:text-[0.9375rem]">
            {[
              hint,
              campaign.createdAt &&
                interpolate(p.campaignPage.created, {
                  date: formatDate(campaign.createdAt),
                }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {allowed.some((a) => a !== "details") && (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {allowed.includes("edit") && (
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={onEdit}>
                {t.actions.edit}
              </Button>
            )}
            {allowed.includes("pause") && (
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={busy}
                onClick={() => actions.pause(campaign)}
              >
                {t.actions.pause}
              </Button>
            )}
            {allowed.includes("resume") && (
              <Button
                className="flex-1 sm:flex-none"
                disabled={busy}
                onClick={() => actions.resume(campaign)}
              >
                {t.actions.resume}
              </Button>
            )}
            {allowed.includes("submit") && (
              <Button
                className="flex-1 sm:flex-none"
                disabled={busy}
                onClick={() => actions.submit(campaign)}
              >
                {p.actions.submit}
              </Button>
            )}
            {allowed.includes("pay") && (
              <Button
                className="flex-1 sm:flex-none"
                disabled={busy}
                onClick={() => actions.askPay(campaign)}
              >
                {p.actions.pay}
              </Button>
            )}
          </div>
        )}
      </header>

      {campaign.rejectReason && (
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-destructive">
          <RiErrorWarningLine className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">{t.sheet.overview.rejectReason}</p>
            <p className="mt-0.5 text-sm">{campaign.rejectReason}</p>
          </div>
        </div>
      )}

      <SummaryStrip campaign={campaign} />

      <DetailTabs campaign={campaign} onChanged={onChanged} />

      {actions.dialogs}
    </>
  );
}

function SummaryStrip({ campaign }: { campaign: AdCampaign }) {
  const t = useT("ads");
  const p = useT("portal");
  const o = t.sheet.overview;
  const delivered = campaign.creatives.reduce((s, c) => s + c.impressions, 0);
  const clicks = campaign.creatives.reduce((s, c) => s + c.clicks, 0);
  const percent = campaign.impressionsGoal
    ? Math.min(100, Math.round((delivered / campaign.impressionsGoal) * 100))
    : 0;
  const ctr = delivered ? `${((clicks / delivered) * 100).toFixed(2)}%` : "—";

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
      <Cell label={o.period}>
        <span className="text-base font-semibold sm:text-lg">
          {periodRange(campaign)}
        </span>
        <Sub>{interpolate(o.days, { days: campaign.days })}</Sub>
      </Cell>
      <Cell label={p.campaignPage.delivery}>
        <span className="font-mono text-lg font-semibold tabular-nums sm:text-xl">
          {formatCount(delivered)}
        </span>
        <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted sm:flex-1">
            <div
              className={cn(
                "h-full rounded-full",
                campaign.status === "active" ? "bg-success" : "bg-primary",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {percent}% / {formatCount(campaign.impressionsGoal)}
          </span>
        </div>
      </Cell>
      <Cell label={p.home.stats.clicks}>
        <span className="font-mono text-lg font-semibold tabular-nums sm:text-xl">
          {formatCount(clicks)}
        </span>
        <Sub mono>{ctr}</Sub>
      </Cell>
      <Cell label={o.total}>
        <span className="font-mono text-lg font-semibold tabular-nums sm:text-xl">
          {formatSomAmount(campaign.totalSom)}
        </span>
        {campaign.discountPercent > 0 && (
          <Sub mono>
            <span className="line-through">
              {formatSomAmount(campaign.subtotalSom)}
            </span>
            <span className="ml-1.5 text-success">−{campaign.discountPercent}%</span>
          </Sub>
        )}
      </Cell>
    </dl>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 bg-card px-4 py-4 sm:px-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1.5">{children}</dd>
    </div>
  );
}

function Sub({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <p
      className={cn(
        "mt-1 text-sm text-muted-foreground",
        mono && "font-mono text-xs tabular-nums",
      )}
    >
      {children}
    </p>
  );
}

function DetailTabs({
  campaign,
  onChanged,
}: {
  campaign: AdCampaign;
  onChanged: () => void;
}) {
  const t = useT("ads");
  const p = useT("portal");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab: Tab = isTab(requested) ? requested : "overview";

  const select = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "overview") next.delete("tab");
    else next.set("tab", value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const labels: Record<Tab, string> = {
    overview: t.sheet.tabs.overview,
    creatives: t.sheet.tabs.creatives,
    stats: t.sheet.tabs.stats,
    orders: t.sheet.tabs.orders,
  };

  return (
    <Tabs value={tab} onValueChange={select} className="gap-6">
      <div className="-mx-4 overflow-x-auto px-4 pb-px [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <TabsList
          variant="line"
          className="w-max min-w-full justify-start gap-6 rounded-none border-b border-border p-0"
        >
          {TABS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-none gap-2 rounded-none px-0 py-3 text-[0.9375rem] font-medium text-muted-foreground after:!bottom-[-1px] after:!h-0.5 after:!bg-active data-active:!text-active"
            >
              {labels[value]}
              {value === "creatives" && (
                <span className="min-w-5 rounded bg-muted px-1 text-center font-mono text-xs text-muted-foreground tabular-nums">
                  {campaign.creatives.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <SectionInfo id="sheet-overview" content={p.info.sections.overview} />
        <CampaignOverview campaign={campaign} />
      </TabsContent>
      <TabsContent value="creatives" className="space-y-6">
        <SectionInfo id="sheet-creatives" content={p.info.sections.creatives} />
        <CreativeManager campaign={campaign} onChanged={onChanged} />
      </TabsContent>
      <TabsContent value="stats" className="space-y-6">
        <SectionInfo id="sheet-stats" content={p.info.sections.stats} />
        <CampaignStats campaign={campaign} />
      </TabsContent>
      <TabsContent value="orders" className="space-y-6">
        <SectionInfo id="sheet-orders" content={p.info.sections.campaignOrders} />
        <CampaignOrders campaignId={campaign.id} />
      </TabsContent>
    </Tabs>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-10 w-80 max-w-full" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
