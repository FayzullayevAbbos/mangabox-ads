"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PAYMENT_PROVIDERS,
  runCampaignAction,
  startCheckout,
  type AdCampaign,
  type AdCampaignStatus,
  type CampaignAction,
  type PaymentProvider,
} from "@/lib/api/ads";
import { formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export type CampaignActionKey =
  | "details"
  | "edit"
  | "submit"
  | "pay"
  | "pause"
  | "resume";

const BY_STATUS: Record<AdCampaignStatus, CampaignActionKey[]> = {
  draft: ["submit", "edit", "details"],
  review: ["details"],
  rejected: ["submit", "edit", "details"],
  approved: ["pay", "details"],
  scheduled: ["pause", "details"],
  active: ["pause", "details"],
  paused: ["resume", "details"],
  finished: ["details"],
};

export function actionsFor(campaign: AdCampaign): CampaignActionKey[] {
  const allowed = BY_STATUS[campaign.status] ?? ["details"];
  if (campaign.status === "approved" && campaign.nextAction !== "pay") {
    return allowed.filter((a) => a !== "pay");
  }
  return allowed;
}

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  payme: "Payme",
  click: "Click",
  uzum: "Uzum Bank",
  paynet: "Paynet",
};

export function useCampaignActions(onDone: (campaign: AdCampaign) => void) {
  const t = useT("ads");
  const p = useT("portal");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState<AdCampaign | null>(null);

  const TOASTS: Record<CampaignAction, string> = {
    submit: p.toasts.submitted,
    pause: t.toasts.paused,
    resume: t.toasts.resumed,
  };

  const run = async (campaign: AdCampaign, action: CampaignAction) => {
    if (busy) return;
    setBusy(campaign.id);
    try {
      const updated = await runCampaignAction(campaign.id, action);
      toast.success(TOASTS[action]);
      onDone(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const pay = async (campaign: AdCampaign, provider: PaymentProvider) => {
    if (busy) return;
    setBusy(campaign.id);
    try {
      const session = await startCheckout(campaign.id, provider);
      if (session.paymentUrl) {
        window.location.assign(session.paymentUrl);
        return;
      }
      toast.info(session.instructions);
      setBusy(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setBusy(null);
    }
  };

  return {
    busy,
    isBusy: (id: string) => busy === id,
    submit: (c: AdCampaign) => void run(c, "submit"),
    pause: (c: AdCampaign) => void run(c, "pause"),
    resume: (c: AdCampaign) => void run(c, "resume"),
    askPay: setPaying,
    dialogs: (
      <Dialog
        open={paying !== null}
        onOpenChange={(open) => !open && !busy && setPaying(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{p.pay.title}</DialogTitle>
            <DialogDescription>
              {paying ? `${paying.name} · ${formatSomAmount(paying.totalSom)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_PROVIDERS.map((provider) => (
              <button
                key={provider}
                type="button"
                disabled={busy !== null}
                onClick={() => paying && void pay(paying, provider)}
                className={cn(
                  "h-14 cursor-pointer rounded-lg border border-border bg-background text-[0.9375rem] font-medium transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {PROVIDER_LABELS[provider]}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{p.pay.hint}</p>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => setPaying(null)}
            >
              {t.actions.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    ),
  };
}
