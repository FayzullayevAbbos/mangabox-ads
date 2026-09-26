"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RiEditLine, RiTimeLine } from "@remixicon/react";
import { toast } from "sonner";

import { setupHref } from "@/components/dashboard/ads/wizard/wizard-links";
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
  renewCampaign,
  renewSkipsReview,
  runCampaignAction,
  startCampaignEdit,
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
  | "resume"
  | "renew";

const BY_STATUS: Record<AdCampaignStatus, CampaignActionKey[]> = {
  draft: ["continue", "details"],
  review: ["details"],
  rejected: ["continue", "details"],
  approved: ["pay", "details"],
  scheduled: ["pause", "details"],
  active: ["pause", "details"],
  paused: ["resume", "details"],
  finished: ["renew", "details"],
};

export function actionsFor(campaign: AdCampaign): CampaignActionKey[] {
  const allowed = BY_STATUS[campaign.status] ?? ["details"];
  const payable =
    campaign.nextAction === "pay" || isAwaitingPaymentCheck(campaign);
  if (campaign.status === "approved" && !payable) {
    return allowed.filter((a) => a !== "pay");
  }
  // Moderator to'xtatganini faqat moderator yoqadi — mijoz tuzatib yuboradi.
  // Tahrirda banner o'zgargan bo'lsa ham — o'zgarish moderatsiyadan o'tadi.
  if (isPausedByModerator(campaign) || campaign.editedAt) {
    return allowed.filter((a) => a !== "resume");
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
  initialPay = null,
}: {
  onDone: CampaignListener;
  onPreview?: CampaignListener;
  /** "Qayta efirga chiqarish" dan keyin to'lov oynasi darhol ochilsin. */
  initialPay?: AdCampaign | null;
}) {
  const t = useT("ads");
  const p = useT("portal");
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState<AdCampaign | null>(initialPay);
  const [confirming, setConfirming] = React.useState<PendingToggle | null>(
    null,
  );
  const [choosing, setChoosing] = React.useState<AdCampaign | null>(null);
  const [renewing, setRenewing] = React.useState<AdCampaign | null>(null);

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

  // Tahrir rejimi: tugash sanasi o'zgarmaydi, bannerlar tabiga o'tiladi.
  const edit = async (campaign: AdCampaign) => {
    if (busy) return;
    setBusy(campaign.id);
    try {
      const updated = await startCampaignEdit(campaign.id);
      setChoosing(null);
      onDone(updated);
      router.push(`/dashboard/campaigns/${campaign.id}?tab=creatives`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  // Nusxa to'lovga tayyor bo'lsa — to'lov oynasi bilan ochiladi, aks holda
  // (tahrir yoki moderatsiya kerak) banner qadamiga o'tiladi.
  const renew = async (campaign: AdCampaign, withEdit: boolean) => {
    if (busy) return;
    setBusy(campaign.id);
    try {
      const created = await renewCampaign(campaign.id, withEdit);
      toast.success(p.renew.created);
      setRenewing(null);
      router.push(
        created.nextAction === "pay"
          ? `/dashboard/campaigns/${created.id}?pay=1`
          : setupHref(created.id),
      );
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
    // O'zi to'xtatgan reklamani yoqishdan oldin tahrirlash taklif qilinadi.
    resume: (c: AdCampaign) =>
      c.pausedBy === "advertiser" && !c.editStartedAt
        ? setChoosing(c)
        : setConfirming({ campaign: c, action: "resume" }),
    renew: setRenewing,
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
        <ResumeChoiceDialog
          campaign={choosing}
          busy={busy !== null}
          onCancel={() => setChoosing(null)}
          onEdit={(campaign) => void edit(campaign)}
          onResume={(campaign) => {
            setChoosing(null);
            void run(campaign, "resume");
          }}
        />
        <RenewDialog
          campaign={renewing}
          busy={busy !== null}
          onCancel={() => setRenewing(null)}
          onRenew={(campaign, withEdit) => void renew(campaign, withEdit)}
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

/** O'zi to'xtatgan reklamani yoqish: tahrirlab (moderatsiya) yoki shundayligicha. */
function ResumeChoiceDialog({
  campaign,
  busy,
  onCancel,
  onEdit,
  onResume,
}: {
  campaign: AdCampaign | null;
  busy: boolean;
  onCancel: () => void;
  onEdit: (campaign: AdCampaign) => void;
  onResume: (campaign: AdCampaign) => void;
}) {
  const r = useT("portal").resumeChoice;
  const [shown, setShown] = React.useState(campaign);
  if (campaign && campaign !== shown) setShown(campaign);

  return (
    <Dialog open={campaign !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{r.title}</DialogTitle>
          <DialogDescription>{r.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-lg bg-muted/60 px-4 py-3 text-sm">
            <RiEditLine className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>{r.editNote}</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <RiTimeLine className="mt-0.5 size-4 shrink-0" />
            <p>
              {shown &&
                interpolate(r.endDate, { date: formatDate(shown.endsAt) })}
            </p>
          </div>
          {shown?.creatives.some((creative) => creative.pendingReview) && (
            <p className="px-1 text-sm text-muted-foreground">{r.pendingNote}</p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => campaign && onEdit(campaign)}
          >
            {busy ? r.opening : r.edit}
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => campaign && onResume(campaign)}
          >
            {r.resumeAsIs}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Tugagan reklamani qayta chiqarish: shundayligicha (to'lov) yoki tahrirlab. */
function RenewDialog({
  campaign,
  busy,
  onCancel,
  onRenew,
}: {
  campaign: AdCampaign | null;
  busy: boolean;
  onCancel: () => void;
  onRenew: (campaign: AdCampaign, withEdit: boolean) => void;
}) {
  const r = useT("portal").renew;
  const [shown, setShown] = React.useState(campaign);
  if (campaign && campaign !== shown) setShown(campaign);
  const fast = shown ? renewSkipsReview(shown) : true;

  return (
    <Dialog open={campaign !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{r.title}</DialogTitle>
          <DialogDescription>
            {shown && interpolate(r.description, { days: shown.days })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p
            className={
              fast
                ? "rounded-lg bg-muted/60 px-4 py-3"
                : "rounded-lg bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-300"
            }
          >
            {fast ? r.fast : r.review}
          </p>
          <p className="text-muted-foreground">{r.editNote}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => campaign && onRenew(campaign, true)}
          >
            {r.edit}
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => campaign && onRenew(campaign, false)}
          >
            {busy ? r.creating : fast ? r.pay : r.action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
