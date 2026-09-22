"use client";

import * as React from "react";

import {
  actionsFor,
  useCampaignActions,
} from "@/components/dashboard/ads/campaign-actions";
import {
  CampaignAmount,
  periodLabel,
  slotsLabel,
} from "@/components/dashboard/ads/campaign-format";
import { CampaignStats } from "@/components/dashboard/ads/campaign-stats";
import { CampaignStatusBadge } from "@/components/dashboard/ads/campaign-status-badge";
import { CreativeManager } from "@/components/dashboard/ads/creative-manager";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { LoadErrorState } from "@/components/dashboard/page-states";
import { TransactionStatusBadge } from "@/components/dashboard/transaction-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCampaign,
  getCampaignOrders,
  type AdCampaign,
  type AdOrder,
} from "@/lib/api/ads";
import {
  formatCount,
  formatDate,
  formatDateTime,
  formatSomAmount,
} from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; campaign: AdCampaign };

export function CampaignSheet({
  campaignId,
  onClose,
  onChanged,
  onEdit,
}: {
  campaignId: string | null;
  onClose: () => void;
  onChanged: () => void;
  onEdit: (campaign: AdCampaign) => void;
}) {
  const t = useT("ads");
  const p = useT("portal");
  const [state, setState] = React.useState<State>({ status: "loading" });

  const load = React.useCallback(() => {
    if (!campaignId) return Promise.resolve();
    setState({ status: "loading" });
    return getCampaign(campaignId)
      .then((campaign) => setState({ status: "ready", campaign }))
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "",
        }),
      );
  }, [campaignId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** Sheet ichidagi o'zgarish ro'yxatga ham tegishli. */
  const refresh = () => {
    void load();
    onChanged();
  };

  const actions = useCampaignActions(() => refresh());
  const campaign = state.status === "ready" ? state.campaign : null;
  const allowed = campaign ? actionsFor(campaign) : [];

  return (
    <Sheet
      open={campaignId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent className="flex w-full flex-col gap-0 data-[side=right]:sm:max-w-3xl">
        <SheetHeader>
          <div className="flex flex-wrap items-center gap-3">
            <SheetTitle className="text-lg">
              {campaign?.name ?? <Skeleton className="h-5 w-40" />}
            </SheetTitle>
            {campaign && <CampaignStatusBadge status={campaign.status} />}
          </div>
          <SheetDescription>{campaign ? p.nextAction[campaign.nextAction] : " "}</SheetDescription>
        </SheetHeader>

        {state.status === "loading" && (
          <div className="space-y-3 px-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {state.status === "error" && (
          <div className="px-4">
            <LoadErrorState message={state.message} onRetry={load} />
          </div>
        )}

        {campaign && (
          <Tabs
            defaultValue="overview"
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <div className="-mx-4 overflow-x-auto px-4 pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsList
                variant="line"
                className="w-max min-w-full justify-start gap-5 rounded-none border-b border-border p-0"
              >
                {(
                  [
                    ["overview", t.sheet.tabs.overview],
                    ["creatives", t.sheet.tabs.creatives],
                    ["stats", t.sheet.tabs.stats],
                    ["orders", t.sheet.tabs.orders],
                  ] as const
                ).map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex-none rounded-none px-0 py-3 text-sm font-medium text-muted-foreground after:!bottom-[-1px] after:!h-0.5 after:!bg-[#0162FF] data-active:!text-[#0162FF]"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
              <TabsContent value="overview">
                <Overview campaign={campaign} />
              </TabsContent>
              <TabsContent value="creatives">
                <CreativeManager campaign={campaign} onChanged={refresh} />
              </TabsContent>
              <TabsContent value="stats">
                <CampaignStats campaign={campaign} />
              </TabsContent>
              <TabsContent value="orders">
                <Orders campaignId={campaign.id} />
              </TabsContent>
            </div>

            {allowed.some((a) => a !== "details") && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4">
                {allowed.includes("edit") && (
                  <Button variant="outline" onClick={() => onEdit(campaign)}>
                    {t.actions.edit}
                  </Button>
                )}
                {allowed.includes("pause") && (
                  <Button
                    variant="outline"
                    disabled={actions.isBusy(campaign.id)}
                    onClick={() => actions.pause(campaign)}
                  >
                    {t.actions.pause}
                  </Button>
                )}
                {allowed.includes("resume") && (
                  <Button
                    variant="outline"
                    disabled={actions.isBusy(campaign.id)}
                    onClick={() => actions.resume(campaign)}
                  >
                    {t.actions.resume}
                  </Button>
                )}
                {allowed.includes("submit") && (
                  <Button
                    disabled={actions.isBusy(campaign.id)}
                    onClick={() => actions.submit(campaign)}
                  >
                    {p.actions.submit}
                  </Button>
                )}
                {allowed.includes("pay") && (
                  <Button
                    disabled={actions.isBusy(campaign.id)}
                    onClick={() => actions.askPay(campaign)}
                  >
                    {p.actions.pay}
                  </Button>
                )}
              </div>
            )}
          </Tabs>
        )}

        {actions.dialogs}
      </SheetContent>
    </Sheet>
  );
}

function Overview({ campaign }: { campaign: AdCampaign }) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const o = t.sheet.overview;

  return (
    <div className="space-y-5">
      {campaign.rejectReason && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3">
          <p className="text-xs font-medium text-destructive">
            {o.rejectReason}
          </p>
          <p className="mt-1 text-sm text-destructive">
            {campaign.rejectReason}
          </p>
        </div>
      )}

      <dl className="space-y-3 text-[0.9375rem]">
        <Row
          label={o.period}
          value={`${periodLabel(campaign)} · ${interpolate(o.days, {
            days: campaign.days,
          })}`}
        />
        <Row label={t.campaigns.columns.slots} value={slotsLabel(campaign, labelOf)} />
        <Row
          label={o.goal}
          value={formatCount(campaign.impressionsGoal)}
          mono
        />
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

      <Separator />

      <div>
        <p className="text-sm font-medium">{o.slots}</p>
        <ul className="mt-3 space-y-2.5">
          {campaign.slots.map((line) => (
            <li
              key={line.slot}
              className="flex flex-wrap items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0">
                {labelOf(line.slot)}
                <span className="ml-2 text-muted-foreground">
                  {line.sharePercent}%
                </span>
              </span>
              <span className="font-mono tabular-nums">
                {formatCount(line.impressions)}
                <span className="ml-3 font-medium">
                  {formatSomAmount(line.priceSom)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <dl className="space-y-2.5 text-[0.9375rem]">
        <Row
          label={o.subtotal}
          value={formatSomAmount(campaign.subtotalSom)}
          mono
        />
        {campaign.discountPercent > 0 && (
          <Row
            label={`${o.discount} ${campaign.discountPercent}%`}
            value={`−${formatSomAmount(
              campaign.subtotalSom - campaign.totalSom,
            )}`}
            mono
          />
        )}
        <div className="flex items-center justify-between gap-4 pt-1">
          <dt className="font-medium">{o.total}</dt>
          <dd>
            <CampaignAmount campaign={campaign} className="text-lg" />
          </dd>
        </div>
      </dl>
    </div>
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
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono tabular-nums" : "text-right"}>
        {value}
      </dd>
    </div>
  );
}

type OrdersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: AdOrder[] };

function Orders({ campaignId }: { campaignId: string }) {
  const t = useT("ads");
  const [state, setState] = React.useState<OrdersState>({ status: "loading" });

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    return getCampaignOrders(campaignId)
      .then((rows) => setState({ status: "ready", rows }))
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "",
        }),
      );
  }, [campaignId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (state.status === "error") {
    return <LoadErrorState message={state.message} onRetry={load} />;
  }

  return (
    <div className="space-y-4">
      {state.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.sheet.orders.empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {state.rows.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-[0.9375rem] font-medium tabular-nums">
                  {formatSomAmount(order.amount)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {order.createdAt ? formatDate(order.createdAt) : "—"}
                  {" · "}
                  {order.provider}
                  {order.transId ? ` · ${order.transId}` : ""}
                </p>
              </div>
              <TransactionStatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
