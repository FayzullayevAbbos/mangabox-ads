"use client";

import * as React from "react";
import { RiAddLine, RiTimeLine } from "@remixicon/react";

import {
  CampaignFormSheet,
  type CampaignFormTarget,
} from "@/components/dashboard/ads/campaign-form-sheet";
import { CampaignSheet } from "@/components/dashboard/ads/campaign-sheet";
import { CampaignsTab } from "@/components/dashboard/ads/campaigns-tab";
import { RateCardProvider } from "@/components/dashboard/ads/rate-card-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionInfo } from "@/components/dashboard/section-info";
import { Button } from "@/components/ui/button";
import {
  getCampaigns,
  type AdCampaign,
  type AdCampaignStatus,
  type Advertiser,
} from "@/lib/api/ads";
import { getAdvertiser } from "@/lib/api/portal-auth";
import { formatCount, formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: AdCampaign[] };

const LIVE_STATUSES: AdCampaignStatus[] = ["active", "scheduled"];

export default function DashboardPage() {
  return (
    <RateCardProvider>
      <CampaignsPage />
    </RateCardProvider>
  );
}

function CampaignsPage() {
  const t = useT("ads");
  const p = useT("portal");

  const [campaigns, setCampaigns] = React.useState<ListState>({
    status: "loading",
  });
  const [account, setAccount] = React.useState<Advertiser | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<
    AdCampaignStatus | "all"
  >("all");
  const [openCampaignId, setOpenCampaignId] = React.useState<string | null>(
    null,
  );
  const [formTarget, setFormTarget] = React.useState<CampaignFormTarget>(null);

  const load = React.useCallback(() => {
    setCampaigns({ status: "loading" });
    return getCampaigns()
      .then((rows) => setCampaigns({ status: "ready", rows }))
      .catch((err: unknown) =>
        setCampaigns({
          status: "error",
          message: err instanceof Error ? err.message : "",
        }),
      );
  }, []);

  React.useEffect(() => {
    void load();
    getAdvertiser()
      .then(setAccount)
      .catch(() => setAccount(null));
  }, [load]);

  const rows = campaigns.status === "ready" ? campaigns.rows : [];
  const totals = rows.reduce(
    (acc, campaign) => {
      if (LIVE_STATUSES.includes(campaign.status)) acc.live += 1;
      if (campaign.paidAt) acc.spent += campaign.totalSom;
      for (const creative of campaign.creatives) {
        acc.impressions += creative.impressions;
        acc.clicks += creative.clicks;
      }
      return acc;
    },
    { live: 0, spent: 0, impressions: 0, clicks: 0 },
  );
  const ctr = totals.impressions
    ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%`
    : "—";

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8">
      <PageHeader
        title={p.home.title}
        description={p.home.description}
        action={
          <Button
            className="w-full sm:w-auto"
            onClick={() => setFormTarget("new")}
          >
            <RiAddLine className="size-4" />
            {t.actions.create}
          </Button>
        }
      />

      <SectionInfo id="campaigns" content={p.info.sections.campaigns} />

      {account?.status === "pending" && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <RiTimeLine className="mt-0.5 size-4 shrink-0" />
          <p>{p.home.pendingAccount}</p>
        </div>
      )}

      {campaigns.status === "ready" && rows.length > 0 && (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          <Stat label={p.home.stats.live} value={formatCount(totals.live)} />
          <Stat
            label={p.home.stats.impressions}
            value={formatCount(totals.impressions)}
          />
          <Stat
            label={p.home.stats.clicks}
            value={formatCount(totals.clicks)}
            hint={ctr}
          />
          <Stat
            label={p.home.stats.spent}
            value={formatSomAmount(totals.spent)}
          />
        </dl>
      )}

      <CampaignsTab
        state={campaigns}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        onCreate={() => setFormTarget("new")}
        onReload={load}
        onOpen={(campaign) => setOpenCampaignId(campaign.id)}
        onEdit={(campaign) => setFormTarget(campaign)}
        onChanged={load}
      />

      <CampaignSheet
        campaignId={openCampaignId}
        onClose={() => setOpenCampaignId(null)}
        onChanged={load}
        onEdit={(campaign) => {
          setOpenCampaignId(null);
          setFormTarget(campaign);
        }}
      />

      <CampaignFormSheet
        target={formTarget}
        onClose={() => setFormTarget(null)}
        onSaved={() => {
          setFormTarget(null);
          void load();
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-card px-4 py-4 sm:px-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-2 font-mono tabular-nums">
        <span className="text-lg font-semibold sm:text-xl">{value}</span>
        {hint && (
          <span className="text-sm text-muted-foreground">{hint}</span>
        )}
      </dd>
    </div>
  );
}
