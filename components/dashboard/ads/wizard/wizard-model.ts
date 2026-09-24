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

/** Har bir joy o'z banneriga ega: matn, logotip va rasm joy bo'yicha. */
export type SlotDrafts = Partial<Record<AdSlot, CreativeDraft>>;

export type CreativeFiles = {
  logos: Partial<Record<AdSlot, File>>;
  posters: Partial<Record<AdSlot, File>>;
  removedPosters: AdSlot[];
};

export const NO_FILES: CreativeFiles = {
  logos: {},
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

/** Matn manbai: eski umumiy card bo'lsa o'sha, aks holda istalgan joy kreativi. */
export function mainCard(campaign: AdCampaign): AdCreative | undefined {
  const cards = campaign.creatives.filter(
    (creative) => creative.type === "card" && creative.slot === null,
  );
  return (
    cards.find((creative) => creative.active) ??
    cards[0] ??
    // Eski backend rasmli kreativdan sarlavhani o'chirgan — card afzal.
    campaign.creatives.find((creative) => creative.type === "card") ??
    campaign.creatives[0]
  );
}

/** Logotip kampaniya darajasida bitta — backend yangi kreativga ham ko'chiradi. */
export function campaignLogo(campaign: AdCampaign): string | null {
  return campaign.creatives.find((creative) => creative.logoUrl)?.logoUrl ?? null;
}

/** Joyning o'z kreativi (har bir joyga bittadan). */
export function slotCreative(
  campaign: AdCampaign,
  slot: AdSlot,
): AdCreative | undefined {
  return campaign.creatives.find((creative) => creative.slot === slot);
}

export function posterOf(
  campaign: AdCampaign,
  slot: AdSlot,
): AdCreative | undefined {
  const own = slotCreative(campaign, slot);
  return own?.type === "image" && own.imageUrl ? own : undefined;
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

export function toDraft(source: AdCreative): CreativeDraft {
  return {
    brandName: source.brandName,
    title: source.title,
    body: source.body,
    ctaText: source.ctaText,
    accentColor: source.accentColor ?? "",
    href: source.href,
  };
}

export function creativeFromCampaign(campaign: AdCampaign): CreativeDraft {
  const source = mainCard(campaign);
  return source ? toDraft(source) : emptyCreative();
}

/** Joyning saqlangan banneri; hali yo'q bo'lsa kampaniyaning asosiy matni. */
export function draftFromCampaign(campaign: AdCampaign, slot: AdSlot): CreativeDraft {
  const own = slotCreative(campaign, slot);
  return own ? toDraft(own) : creativeFromCampaign(campaign);
}

export function draftsFromCampaign(campaign: AdCampaign): SlotDrafts {
  const drafts: SlotDrafts = {};
  for (const { slot } of campaign.slots) drafts[slot] = draftFromCampaign(campaign, slot);
  return drafts;
}

/**
 * Rejaga qo'shilgan yangi joy bo'sh qolmasin: birinchi to'ldirilgan joyning
 * matnidan boshlaydi, mijoz keyin o'zgartiradi.
 */
export function ensureDrafts(drafts: SlotDrafts, slots: AdSlot[]): SlotDrafts {
  const seed = slots.map((slot) => drafts[slot]).find(Boolean) ?? emptyCreative();
  const next: SlotDrafts = {};
  for (const slot of slots) next[slot] = drafts[slot] ?? { ...seed };
  return next;
}

export function draftOf(drafts: SlotDrafts, slot: AdSlot): CreativeDraft {
  return drafts[slot] ?? emptyCreative();
}

export const PLAN_FIELDS = ["slots", "startDay", "days", "name"] as const;
export type PlanField = (typeof PLAN_FIELDS)[number];
export type PlanErrors = Partial<Record<PlanField, string>>;

export function isPlanField(value: unknown): value is PlanField {
  return PLAN_FIELDS.includes(value as PlanField);
}

export const CREATIVE_FIELDS = [
  "brandName",
  "title",
  "body",
  "ctaText",
  "href",
  "accentColor",
] as const;
export type CreativeField = (typeof CREATIVE_FIELDS)[number];

/** Joy ichida xato bog'lanadigan element: matn maydoni, rasm yoki logotip. */
export type CreativeTarget = CreativeField | "poster" | "logo";
export type CreativeErrors = Partial<Record<CreativeTarget, string>>;
export type SlotErrors = Partial<Record<AdSlot, CreativeErrors>>;

export function hasErrors(errors: CreativeErrors | undefined): boolean {
  return !!errors && Object.keys(errors).length > 0;
}

export function isCreativeField(value: unknown): value is CreativeField {
  return CREATIVE_FIELDS.includes(value as CreativeField);
}

export function validateCreative(draft: CreativeDraft): CreativeField[] {
  const problems: CreativeField[] = [];
  if (!draft.brandName.trim()) problems.push("brandName");
  if (!draft.title.trim()) problems.push("title");
  if (!HREF_RE.test(draft.href.trim())) problems.push("href");
  const accent = draft.accentColor.trim();
  if (accent && !HEX_RE.test(accent)) problems.push("accentColor");
  return problems;
}

function isRenderable(creative: AdCreative): boolean {
  return creative.active && (creative.type !== "image" || !!creative.imageUrl);
}

/** Ko'rsatiladigan kreativi yo'q slotlar — backend `submit` ham shuni tekshiradi. */
export function uncoveredSlots(campaign: AdCampaign): AdSlot[] {
  const ready = campaign.creatives.filter(isRenderable);
  return campaign.slots
    .map((line) => line.slot)
    .filter((slot) => !ready.some((c) => c.slot === null || c.slot === slot));
}

export function creativeReady(campaign: AdCampaign): boolean {
  return uncoveredSlots(campaign).length === 0;
}


export function firstOpenStep(campaign: AdCampaign): WizardStep {
  return creativeReady(campaign) ? "review" : "creative";
}
