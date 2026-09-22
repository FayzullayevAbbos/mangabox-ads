"use client";

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiErrorWarningLine,
  RiInboxLine,
  RiRefreshLine,
} from "@remixicon/react";
import type { ComponentType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";

/**
 * Analitika sahifalari uchun umumiy holatlar: xato, bo'shlik, skeleton va
 * sahifalash. Har bir sahifada takrorlanmasin uchun bir joyda.
 */

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function LoadErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const c = useT("common");
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12">
          <RiErrorWarningLine className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{c.states.errorTitle}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onRetry}>
          <RiRefreshLine className="size-4" />
          {c.actions.retry}
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function EmptyResult({
  title,
  description,
  icon: Icon = RiInboxLine,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
}) {
  const c = useT("common");
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12">
          <Icon className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{title ?? c.states.emptyTitle}</EmptyTitle>
        <EmptyDescription>
          {description ?? c.states.emptyDescription}
        </EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

// Tor ekranda o'rtadagi ustunlar tushib qoladi — skeleton haqiqiy jadval kabi
// gorizontal toshib ketmasligi kerak.
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24 sm:w-32" />
          </div>
          <Skeleton className="hidden h-4 w-24 lg:block" />
          <Skeleton className="hidden h-6 w-20 rounded-md sm:block" />
          <Skeleton className="h-4 w-16 shrink-0 sm:w-24" />
        </div>
      ))}
    </div>
  );
}

export function Pagination({
  meta,
  page,
  onPage,
  fallbackCount = 0,
}: {
  meta?: PageMeta;
  page: number;
  onPage: (page: number) => void;
  fallbackCount?: number;
}) {
  const c = useT("common");
  const total = meta?.total ?? fallbackCount;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-sm text-muted-foreground">
        {interpolate(c.pagination.count, { count: total })}
        {totalPages > 1
          ? interpolate(c.pagination.pageSuffix, { page, total: totalPages })
          : ""}
      </p>
      {totalPages > 1 && (
        // Mobilda tugmalar qatorni to'ldiradi va barmoq uchun 40px balandlikda.
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 sm:h-8 sm:flex-none"
            disabled={page === 1}
            onClick={() => onPage(Math.max(1, page - 1))}
          >
            <RiArrowLeftSLine className="size-4" />
            {c.pagination.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 sm:h-8 sm:flex-none"
            disabled={page >= totalPages}
            onClick={() => onPage(Math.min(totalPages, page + 1))}
          >
            {c.pagination.next}
            <RiArrowRightSLine className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
