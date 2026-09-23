import {
  AD_SLOTS,
  MAX_CAMPAIGN_DAYS,
  MAX_SHARE_PERCENT,
  MIN_CAMPAIGN_DAYS,
  MIN_SHARE_PERCENT,
  type AdSlot,
} from "@/lib/api/ads";

import {
  isWizardStep,
  type RateCardPick,
  type WizardStep,
} from "./wizard-model";

export function newCampaignHref(pick?: RateCardPick): string {
  if (!pick) return "/dashboard/campaigns/new";
  const query = new URLSearchParams({
    slot: pick.slot,
    share: String(pick.sharePercent),
    days: String(pick.days),
  });
  return `/dashboard/campaigns/new?${query}`;
}

export function setupHref(campaignId: string, step?: WizardStep): string {
  const base = `/dashboard/campaigns/${campaignId}/setup`;
  return step ? `${base}?step=${step}` : base;
}

export function readPick(params: URLSearchParams): RateCardPick | null {
  const slot = params.get("slot");
  if (!AD_SLOTS.includes(slot as AdSlot)) return null;
  return {
    slot: slot as AdSlot,
    sharePercent: clamp(params.get("share"), MIN_SHARE_PERCENT, MAX_SHARE_PERCENT, MIN_SHARE_PERCENT),
    days: clamp(params.get("days"), MIN_CAMPAIGN_DAYS, MAX_CAMPAIGN_DAYS, 30),
  };
}

export function readStep(params: URLSearchParams): WizardStep | null {
  const step = params.get("step");
  return isWizardStep(step) ? step : null;
}

function clamp(raw: string | null, min: number, max: number, fallback: number): number {
  const value = Math.round(Number(raw));
  if (!Number.isFinite(value) || value === 0) return fallback;
  return Math.min(max, Math.max(min, value));
}
