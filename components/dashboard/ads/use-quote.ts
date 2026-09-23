"use client";

import * as React from "react";

import {
  getCampaignQuote,
  MIN_ORDER_SOM,
  type AdQuote,
  type CampaignSlotInput,
} from "@/lib/api/ads";

export type QuoteState = {
  quote: AdQuote | null;
  loading: boolean;
  belowMinimum: boolean;
};

type Resolved = { key: string; quote: AdQuote | null };

export function useQuote(
  lines: CampaignSlotInput[],
  days: number,
  delayMs = 300,
): QuoteState {
  const [resolved, setResolved] = React.useState<Resolved | null>(null);
  const empty = lines.length === 0;
  const linesKey = JSON.stringify(lines);
  const key = `${linesKey}:${days}`;

  React.useEffect(() => {
    if (empty) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      getCampaignQuote(JSON.parse(linesKey) as CampaignSlotInput[], days)
        .then((quote) => {
          if (!cancelled) setResolved({ key, quote });
        })
        .catch(() => {
          if (!cancelled) setResolved({ key, quote: null });
        });
    }, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [empty, key, linesKey, days, delayMs]);

  const quote = empty ? null : (resolved?.quote ?? null);
  return {
    quote,
    loading: !empty && resolved?.key !== key,
    belowMinimum: quote !== null && quote.totalSom < MIN_ORDER_SOM,
  };
}
