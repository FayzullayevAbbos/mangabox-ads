"use client";

import {
  RiCheckLine,
  RiCloseLine,
  RiProhibitedLine,
  RiRefund2Line,
  RiTimeLine,
} from "@remixicon/react";
import type { ComponentType } from "react";

import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type BadgeKey =
  | "created"
  | "pending"
  | "paid"
  | "cancelled"
  | "failed"
  | "expired"
  | "refunded";

const EXPIRED_REASON = "expired";

const STATUS_META: Record<
  BadgeKey,
  { className: string; icon: ComponentType<{ className?: string }> }
> = {
  created: {
    className: "bg-muted text-muted-foreground",
    icon: RiTimeLine,
  },
  pending: {
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
    icon: RiTimeLine,
  },
  paid: {
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: RiCheckLine,
  },
  cancelled: {
    className: "bg-destructive/10 text-destructive",
    icon: RiCloseLine,
  },
  failed: {
    className: "bg-destructive/10 text-destructive",
    icon: RiCloseLine,
  },
  expired: {
    className: "bg-muted text-muted-foreground",
    icon: RiProhibitedLine,
  },
  refunded: {
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: RiRefund2Line,
  },
};

export function TransactionStatusBadge({
  status,
  cancelReason,
  className,
}: {
  status: string;
  cancelReason?: string | null;
  className?: string;
}) {
  const t = useT("chrome");
  const key = (
    status === "cancelled" && cancelReason === EXPIRED_REASON
      ? "expired"
      : status
  ) as BadgeKey;
  const meta = STATUS_META[key] ?? STATUS_META.created;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <meta.icon className="size-3.5" />
      {t.transactionStatus[key] ?? t.transactionStatus.created}
    </span>
  );
}
