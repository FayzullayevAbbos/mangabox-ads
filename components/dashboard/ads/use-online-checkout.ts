"use client";

import * as React from "react";

import {
  getCampaign,
  getCampaignOrders,
  PAYMENT_PROVIDERS,
  startCheckout,
  type AdCampaign,
  type PaymentProvider,
} from "@/lib/api/ads";

const POLL_MS = 4_000;
/** Backenddagi `PENDING_ORDER_TTL_MS` — shundan keyin havola kuchsiz. */
const PENDING_TTL_MS = 30 * 60 * 1000;

export type OnlineCheckoutState =
  | { phase: "idle" }
  | { phase: "starting"; provider: PaymentProvider }
  | {
      phase: "waiting";
      provider: PaymentProvider;
      paymentUrl: string | null;
      /** Brauzer yangi tabni to'sib qo'ydi — havolani qo'lda ochish kerak. */
      blocked: boolean;
      expiresAt: number;
      checking: boolean;
    }
  | { phase: "expired"; provider: PaymentProvider }
  | { phase: "paid"; campaign: AdCampaign };

export function isPaid(campaign: AdCampaign): boolean {
  return (
    !!campaign.paidAt ||
    campaign.status === "scheduled" ||
    campaign.status === "active"
  );
}

function isOnlineProvider(value: string): value is PaymentProvider {
  return PAYMENT_PROVIDERS.includes(value as PaymentProvider);
}

/**
 * To'lov sahifasi yangi tabda ochiladi, portal o'z tabida kampaniyani
 * so'rab turadi: provayderlarning return URL'i umumiy (Pro/sponsor bilan)
 * va Uzum/Paynet'da umuman yo'q, shuning uchun qaytishga tayanmaymiz.
 */
export function useOnlineCheckout({
  campaign,
  enabled,
  onPaid,
}: {
  campaign: AdCampaign | null;
  enabled: boolean;
  onPaid: (campaign: AdCampaign) => void;
}) {
  const [state, setState] = React.useState<OnlineCheckoutState>({ phase: "idle" });
  const [error, setError] = React.useState<string | null>(null);
  const campaignId = campaign?.id ?? null;
  const onPaidRef = React.useRef(onPaid);
  React.useEffect(() => {
    onPaidRef.current = onPaid;
  });

  // Dialog boshqa kampaniya uchun ochilsa yoki yopilsa — holat nolga qaytadi.
  const [trackedId, setTrackedId] = React.useState(campaignId);
  if (trackedId !== campaignId) {
    setTrackedId(campaignId);
    setState({ phase: "idle" });
    setError(null);
  }

  // Oldin boshlangan va hali kuchdagi to'lov bo'lsa — o'shani kutamiz,
  // aks holda mijoz boshqa provayderda ikkinchi buyurtma ochib, ikki
  // marta to'lab qo'yishi mumkin.
  React.useEffect(() => {
    if (!enabled || !campaignId) return;
    let alive = true;
    getCampaignOrders(campaignId)
      .then((orders) => {
        if (!alive) return;
        // `providerRef` yo'q buyurtma provayderda ochilmay qolgan (checkout
        // xato bergan) — uni kutish befoyda.
        const live = orders.find(
          (order) =>
            order.status === "pending" &&
            !!order.providerRef &&
            isOnlineProvider(order.provider) &&
            order.createdAt &&
            Date.now() - new Date(order.createdAt).getTime() < PENDING_TTL_MS,
        );
        if (!live || !live.createdAt || !isOnlineProvider(live.provider)) return;
        const provider = live.provider;
        const expiresAt = new Date(live.createdAt).getTime() + PENDING_TTL_MS;
        setState((prev) =>
          prev.phase === "idle"
            ? {
                phase: "waiting",
                provider,
                paymentUrl: null,
                blocked: false,
                expiresAt,
                checking: false,
              }
            : prev,
        );
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [enabled, campaignId]);

  const check = React.useCallback(async () => {
    if (!campaignId) return;
    setState((prev) => (prev.phase === "waiting" ? { ...prev, checking: true } : prev));
    try {
      const fresh = await getCampaign(campaignId);
      if (isPaid(fresh)) {
        setState({ phase: "paid", campaign: fresh });
        onPaidRef.current(fresh);
        return;
      }
    } catch {
      // Tarmoq uzilishi — keyingi urinishda qayta so'raymiz.
    }
    setState((prev) => {
      if (prev.phase !== "waiting") return prev;
      if (Date.now() > prev.expiresAt) {
        return { phase: "expired", provider: prev.provider };
      }
      return { ...prev, checking: false };
    });
  }, [campaignId]);

  const waiting = state.phase === "waiting";
  React.useEffect(() => {
    if (!waiting) return;
    const timer = window.setInterval(() => void check(), POLL_MS);
    // Mijoz to'lov tabidan qaytganda keyingi so'rovni kutmaymiz.
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [waiting, check]);

  /**
   * `prepare` — checkout'dan oldingi qadam (boshlanish vaqtini saqlash).
   * Tab undan OLDIN ochiladi: `await` dan keyin ochilgan oynani brauzer
   * popup deb to'sadi.
   */
  const pay = async (provider: PaymentProvider, prepare?: () => Promise<unknown>) => {
    if (!campaignId || state.phase === "starting") return;
    setError(null);
    // Tab foydalanuvchi bosgan zahoti ochiladi: `await` dan keyin ochilgan
    // oynani brauzer popup deb to'sadi.
    const tab = window.open("", "_blank");
    setState({ phase: "starting", provider });
    try {
      if (prepare) await prepare();
      const session = await startCheckout(campaignId, provider);
      const url = session.paymentUrl;
      if (tab && url) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        tab?.close();
      }
      setState({
        phase: "waiting",
        provider,
        paymentUrl: url,
        blocked: !!url && !tab,
        expiresAt: Date.now() + PENDING_TTL_MS,
        checking: false,
      });
    } catch (err) {
      tab?.close();
      setError(err instanceof Error ? err.message : String(err));
      setState({ phase: "idle" });
    }
  };

  const reset = () => {
    setError(null);
    setState({ phase: "idle" });
  };

  return { state, error, pay, check, reset };
}
