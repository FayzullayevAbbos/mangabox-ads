"use client";

import * as React from "react";
import {
  RiCheckboxCircleFill,
  RiCheckLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiLoader4Line,
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
import { DatePicker } from "@/components/dashboard/date-picker";
import {
  PROVIDER_LABELS,
  PROVIDER_LOGOS,
} from "@/components/dashboard/ads/payment-provider";
import {
  useOnlineCheckout,
  type OnlineCheckoutState,
} from "@/components/dashboard/ads/use-online-checkout";
import { usePaymentMethods } from "@/components/dashboard/ads/use-payment-methods";
import {
  PAYMENT_PROVIDERS,
  isAwaitingPaymentCheck,
  setCampaignStart,
  type AdCampaign,
  type CardPaymentDetails,
  type PaymentProvider,
} from "@/lib/api/ads";
import { formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
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
  onPaid,
}: {
  campaign: AdCampaign | null;
  busy: boolean;
  onClose: () => void;
  onClaim: (campaign: AdCampaign, startAt: string | null) => void;
  onPaid: (campaign: AdCampaign) => void;
}) {
  const p = useT("portal");
  const t = useT("ads");
  const state = usePaymentMethods(campaign !== null);
  const online = state.status === "ready" && state.methods.online;
  const checkout = useOnlineCheckout({ campaign, enabled: online, onPaid });
  const { copied, copy } = useCopy(p.pay.copied);
  const currency = t.rateCard.currency;
  const locked = busy || checkout.state.phase === "starting";

  return (
    <Dialog open={campaign !== null} onOpenChange={(open) => !open && !locked && onClose()}>
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
                checkout={checkout}
                copy={p.pay}
                copied={copied}
                onCopy={copy}
                currency={currency}
                onClose={onClose}
                onClaim={onClaim}
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
  checkout,
  copy: c,
  copied,
  onCopy,
  currency,
  onClose,
  onClaim,
}: {
  campaign: AdCampaign;
  card: CardPaymentDetails | null;
  online: boolean;
  busy: boolean;
  checkout: ReturnType<typeof useOnlineCheckout>;
  copy: PayCopy;
  copied: string | null;
  onCopy: (key: string, value: string) => Promise<void>;
  currency: string;
  onClose: () => void;
  onClaim: (campaign: AdCampaign, startAt: string | null) => void;
}) {
  const claimed = isAwaitingPaymentCheck(campaign);
  const start = useStartChoice(campaign);
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

  const phase = checkout.state.phase;

  if (phase === "paid") {
    return (
      <>
        <div className="flex items-start gap-3 rounded-lg bg-success/10 px-4 py-3 text-success">
          <RiCheckboxCircleFill className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{c.paidTitle}</p>
            <p className="mt-1 text-sm text-foreground/80">{c.paidText}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>{c.done}</Button>
        </div>
      </>
    );
  }

  if (phase === "waiting" || phase === "expired") {
    return (
      <OnlineStatus
        state={checkout.state}
        copy={c}
        contact={contact}
        telegramButton={telegramButton}
        onReopen={(provider) => void checkout.pay(provider)}
        onCheck={() => void checkout.check()}
        onOther={checkout.reset}
        onClose={onClose}
      />
    );
  }

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

  const starting = checkout.state.phase === "starting" ? checkout.state.provider : null;
  // Boshlanish vaqti checkout'dan oldin saqlanadi — backend oynani to'lov
  // paytida shundan hisoblaydi.
  const saveStart = () => setCampaignStart(campaign.id, start.value);

  return (
    <>
      <StartChoice choice={start} copy={c} disabled={busy || starting !== null} />

      {online && (
        <div className="space-y-3">
          <p className="text-sm font-medium">{c.onlineTitle}</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_PROVIDERS.map((provider) => (
              <button
                key={provider}
                type="button"
                aria-label={PROVIDER_LABELS[provider]}
                disabled={busy || starting !== null || !start.valid}
                onClick={() => void checkout.pay(provider, saveStart)}
                // Logotiplar to'q matnli — qorong'i mavzuda ham oq plitka.
                className="relative flex h-14 cursor-pointer items-center justify-center rounded-lg border border-border bg-white px-4 transition-[border-color,box-shadow] outline-none hover:border-primary hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PROVIDER_LOGOS[provider]}
                  alt=""
                  className={cn(
                    "h-6 w-auto max-w-full object-contain",
                    provider === "uzum" && "h-8",
                    starting === provider && "opacity-30",
                  )}
                  draggable={false}
                />
                {starting === provider && (
                  <RiLoader4Line className="absolute size-5 animate-spin text-neutral-700" />
                )}
              </button>
            ))}
          </div>
          {checkout.error ? (
            <p className="text-sm text-destructive">{checkout.error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {starting ? c.opening : c.hint}
            </p>
          )}
        </div>
      )}

      {online && card && (
        <p className="border-t border-border pt-4 text-sm font-medium">{c.manualTitle}</p>
      )}

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
        !online && (
          <p className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            {c.unavailable}
          </p>
        )
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" disabled={busy || starting !== null} onClick={onClose}>
          {c.close}
        </Button>
        {card && (
          <Button
            disabled={busy || !start.valid}
            onClick={() => onClaim(campaign, start.value)}
          >
            {busy ? c.claiming : c.claim}
          </Button>
        )}
      </div>
    </>
  );
}

/** Toshkent UTC+5, yozgi vaqt yo'q — soat shu zonada tanlanadi. */
const TASHKENT_OFFSET = "+05:00";
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));

function tomorrowKey(): string {
  const d = new Date(Date.now() + 24 * 3_600_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
}

function splitTashkent(iso: string): { day: string; hour: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, hour: get("hour") };
}

type StartChoiceState = ReturnType<typeof useStartChoice>;

/** "Darhol" yoki aniq sana+soat; oldin tanlangani bo'lsa o'shandan. */
function useStartChoice(campaign: AdCampaign) {
  const initial = campaign.requestedStartAt ? splitTashkent(campaign.requestedStartAt) : null;
  const [mode, setMode] = React.useState<"now" | "later">(initial ? "later" : "now");
  const [day, setDay] = React.useState(() => initial?.day ?? tomorrowKey());
  // Dialog ochilgan payt — "o'tib ketgan" tekshiruvi uchun (render sof qolsin).
  const [openedAt] = React.useState(() => Date.now());
  const [hour, setHour] = React.useState(initial?.hour ?? "09");

  const iso = `${day}T${hour}:00:00${TASHKENT_OFFSET}`;
  const past = mode === "later" && Date.parse(iso) <= openedAt;
  return {
    mode,
    setMode,
    day,
    setDay,
    hour,
    setHour,
    past,
    valid: mode === "now" || (!!day && !past),
    value: mode === "now" ? null : new Date(iso).toISOString(),
  };
}

function StartChoice({
  choice,
  copy: c,
  disabled,
}: {
  choice: StartChoiceState;
  copy: PayCopy;
  disabled: boolean;
}) {
  const option = (mode: "now" | "later", title: string, text: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={choice.mode === mode}
      disabled={disabled}
      onClick={() => choice.setMode(mode)}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
        choice.mode === mode
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/40",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          choice.mode === mode ? "border-primary" : "border-muted-foreground/40",
        )}
      >
        {choice.mode === mode && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>
      </span>
    </button>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{c.startTitle}</p>
      <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
        {option("now", c.startNow, c.startNowText)}
        {option("later", c.startLater, c.startLaterText)}
      </div>
      {choice.mode === "later" && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <DatePicker
              className="h-10 flex-1 text-[0.9375rem]"
              value={choice.day}
              onChange={choice.setDay}
            />
            <select
              aria-label={c.startHour}
              value={choice.hour}
              disabled={disabled}
              onChange={(e) => choice.setHour(e.target.value)}
              className="h-10 w-24 cursor-pointer rounded-md border border-input bg-background px-2 font-mono text-[0.9375rem] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}:00
                </option>
              ))}
            </select>
          </div>
          <p className={cn("text-xs", choice.past ? "text-destructive" : "text-muted-foreground")}>
            {choice.past ? c.startPast : c.startTimezone}
          </p>
        </div>
      )}
    </div>
  );
}

function OnlineStatus({
  state,
  copy: c,
  contact,
  telegramButton,
  onReopen,
  onCheck,
  onOther,
  onClose,
}: {
  state: Extract<OnlineCheckoutState, { phase: "waiting" | "expired" }>;
  copy: PayCopy;
  contact: string | null;
  telegramButton: (href: string | null) => React.ReactNode;
  onReopen: (provider: PaymentProvider) => void;
  onCheck: () => void;
  onOther: () => void;
  onClose: () => void;
}) {
  const provider = PROVIDER_LABELS[state.provider];

  if (state.phase === "expired") {
    return (
      <>
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-destructive">
          <RiErrorWarningLine className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{c.expiredTitle}</p>
            <p className="mt-1 text-sm">{c.expiredText}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            {c.close}
          </Button>
          {telegramButton(contact)}
          <Button onClick={onOther}>{c.retry}</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-300">
        <RiLoader4Line className="mt-0.5 size-5 shrink-0 animate-spin" />
        <div>
          <p className="text-sm font-semibold">
            {interpolate(c.waitingTitle, { provider })}
          </p>
          <p className="mt-1 text-sm">{state.blocked ? c.blockedText : c.waitingText}</p>
        </div>
      </div>

      {state.paymentUrl ? (
        <Button asChild variant={state.blocked ? "default" : "outline"} className="w-full">
          <a href={state.paymentUrl} target="_blank" rel="noreferrer">
            <RiExternalLinkLine />
            {c.reopen}
          </a>
        </Button>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => onReopen(state.provider)}>
          <RiExternalLinkLine />
          {c.reopen}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">{c.otherMethodWarning}</p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onOther}>
          {c.otherMethod}
        </Button>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="ghost" onClick={onClose}>
            {c.close}
          </Button>
          <Button variant="secondary" disabled={state.checking} onClick={onCheck}>
            {state.checking ? c.checking : c.checkNow}
          </Button>
        </div>
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
