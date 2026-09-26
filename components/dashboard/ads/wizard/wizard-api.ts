import {
  createCampaign,
  createCreative,
  deleteCreative,
  getCampaign,
  PortalApiError,
  updateCampaign,
  updateCreative,
  uploadCreativeImage,
  uploadCreativeLogo,
  uploadCreativeVideo,
  isVideoFile,
  type AdCampaign,
  type AdSlot,
} from "@/lib/api/ads";
import { todayKey } from "@/lib/format";

import {
  draftOf,
  isCreativeField,
  posterOf,
  slotCreative,
  type CreativeDraft,
  type CreativeFiles,
  type CreativeTarget,
  type PlanDraft,
  type SlotDrafts,
} from "./wizard-model";

/** Kreativni saqlashda yiqilgan so'rov qaysi joy va qaysi elementga tegishli. */
export class CreativeSaveError extends Error {
  constructor(
    readonly slot: AdSlot | null,
    readonly target: CreativeTarget | null,
    message: string,
  ) {
    super(message);
    this.name = "CreativeSaveError";
  }
}

/**
 * Backend matn maydonini (`field`) aniq aytsa o'shanga, aks holda so'rov
 * tegishli elementga (rasm yoki logotip) bog'laymiz.
 */
async function within<T>(
  slot: AdSlot | null,
  target: CreativeTarget | null,
  task: Promise<T>,
): Promise<T> {
  try {
    return await task;
  } catch (err) {
    if (!(err instanceof Error)) throw err;
    const field = err instanceof PortalApiError ? err.field : undefined;
    throw new CreativeSaveError(slot, isCreativeField(field) ? field : target, err.message);
  }
}

export function savePlan(
  campaign: AdCampaign | null,
  plan: PlanDraft,
  fallbackName: string,
): Promise<AdCampaign> {
  const payload = {
    name: plan.name.trim() || fallbackName,
    slots: plan.lines,
    // Haqiqiy boshlanish to'lovda tanlanadi (backend `markPaid`) — bu
    // yerda faqat narx va muddat uchun bugungi kun.
    startDay: todayKey(),
    days: plan.days,
    frequencyCap: plan.frequencyCap,
  };
  return campaign
    ? updateCampaign(campaign.id, payload)
    : createCampaign(payload);
}

function fieldsOf(draft: CreativeDraft) {
  return {
    brandName: draft.brandName.trim(),
    title: draft.title.trim(),
    body: draft.body.trim(),
    ctaText: draft.ctaText.trim(),
    accentColor: draft.accentColor.trim(),
    href: draft.href.trim(),
  };
}

/**
 * Har bir sotib olingan joyga aynan bitta kreativ — o'z matni, logotipi va
 * rasmi bilan: rasm bo'lsa `image`, bo'lmasa `card`. Moderator har joyni
 * alohida ko'radi, sayt esa joyda faqat o'sha kreativni chiqaradi.
 */
export async function saveCreative(
  campaign: AdCampaign,
  drafts: SlotDrafts,
  files: CreativeFiles,
  posterSlots: AdSlot[],
): Promise<AdCampaign> {
  const kept = new Set<string>();

  for (const { slot } of campaign.slots) {
    const fields = fieldsOf(draftOf(drafts, slot));
    const existing = slotCreative(campaign, slot);
    const file = files.posters[slot];
    const withImage =
      posterSlots.includes(slot) &&
      !files.removedPosters.includes(slot) &&
      (!!file || !!posterOf(campaign, slot));
    const type = withImage ? "image" : "card";

    const saved = await within(
      slot,
      null,
      existing
        ? updateCreative(existing.id, { ...fields, type, slot, active: true })
        : createCreative(campaign.id, { ...fields, type, slot }),
    );
    if (file && withImage) {
      await within(
        slot,
        "poster",
        isVideoFile(file)
          ? uploadCreativeVideo(saved.id, file)
          : uploadCreativeImage(saved.id, file),
      );
    }
    const logo = files.logos[slot];
    if (logo) await within(slot, "logo", uploadCreativeLogo(saved.id, logo));
    kept.add(saved.id);
  }

  // Eski umumiy card, dublikatlar va rejadan olib tashlangan joylar
  // kreativlari. Yangilari yaratilgach o'chiriladi — logotip ko'chib ulguradi.
  for (const creative of campaign.creatives) {
    if (!kept.has(creative.id)) await within(null, null, deleteCreative(creative.id));
  }
  return getCampaign(campaign.id);
}
