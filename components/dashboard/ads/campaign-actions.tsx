"use client";

import * as React from "react";
import { toast } from "sonner";

import { PaymentDialog } from "@/components/dashboard/ads/payment-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  claimCardPayment,
  isAwaitingPaymentCheck,
  runCampaignAction,
  startCheckout,
  type AdCampaign,
  type AdCampaignStatus,
  type CampaignAction,
  type PaymentProvider,
} from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";

export type CampaignActionKey =
  | "details"
  | "continue"
  | "pay"
  | "pause"
  | "resume";

const BY_STATUS: Record<AdCampaignStatus, CampaignActionKey[]> = {
  draft: ["continue", "details"],
  review: ["details"],
  rejected: ["continue", "details"],
  approved: ["pay", "details"],
  scheduled: ["pause", "details"],
  active: ["pause", "details"],
  paused: ["resume", "details"],
  finished: ["details"],
};

export function actionsFor(campaign: AdCampaign): CampaignActionKey[] {
  const allowed = BY_STATUS[campaign.status] ?? ["details"];
  const payable =
    campaign.nextAction === "pay" || isAwaitingPaymentCheck(campaign);
  if (campaign.status === "approved" && !payable) {
    return allowed.filter((a) => a !== "pay");
  }
  return allowed;
}

export function useContinueLabel() {
  const p = useT("portal");
  return (campaign: AdCampaign) =>
    campaign.status === "rejected" ? p.actions.fix : p.actions.continue;
}

export function usePayLabel() {
  const p = useT("portal");
  return (campaign: AdCampaign) =>
    isAwaitingPaymentCheck(campaign) ? p.actions.payDetails : p.actions.pay;
}

type CampaignListener = (campaign: AdCampaign) => void;

type ToggleAction = "pause" | "resume";

type PendingToggle = { campaign: AdCampaign; action: ToggleAction };

function optimisticStatus(
  campaign: AdCampaign,
  action: CampaignAction,
): AdCampaignStatus | null {
  if (action === "pause") return "paused";
  if (action === "resume") {
    return new Date(campaign.startsAt).getTime() > Date.now()
      ? "scheduled"
      : "active";
  }
  return null;
}

export function useCampaignActions({
  onDone,
  onPreview,
}: {
  onDone: CampaignListener;
  onPreview?: CampaignListener;
}) {
  const t = useT("ads");
  const p = useT("portal");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState<AdCampaign | null>(null);
  const [confirming, setConfirming] = React.useState<PendingToggle | null>(
    null,
  );

  const TOASTS: Record<CampaignAction, string> = {
    submit: p.toasts.submitted,
    pause: t.toasts.paused,
    resume: t.toasts.resumed,
  };

  const run = async (campaign: AdCampaign, action: CampaignAction) => {
    if (busy) return;
    setBusy(campaign.id);
    const status = optimisticStatus(campaign, action);
    if (status) onPreview?.({ ...campaign, status });
    try {
      const updated = await runCampaignAction(campaign.id, action);
      toast.success(TOASTS[action]);
      onDone(updated);
    } catch (err) {
      if (status) onPreview?.(campaign);
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const claim = async (campaign: AdCampaign) => {
    if (busy) return;
    setBusy(campaign.id);
    try {
      const updated = await claimCardPayment(campaign.id);
      toast.success(p.toasts.paymentClaimed);
      setPaying(updated);
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
    pause: (c: AdCampaign) => setConfirming({ campaign: c, action: "pause" }),
    resume: (c: AdCampaign) =>
      setConfirming({ campaign: c, action: "resume" }),
    askPay: setPaying,
    dialogs: (
      <>
        <PaymentDialog
          campaign={paying}
          busy={busy !== null}
          onClose={() => setPaying(null)}
          onClaim={(campaign) => void claim(campaign)}
          onOnlinePay={(campaign, provider) => void pay(campaign, provider)}
        />
        <ToggleConfirmDialog
          pending={confirming}
          onCancel={() => setConfirming(null)}
          onConfirm={({ campaign, action }) => {
            setConfirming(null);
            void run(campaign, action);
          }}
        />
      </>
    ),
  };
}

function ToggleConfirmDialog({
  pending,
  onCancel,
  onConfirm,
}: {
  pending: PendingToggle | null;
  onCancel: () => void;
  onConfirm: (pending: PendingToggle) => void;
}) {
  const t = useT("ads");
  const [shown, setShown] = React.useState(pending);
  if (pending && pending !== shown) setShown(pending);
  const copy = shown ? t[shown.action] : null;

  return (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy?.title}</DialogTitle>
          <DialogDescription>{copy?.confirm}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.actions.cancel}
          </Button>
          <Button
            type="button"
            variant={shown?.action === "pause" ? "destructive" : "default"}
            onClick={() => pending && onConfirm(pending)}
          >
            {shown ? t.actions[shown.action] : null}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
