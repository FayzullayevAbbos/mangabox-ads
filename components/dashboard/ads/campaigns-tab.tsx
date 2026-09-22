"use client";

import { RiMegaphoneLine } from "@remixicon/react";

import {
  actionsFor,
  useCampaignActions,
} from "@/components/dashboard/ads/campaign-actions";
import {
  CampaignAmount,
  periodLabel,
  slotsLabel,
} from "@/components/dashboard/ads/campaign-format";
import { CampaignStatusBadge } from "@/components/dashboard/ads/campaign-status-badge";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import {
  EmptyResult,
  LoadErrorState,
  TableSkeleton,
} from "@/components/dashboard/page-states";
import { TABLE_BLEED } from "@/components/dashboard/table-bleed";
import { Button } from "@/components/ui/button";
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
  type AdCampaign,
  type AdCampaignStatus,
} from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: AdCampaign[] };

export function CampaignsTab({
  state,
  statusFilter,
  onStatusFilter,
  onCreate,
  onReload,
  onOpen,
  onEdit,
  onChanged,
}: {
  state: State;
  statusFilter: AdCampaignStatus | "all";
  onStatusFilter: (status: AdCampaignStatus | "all") => void;
  onCreate: () => void;
  onReload: () => void;
  onOpen: (campaign: AdCampaign) => void;
  onEdit: (campaign: AdCampaign) => void;
  onChanged: () => void;
}) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const p = useT("portal");
  const actions = useCampaignActions(() => onChanged());
  const rows =
    state.status === "ready"
      ? statusFilter === "all"
        ? state.rows
        : state.rows.filter((c) => c.status === statusFilter)
      : [];

  return (
    <div className="space-y-6">
      <div className="-mx-4 overflow-x-auto px-4 pb-px [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full items-center gap-2">
          <Chip
            label={t.status.all}
            active={statusFilter === "all"}
            onClick={() => onStatusFilter("all")}
          />
          {AD_CAMPAIGN_STATUSES.map((status) => (
            <Chip
              key={status}
              label={t.status[status]}
              active={statusFilter === status}
              onClick={() => onStatusFilter(status)}
            />
          ))}
        </div>
      </div>

      {state.status === "loading" && <TableSkeleton rows={6} />}

      {state.status === "error" && (
        <LoadErrorState message={state.message} onRetry={onReload} />
      )}

      {state.status === "ready" && rows.length === 0 && (
        <EmptyResult
          icon={RiMegaphoneLine}
          title={state.rows.length === 0 ? p.campaigns.emptyTitle : t.campaigns.empty}
          description={state.rows.length === 0 ? p.campaigns.emptyDescription : " "}
          action={
            state.rows.length === 0 ? (
              <Button onClick={onCreate}>{t.actions.create}</Button>
            ) : undefined
          }
        />
      )}

      {state.status === "ready" && rows.length > 0 && (
        <Table
          containerClassName={TABLE_BLEED}
          className="min-w-[56rem] text-[0.9375rem]"
        >
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <Th first>{t.campaigns.columns.name}</Th>
              <Th>{t.campaigns.columns.slots}</Th>
              <Th>{t.campaigns.columns.period}</Th>
              <Th align="right">{t.campaigns.columns.amount}</Th>
              <Th>{t.campaigns.columns.status}</Th>
              <TableHead className="h-11 w-56 px-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((campaign) => {
              const allowed = actionsFor(campaign);
              return (
                <TableRow key={campaign.id} className="border-border">
                  <TableCell className="h-14 max-w-[16rem] px-0 font-medium">
                    <span className="block truncate" title={campaign.name}>
                      {campaign.name}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[18rem] text-sm text-muted-foreground">
                    <span
                      className="block truncate"
                      title={slotsLabel(campaign, labelOf)}
                    >
                      {slotsLabel(campaign, labelOf)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                    {periodLabel(campaign)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <CampaignAmount campaign={campaign} />
                  </TableCell>
                  <TableCell>
                    <CampaignStatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell className="w-56 px-0 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {allowed.includes("submit") && (
                        <Button
                          size="sm"
                          disabled={actions.isBusy(campaign.id)}
                          onClick={() => actions.submit(campaign)}
                        >
                          {p.actions.submit}
                        </Button>
                      )}
                      {allowed.includes("pay") && (
                        <Button
                          size="sm"
                          disabled={actions.isBusy(campaign.id)}
                          onClick={() => actions.askPay(campaign)}
                        >
                          {p.actions.pay}
                        </Button>
                      )}
                      {allowed.includes("pause") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actions.isBusy(campaign.id)}
                          onClick={() => actions.pause(campaign)}
                        >
                          {t.actions.pause}
                        </Button>
                      )}
                      {allowed.includes("resume") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actions.isBusy(campaign.id)}
                          onClick={() => actions.resume(campaign)}
                        >
                          {t.actions.resume}
                        </Button>
                      )}
                      {allowed.includes("edit") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(campaign)}
                        >
                          {t.actions.edit}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpen(campaign)}
                      >
                        {t.actions.details}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {actions.dialogs}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function Th({
  children,
  align = "left",
  first,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  first?: boolean;
}) {
  return (
    <TableHead
      className={cn(
        "h-11 text-sm font-semibold text-foreground",
        align === "right" && "text-right",
        first && "px-0",
      )}
    >
      {children}
    </TableHead>
  );
}
