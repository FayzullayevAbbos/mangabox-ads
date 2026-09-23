"use client";

import * as React from "react";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiTelegram2Fill,
  RiTimeLine,
} from "@remixicon/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PROVIDER_LABELS } from "@/components/dashboard/ads/payment-provider";
import { usePaymentMethods } from "@/components/dashboard/ads/use-payment-methods";
import {
  PAYMENT_PROVIDERS,
  isAwaitingPaymentCheck,
  type AdCampaign,
  type CardPaymentDetails,
  type PaymentProvider,
} from "@/lib/api/ads";
import { formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";
import { interpolate } from "@/lib/i18n/interpolate";

type PayCopy = ReturnType<typeof useT<"portal">>["pay"];

const SHOW_CARD_DETAILS = false;

export function formatCardNumber(value: string): string {
  return value.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function telegramLink(
  username: string,
  campaign: AdCampaign,
  template: string,
  currency: string,
): string {
  const text = interpolate(template, {
    name: campaign.name,
    amount: `${formatSomAmount(campaign.totalSom)} ${currency}`,
    id: campaign.id,
  });
  return `https://t.me/${username}?text=${encodeURIComponent(text)}`;
}

function useCopy(copiedLabel: string) {
  const [copied, setCopied] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(copiedLabel);
    } catch {
      setCopied(null);
    }
  };
  return { copied, copy };
}

export function PaymentDialog({
  campaign,
  busy,
  onClose,
  onClaim,
  onOnlinePay,
}: {
  campaign: AdCampaign | null;
  busy: boolean;
  onClose: () => void;
  onClaim: (campaign: AdCampaign) => void;
  onOnlinePay: (campaign: AdCampaign, provider: PaymentProvider) => void;
}) {
  const p = useT("portal");
  const t = useT("ads");
  const state = usePaymentMethods(campaign !== null);
  const { copied, copy } = useCopy(p.pay.copied);
  const currency = t.rateCard.currency;

  return (
    <Dialog open={campaign !== null} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-lg">
        {campaign && (
          <>
            <DialogHeader>
              <DialogTitle>{p.pay.title}</DialogTitle>
              <DialogDescription className="break-words">{campaign.name}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg bg-muted/60 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">{p.pay.amount}</p>
                <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
                  {formatSomAmount(campaign.totalSom)}{" "}
                  <span className="text-base font-medium text-muted-foreground">
                    {currency}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copy("amount", String(campaign.totalSom))}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                {copied === "amount" ? (
                  <RiCheckLine className="size-3.5 text-success" />
                ) : (
                  <RiFileCopyLine className="size-3.5" />
                )}
                {p.pay.copy}
              </button>
            </div>

            {state.status === "loading" && (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {state.status === "error" && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            {state.status === "ready" && (
              <PaymentBody
                campaign={campaign}
                card={state.methods.card}
                online={state.methods.online}
                busy={busy}
                copy={p.pay}
                copied={copied}
                onCopy={copy}
                currency={currency}
                onClose={onClose}
                onClaim={onClaim}
                onOnlinePay={onOnlinePay}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentBody({
  campaign,
  card,
  online,
  busy,
  copy: c,
  copied,
  onCopy,
  currency,
  onClose,
  onClaim,
  onOnlinePay,
}: {
  campaign: AdCampaign;
  card: CardPaymentDetails | null;
  online: boolean;
  busy: boolean;
  copy: PayCopy;
  copied: string | null;
  onCopy: (key: string, value: string) => Promise<void>;
  currency: string;
  onClose: () => void;
  onClaim: (campaign: AdCampaign) => void;
  onOnlinePay: (campaign: AdCampaign, provider: PaymentProvider) => void;
}) {
  const claimed = isAwaitingPaymentCheck(campaign);
  const telegram = card?.telegram
    ? telegramLink(card.telegram, campaign, c.telegramMessage, currency)
    : null;

  const contact = card?.telegram
    ? telegramLink(card.telegram, campaign, c.contactMessage, currency)
    : null;

  const telegramButton = (href: string | null) =>
    href && (
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <a href={href} target="_blank" rel="noreferrer">
          <RiTelegram2Fill className="text-[#229ED9]" />
          {c.openTelegram}
        </a>
      </Button>
    );

  if (claimed) {
    return (
      <>
        <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-300">
          <RiTimeLine className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{c.claimedTitle}</p>
            <p className="mt-1 text-sm">{c.claimedText}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            {c.close}
          </Button>
          {telegramButton(telegram)}
        </div>
      </>
    );
  }

  return (
    <>
      {card && SHOW_CARD_DETAILS ? (
        <ol className="space-y-5">
          <Step index={1} title={c.step1Title} text={c.step1Text}>
            <CardDetails card={card} copy={c} copied={copied} onCopy={onCopy} />
          </Step>
          <Step index={2} title={c.step2Title} text={c.step2Text}>
            {telegram && <div className="mt-3">{telegramButton(telegram)}</div>}
          </Step>
          <Step index={3} title={c.step3Title} text={c.step3Text} />
        </ol>
      ) : card ? (
        <ol className="space-y-5">
          <Step index={1} title={c.contactTitle} text={c.contactText}>
            {contact && <div className="mt-3">{telegramButton(contact)}</div>}
          </Step>
          <Step index={2} title={c.receiptTitle} text={c.receiptText} />
          <Step index={3} title={c.step3Title} text={c.step3Text} />
        </ol>
      ) : (
        <p className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          {c.unavailable}
        </p>
      )}

      {online && (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium">{c.onlineTitle}</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_PROVIDERS.map((provider) => (
              <button
                key={provider}
                type="button"
                disabled={busy}
                onClick={() => onOnlinePay(campaign, provider)}
                className="h-12 cursor-pointer rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {PROVIDER_LABELS[provider]}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{c.hint}</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" disabled={busy} onClick={onClose}>
          {c.close}
        </Button>
        {card && (
          <Button disabled={busy} onClick={() => onClaim(campaign)}>
            {busy ? c.claiming : c.claim}
          </Button>
        )}
      </div>
    </>
  );
}

function CardDetails({
  card,
  copy: c,
  copied,
  onCopy,
}: {
  card: CardPaymentDetails;
  copy: PayCopy;
  copied: string | null;
  onCopy: (key: string, value: string) => Promise<void>;
}) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs text-muted-foreground">{c.cardNumber}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="font-mono text-lg font-semibold tracking-wider tabular-nums sm:text-xl">
          {formatCardNumber(card.cardNumber)}
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void onCopy("card", card.cardNumber)}
        >
          {copied === "card" ? <RiCheckLine className="text-success" /> : <RiFileCopyLine />}
          {copied === "card" ? c.copied : c.copy}
        </Button>
      </div>
      {(card.cardHolder || card.bank) && (
        <p className="mt-1.5 text-sm text-muted-foreground">
          {[card.cardHolder, card.bank].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

function Step({
  index,
  title,
  text,
  children,
}: {
  index: number;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
        {children}
      </div>
    </li>
  );
}
