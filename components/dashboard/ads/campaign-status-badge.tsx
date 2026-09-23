"use client";

import {
  RiCheckLine,
  RiCloseLine,
  RiDraftLine,
  RiFlashlightLine,
  RiPauseLine,
  RiTimeLine,
  RiWalletLine,
} from "@remixicon/react";
import type { ComponentType } from "react";

import { useT } from "@/lib/i18n/provider";
import type { AdCampaignStatus } from "@/lib/api/ads";
import { cn } from "@/lib/utils";

const META: Record<
  AdCampaignStatus,
  { className: string; icon: ComponentType<{ className?: string }> }
> = {
  draft: { className: "bg-muted text-muted-foreground", icon: RiDraftLine },
  // Sariq — e'tibor talab qiladigan yagona holat.
  review: {
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: RiTimeLine,
  },
  rejected: {
    className: "bg-destructive/10 text-destructive",
    icon: RiCloseLine,
  },
  approved: {
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: RiWalletLine,
  },
  scheduled: {
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: RiTimeLine,
  },
  active: {
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: RiFlashlightLine,
  },
  paused: { className: "bg-muted text-muted-foreground", icon: RiPauseLine },
  finished: {
    className: "bg-muted/60 text-muted-foreground/70",
    icon: RiCheckLine,
  },
};

export function CampaignStatusBadge({
  status,
  className,
}: {
  status: AdCampaignStatus;
  className?: string;
}) {
  const t = useT("ads");
  const meta = META[status] ?? META.draft;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        meta.className,
        className,
      )}
    >
      {status === "active" ? (
        <span className="live-dot mx-1 size-1.5 rounded-full bg-current" />
      ) : (
        <meta.icon className="size-3.5" />
      )}
      {t.status[status] ?? status}
    </span>
  );
}

const ADVERTISER_META: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  blocked: "bg-destructive/10 text-destructive",
};

export function AdvertiserStatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        ADVERTISER_META[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
