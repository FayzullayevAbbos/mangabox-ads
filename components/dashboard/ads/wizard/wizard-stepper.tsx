"use client";

import { RiCheckLine } from "@remixicon/react";

import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

import { stepIndex, WIZARD_STEPS, type WizardStep } from "./wizard-model";

export function WizardStepper({
  current,
  canOpen,
  onOpen,
}: {
  current: WizardStep;
  canOpen: (step: WizardStep) => boolean;
  onOpen: (step: WizardStep) => void;
}) {
  const w = useT("portal").wizard;
  const at = stepIndex(current);

  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-3">
      {WIZARD_STEPS.map((step, index) => {
        const done = index < at;
        const active = index === at;
        const open = !active && canOpen(step);
        return (
          <li key={step} className="min-w-0">
            <button
              type="button"
              disabled={!open}
              aria-current={active ? "step" : undefined}
              onClick={() => onOpen(step)}
              className={cn(
                "flex w-full flex-col gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
                open ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "h-1 w-full rounded-full transition-colors",
                  done || active ? "bg-primary" : "bg-muted",
                )}
              />
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-primary/15 text-primary ring-2 ring-primary",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <RiCheckLine className="size-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden truncate text-sm font-medium sm:inline",
                    !active && "text-muted-foreground",
                    open && "hover:text-foreground",
                  )}
                >
                  {w.steps[step]}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
