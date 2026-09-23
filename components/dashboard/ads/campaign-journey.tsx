"use client";

import { RiCheckLine } from "@remixicon/react";

import type { AdCampaign, AdCampaignStatus } from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const STEPS = ["create", "review", "pay", "live"] as const;
type StepKey = (typeof STEPS)[number];
type StepState = "done" | "current" | "upcoming";

const CURRENT_STEP: Partial<Record<AdCampaignStatus, StepKey>> = {
  draft: "create",
  review: "review",
};

export function showsJourney(campaign: AdCampaign): boolean {
  return campaign.status in CURRENT_STEP;
}

function stateOf(step: StepKey, current: StepKey): StepState {
  const diff = STEPS.indexOf(step) - STEPS.indexOf(current);
  if (diff < 0) return "done";
  return diff > 0 ? "upcoming" : "current";
}

export function CampaignJourney({ campaign }: { campaign: AdCampaign }) {
  const j = useT("portal").journey;
  const current = CURRENT_STEP[campaign.status];
  if (!current) return null;

  return (
    <section
      aria-label={j.title}
      className="rounded-xl border border-border bg-card px-5 py-4"
    >
      <h2 className="text-sm font-semibold">{j.title}</h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-4 sm:gap-3">
        {STEPS.map((step, index) => {
          const state = stateOf(step, current);
          return (
            <li key={step} className="relative flex gap-3 sm:flex-col sm:gap-2">
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-7 bottom-[-1rem] left-3 w-px sm:top-3 sm:right-[-0.75rem] sm:bottom-auto sm:left-9 sm:h-px sm:w-auto",
                    state === "done" ? "bg-primary/40" : "bg-border",
                  )}
                />
              )}
              <StepMarker index={index + 1} state={state} />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    state === "upcoming" && "text-muted-foreground",
                  )}
                >
                  {j[step].title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {j[step].text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StepMarker({ index, state }: { index: number; state: StepState }) {
  return (
    <span
      className={cn(
        "relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        state === "done" && "bg-primary text-primary-foreground",
        state === "current" && "bg-primary/15 text-primary ring-2 ring-primary",
        state === "upcoming" && "bg-muted text-muted-foreground",
      )}
    >
      {state === "done" ? <RiCheckLine className="size-3.5" /> : index}
    </span>
  );
}
