import {
  createCampaign,
  createCreative,
  deleteCreative,
  getCampaign,
  updateCampaign,
  updateCreative,
  uploadCreativeImage,
  uploadCreativeLogo,
  type AdCampaign,
  type AdCreative,
  type AdSlot,
} from "@/lib/api/ads";

import {
  mainCard,
  posterOf,
  type CreativeDraft,
  type CreativeFiles,
  type PlanDraft,
} from "./wizard-model";

export function savePlan(
  campaign: AdCampaign | null,
  plan: PlanDraft,
  fallbackName: string,
): Promise<AdCampaign> {
  const payload = {
    name: plan.name.trim() || fallbackName,
    slots: plan.lines,
    startDay: plan.startDay,
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

async function savePoster(
  campaign: AdCampaign,
  slot: AdSlot,
  draft: CreativeDraft,
  files: CreativeFiles,
): Promise<AdCreative | null> {
  const existing = posterOf(campaign, slot);
  if (files.removedPosters.includes(slot)) {
    if (existing) await deleteCreative(existing.id);
    return null;
  }
  const file = files.posters[slot];
  if (!existing && !file) return null;
  const fields = { ...fieldsOf(draft), slot };
  const poster = existing
    ? await updateCreative(existing.id, fields)
    : await createCreative(campaign.id, { type: "image", ...fields });
  if (file) await uploadCreativeImage(poster.id, file);
  return poster;
}

export async function saveCreative(
  campaign: AdCampaign,
  draft: CreativeDraft,
  files: CreativeFiles,
  posterSlots: AdSlot[],
): Promise<AdCampaign> {
  const card = mainCard(campaign);
  const saved = card
    ? await updateCreative(card.id, { ...fieldsOf(draft), active: true })
    : await createCreative(campaign.id, { type: "card", ...fieldsOf(draft) });

  const touched: AdCreative[] = [saved];
  for (const slot of posterSlots) {
    const poster = await savePoster(campaign, slot, draft, files);
    if (poster) touched.push(poster);
  }

  const logo = files.logo;
  if (logo) {
    await Promise.all(touched.map((c) => uploadCreativeLogo(c.id, logo)));
  }
  return getCampaign(campaign.id);
}
