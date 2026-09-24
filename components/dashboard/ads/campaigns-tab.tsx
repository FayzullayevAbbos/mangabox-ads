"use client";

import {
  RiEyeLine,
  RiMegaphoneLine,
  RiMore2Fill,
} from "@remixicon/react";
import Link from "next/link";

import {
  actionsFor,
  useCampaignActions,
  useContinueLabel,
  usePayLabel,
} from "@/components/dashboard/ads/campaign-actions";
import {
  usePeriodText,
  slotsLabel,
} from "@/components/dashboard/ads/campaign-format";
import { CampaignStatusBadge } from "@/components/dashboard/ads/campaign-status-badge";
import { Panel } from "@/components/dashboard/ads/panel";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { setupHref } from "@/components/dashboard/ads/wizard/wizard-links";
import {
  EmptyResult,
  LoadErrorState,
  TableSkeleton,
} from "@/components/dashboard/page-states";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AD_CAMPAIGN_STATUSES,
  isAwaitingPaymentCheck,
  type AdCampaign,
  type AdCampaignStatus,
} from "@/lib/api/ads";
import { formatCount, formatSomAmount } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: AdCampaign[] };

type Actions = ReturnType<typeof useCampaignActions>;

type RowProps = {
  campaign: AdCampaign;
  actions: Actions;
  onOpen: (campaign: AdCampaign) => void;
};

export function CampaignsTab({
  state,
  statusFilter,
  onStatusFilter,
  onCreate,
  onReload,
  onOpen,
  onChanged,
  onPreview,
}: {
  state: State;
  statusFilter: AdCampaignStatus | "all";
  onStatusFilter: (status: AdCampaignStatus | "all") => void;
  onCreate: () => void;
  onReload: () => void;
  onOpen: (campaign: AdCampaign) => void;
  onChanged: (campaign: AdCampaign) => void;
  onPreview: (campaign: AdCampaign) => void;
}) {
  const t = useT("ads");
  const p = useT("portal");
  const actions = useCampaignActions({ onDone: onChanged, onPreview });
  const rows =
    state.status === "ready"
      ? statusFilter === "all"
        ? state.rows
        : state.rows.filter((c) => c.status === statusFilter)
      : [];
  const counts = countByStatus(state.status === "ready" ? state.rows : []);
  const cols = t.campaigns.columns;

  return (
    <div className="space-y-5">
      <div className="-mx-4 overflow-x-auto px-4 pb-px [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full items-center gap-2">
          <Chip
            label={t.status.all}
            count={counts.all}
            active={statusFilter === "all"}
            onClick={() => onStatusFilter("all")}
          />
          {AD_CAMPAIGN_STATUSES.map((status) => (
            <Chip
              key={status}
              label={t.status[status]}
              count={counts[status]}
              active={statusFilter === status}
              onClick={() => onStatusFilter(status)}
            />
          ))}
        </div>
      </div>

      {state.status === "loading" && (
        <Panel bodyClassName="px-5">
          <TableSkeleton rows={6} />
        </Panel>
      )}

      {state.status === "error" && (
        <Panel>
          <LoadErrorState message={state.message} onRetry={onReload} />
        </Panel>
      )}

      {state.status === "ready" && rows.length === 0 && (
        <Panel>
          <EmptyResult
            icon={RiMegaphoneLine}
            title={
              state.rows.length === 0
                ? p.campaigns.emptyTitle
                : t.campaigns.empty
            }
            description={
              state.rows.length === 0 ? p.campaigns.emptyDescription : " "
            }
            action={
              state.rows.length === 0 ? (
                <Button onClick={onCreate}>{t.actions.create}</Button>
              ) : undefined
            }
          />
        </Panel>
      )}

      {state.status === "ready" && rows.length > 0 && (
        <>
          <Panel className="hidden xl:block">
            <Table className="table-fixed text-[0.9375rem]">
              <colgroup>
                <col />
                <col className="w-[11.5rem]" />
                <col className="w-[9rem]" />
                <col className="w-[11.5rem]" />
                <col className="w-[14.5rem]" />
              </colgroup>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <Th className="pl-5">{cols.name}</Th>
                  <Th>{cols.period}</Th>
                  <Th className="text-right">{cols.amount}</Th>
                  <Th className="pl-6">{cols.status}</Th>
                  <TableHead className="h-11" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((campaign) => (
                  <CampaignTableRow
                    key={campaign.id}
                    campaign={campaign}
                    actions={actions}
                    onOpen={onOpen}
                  />
                ))}
              </TableBody>
            </Table>
          </Panel>

          <ul className="-mx-4 divide-y divide-border border-y border-border bg-card sm:mx-0 sm:rounded-xl sm:border xl:hidden">
            {rows.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                actions={actions}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </>
      )}

      {actions.dialogs}
    </div>
  );
}

function CampaignTableRow({ campaign, actions, onOpen }: RowProps) {
  return (
    <TableRow
      className="group cursor-pointer border-border transition-colors hover:bg-muted/40"
      onClick={() => onOpen(campaign)}
    >
      <TableCell className="py-4 pl-5">
        <NameBlock campaign={campaign} />
      </TableCell>
      <TableCell className="py-4">
        <PeriodBlock campaign={campaign} />
      </TableCell>
      <TableCell className="py-4 text-right">
        <AmountBlock campaign={campaign} />
      </TableCell>
      <TableCell className="py-4 pl-6">
        <StatusBlock campaign={campaign} />
      </TableCell>
      <TableCell className="py-4 pr-5" onClick={(e) => e.stopPropagation()}>
        <RowActions campaign={campaign} actions={actions} />
      </TableCell>
    </TableRow>
  );
}

function CampaignCard({ campaign, actions, onOpen }: RowProps) {
  return (
    <li
      className="cursor-pointer px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5"
      onClick={() => onOpen(campaign)}
    >
      <div className="flex items-start justify-between gap-3">
        <NameBlock campaign={campaign} className="flex-1" wrap />
        <CampaignStatusBadge status={campaign.status} className="shrink-0" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <PeriodBlock campaign={campaign} />
        <AmountBlock campaign={campaign} className="text-right" />
      </div>

      <DeliveryProgress campaign={campaign} className="mt-3" wide />

      <div
        className="mt-3.5 flex justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <RowActions
          campaign={campaign}
          actions={actions}
          className="w-full sm:w-auto"
        />
      </div>
    </li>
  );
}

function NameBlock({
  campaign,
  className,
  wrap,
}: {
  campaign: AdCampaign;
  className?: string;
  wrap?: boolean;
}) {
  const { labelOf } = useRateCard();
  const slots = slotsLabel(campaign, labelOf);
  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "font-medium transition-colors group-hover:text-primary",
          wrap ? "line-clamp-2 text-pretty" : "truncate",
        )}
        title={campaign.name}
      >
        {campaign.name}
      </p>
      <p
        className={cn(
          "mt-1 text-sm text-muted-foreground",
          wrap ? "line-clamp-2" : "truncate",
        )}
        title={slots}
      >
        {slots}
      </p>
    </div>
  );
}

function PeriodBlock({ campaign }: { campaign: AdCampaign }) {
  const periodText = usePeriodText();
  const t = useT("ads");
  return (
    <div className="min-w-0">
      <p className="text-sm whitespace-nowrap">{periodText(campaign)}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {interpolate(t.sheet.overview.days, { days: campaign.days })}
      </p>
    </div>
  );
}

function AmountBlock({
  campaign,
  className,
}: {
  campaign: AdCampaign;
  className?: string;
}) {
  const discounted = campaign.discountPercent > 0;
  return (
    <div className={cn("font-mono tabular-nums", className)}>
      <p className="font-medium whitespace-nowrap">
        {formatSomAmount(campaign.totalSom)}
      </p>
      {discounted && (
        <p className="mt-1 text-xs whitespace-nowrap text-muted-foreground">
          <span className="line-through">
            {formatSomAmount(campaign.subtotalSom)}
          </span>
          <span className="ml-1.5 text-success">
            −{campaign.discountPercent}%
          </span>
        </p>
      )}
    </div>
  );
}

function StatusBlock({ campaign }: { campaign: AdCampaign }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <CampaignStatusBadge status={campaign.status} />
      <DeliveryProgress campaign={campaign} />
    </div>
  );
}

const PRIMARY_ORDER = ["continue", "pay", "resume", "pause"] as const;

function RowActions({
  campaign,
  actions,
  className,
}: Omit<RowProps, "onOpen"> & { className?: string }) {
  const t = useT("ads");
  const allowed = actionsFor(campaign);
  const primary = PRIMARY_ORDER.find((key) => allowed.includes(key));
  const busy = actions.isBusy(campaign.id);
  const payLabel = usePayLabel();
  const continueLabel = useContinueLabel();
  const secondary =
    primary === "pause" ||
    (primary === "pay" && isAwaitingPaymentCheck(campaign));

  const primaryButton =
    primary === "continue" ? (
      <Button asChild size="sm" className="flex-1 sm:flex-none">
        <Link href={setupHref(campaign.id)}>{continueLabel(campaign)}</Link>
      </Button>
    ) : (
      primary && (
        <Button
          size="sm"
          variant={secondary ? "outline" : "default"}
          disabled={busy}
          className="flex-1 sm:flex-none"
          onClick={() => {
            if (primary === "pay") actions.askPay(campaign);
            else if (primary === "resume") actions.resume(campaign);
            else actions.pause(campaign);
          }}
        >
          {primary === "pay" && payLabel(campaign)}
          {primary === "resume" && t.actions.resume}
          {primary === "pause" && t.actions.pause}
        </Button>
      )
    );

  return (
    <div className={cn("flex items-center justify-end gap-1.5", className)}>
      {primaryButton}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t.actions.more}
            className="shrink-0 text-muted-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
          >
            <RiMore2Fill className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-44">
          <DropdownMenuItem asChild className="gap-2">
            <Link href={`/dashboard/campaigns/${campaign.id}`}>
              <RiEyeLine className="size-4" />
              {t.actions.details}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const DELIVERING: AdCampaignStatus[] = ["active", "paused", "finished"];

function countByStatus(
  rows: AdCampaign[],
): Record<AdCampaignStatus | "all", number> {
  const counts = Object.fromEntries(
    AD_CAMPAIGN_STATUSES.map((status) => [status, 0]),
  ) as Record<AdCampaignStatus | "all", number>;
  counts.all = rows.length;
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

function deliveredOf(campaign: AdCampaign): number {
  return campaign.creatives.reduce((sum, c) => sum + c.impressions, 0);
}

function DeliveryProgress({
  campaign,
  className,
  wide,
}: {
  campaign: AdCampaign;
  className?: string;
  wide?: boolean;
}) {
  if (!DELIVERING.includes(campaign.status) || !campaign.impressionsGoal) {
    return null;
  }
  const delivered = deliveredOf(campaign);
  const percent = Math.min(
    100,
    Math.round((delivered / campaign.impressionsGoal) * 100),
  );
  const live = campaign.status === "active";
  return (
    <div
      className={cn("w-full", !wide && "max-w-[10rem]", className)}
      title={`${formatCount(delivered)} / ${formatCount(campaign.impressionsGoal)}`}
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            live ? "bg-success" : "bg-muted-foreground/60",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1.5 flex justify-between gap-2 font-mono text-xs text-muted-foreground tabular-nums">
        <span className="text-foreground">{percent}%</span>
        <span>
          {formatCount(delivered)} / {formatCount(campaign.impressionsGoal)}
        </span>
      </p>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
        !active && count === 0 && "opacity-60",
      )}
    >
      {label}
      <span
        className={cn(
          "min-w-5 rounded px-1 text-center font-mono text-xs tabular-nums",
          active ? "bg-primary-foreground/15" : "bg-background/60",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableHead
      className={cn("h-11 text-sm font-semibold text-foreground", className)}
    >
      {children}
    </TableHead>
  );
}
