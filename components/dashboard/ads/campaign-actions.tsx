"use client";

import * as React from "react";
import { RiTimeLine } from "@remixicon/react";
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
  setCampaignStart,
  isAwaitingPaymentCheck,
  isPausedByModerator,
  runCampaignAction,
  type AdCampaign,
  type AdCampaignStatus,
  type CampaignAction,
} from "@/lib/api/ads";
import { formatDate } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
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
  // Moderator to'xtatganini faqat moderator yoqadi — mijoz tuzatib yuboradi.
  if (isPausedByModerator(campaign)) return allowed.filter((a) => a !== "resume");
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

  const claim = async (campaign: AdCampaign, startAt: string | null) => {
    if (busy) return;
    setBusy(campaign.id);
    try {
      await setCampaignStart(campaign.id, startAt);
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
          onClaim={(campaign, startAt) => void claim(campaign, startAt)}
          onPaid={onDone}
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
        {shown?.action === "pause" && (
          // Mijoz pauzasi muddatni surmaydi (faqat moderator pauzasi suradi) —
          // to'xtatishdan oldin buni aniq bilsin.
          <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-300">
            <RiTimeLine className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{t.pause.timeWarningTitle}</p>
              <p className="mt-1 text-sm">
                {interpolate(t.pause.timeWarning, {
                  date: formatDate(shown.campaign.endsAt),
                })}
              </p>
            </div>
          </div>
        )}
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
