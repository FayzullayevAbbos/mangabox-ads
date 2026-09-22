"use client";

import * as React from "react";
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiInformationLine,
} from "@remixicon/react";

import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export interface SectionInfoContent {
  title: string;
  purpose: string;
  actions: string[];
  note?: string;
}

const STORAGE_PREFIX = "mangabox-ads:info:";

function readCollapsed(id: string): boolean {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + id) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(id: string, collapsed: boolean) {
  try {
    if (collapsed) window.localStorage.setItem(STORAGE_PREFIX + id, "1");
    else window.localStorage.removeItem(STORAGE_PREFIX + id);
  } catch {}
}

const subscribe = () => () => {};

export function SectionInfo({
  id,
  content,
  className,
}: {
  id: string;
  content: SectionInfoContent;
  className?: string;
}) {
  const t = useT("portal");
  const stored = React.useSyncExternalStore(
    subscribe,
    () => readCollapsed(id),
    () => false,
  );
  const [override, setOverride] = React.useState<boolean | null>(null);
  const collapsed = override ?? stored;
  const bodyId = React.useId();

  const toggle = () => {
    const next = !collapsed;
    setOverride(next);
    writeCollapsed(id, next);
  };

  return (
    <section
      className={cn(
        "rounded-xl border border-primary/15 bg-primary/[0.04] dark:bg-primary/[0.08]",
        className,
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RiInformationLine className="size-5 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 text-[0.9375rem] font-medium">
          {content.title}
        </span>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {collapsed ? t.info.show : t.info.hide}
        </span>
        <RiArrowDownSLine
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            !collapsed && "rotate-180",
          )}
        />
      </button>

      {!collapsed && (
        <div id={bodyId} className="space-y-3 px-4 pb-4 sm:pl-12">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {content.purpose}
          </p>
          {content.actions.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                {t.info.canDo}
              </p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {content.actions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <RiCheckLine className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {content.note && (
            <p className="rounded-lg bg-background/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {content.note}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
