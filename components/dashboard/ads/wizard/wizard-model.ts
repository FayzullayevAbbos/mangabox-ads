import {
  HEX_RE,
  HREF_RE,
  MIN_SHARE_PERCENT,
  type AdCampaign,
  type AdCreative,
  type AdSlot,
  type CampaignSlotInput,
} from "@/lib/api/ads";
import { formatDayKey, todayKey } from "@/lib/format";

export const WIZARD_STEPS = ["place", "plan", "creative", "review"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export function isWizardStep(value: string | null): value is WizardStep {
  return WIZARD_STEPS.includes(value as WizardStep);
}

export function stepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

export type RateCardPick = {
  slot: AdSlot;
  sharePercent: number;
  days: number;
};

export type PlanDraft = {
  name: string;
  lines: CampaignSlotInput[];
  startDay: string;
  days: number;
  frequencyCap: number;
};

export type CreativeDraft = {
  brandName: string;
  title: string;
  body: string;
  ctaText: string;
  accentColor: string;
  href: string;
};

export type CreativeFiles = {
  logo: File | null;
  posters: Partial<Record<AdSlot, File>>;
  removedPosters: AdSlot[];
};

export const NO_FILES: CreativeFiles = {
  logo: null,
  posters: {},
  removedPosters: [],
};

export function newPlan(pick: RateCardPick | null): PlanDraft {
  return {
    name: "",
    lines: pick ? [{ slot: pick.slot, sharePercent: pick.sharePercent }] : [],
    startDay: todayKey(),
    days: pick?.days ?? 30,
    frequencyCap: 3,
  };
}

export function planFromCampaign(campaign: AdCampaign): PlanDraft {
  return {
    name: campaign.name,
    lines: campaign.slots.map((line) => ({
      slot: line.slot,
      sharePercent: line.sharePercent,
    })),
    startDay: campaign.startDay,
    days: campaign.days,
    frequencyCap: campaign.frequencyCap,
  };
}

export function toggleSlot(plan: PlanDraft, slot: AdSlot): PlanDraft {
  const has = plan.lines.some((line) => line.slot === slot);
  return {
    ...plan,
    lines: has
      ? plan.lines.filter((line) => line.slot !== slot)
      : [...plan.lines, { slot, sharePercent: MIN_SHARE_PERCENT }],
  };
}

export function suggestName(
  plan: PlanDraft,
  labelOf: (slot: AdSlot) => string,
): string {
  const places = plan.lines.map((line) => labelOf(line.slot)).join(" + ");
  return `${places} · ${formatDayKey(plan.startDay)}`;
}

export function isEditableCampaign(campaign: AdCampaign): boolean {
  return campaign.status === "draft" || campaign.status === "rejected";
}

export function mainCard(campaign: AdCampaign): AdCreative | undefined {
  const cards = campaign.creatives.filter(
    (creative) => creative.type === "card" && creative.slot === null,
  );
  return cards.find((creative) => creative.active) ?? cards[0];
}

export function posterOf(
  campaign: AdCampaign,
  slot: AdSlot,
): AdCreative | undefined {
  return campaign.creatives.find(
    (creative) => creative.type === "image" && creative.slot === slot,
  );
}

export function emptyCreative(): CreativeDraft {
  return {
    brandName: "",
    title: "",
    body: "",
    ctaText: "",
    accentColor: "",
    href: "",
  };
}

export function creativeFromCampaign(campaign: AdCampaign): CreativeDraft {
  const source = mainCard(campaign) ?? campaign.creatives[0];
  if (!source) return emptyCreative();
  return {
    brandName: source.brandName,
    title: source.title,
    body: source.body,
    ctaText: source.ctaText,
    accentColor: source.accentColor ?? "",
    href: source.href,
  };
}

export type CreativeError = "brandName" | "href" | "accentColor";

export function validateCreative(draft: CreativeDraft): CreativeError | null {
  if (!draft.brandName.trim()) return "brandName";
  if (!HREF_RE.test(draft.href.trim())) return "href";
  const accent = draft.accentColor.trim();
  if (accent && !HEX_RE.test(accent)) return "accentColor";
  return null;
}

function isRenderable(creative: AdCreative): boolean {
  return creative.active && (creative.type !== "image" || !!creative.imageUrl);
}

export function creativeReady(campaign: AdCampaign): boolean {
  const ready = campaign.creatives.filter(isRenderable);
  return campaign.slots.every((line) =>
    ready.some((c) => c.slot === null || c.slot === line.slot),
  );
}

export function startDayOk(campaign: AdCampaign): boolean {
  return campaign.startDay >= todayKey();
}

export function firstOpenStep(campaign: AdCampaign): WizardStep {
  return creativeReady(campaign) ? "review" : "creative";
}
