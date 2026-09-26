import {
  PORTAL_BASE,
  PortalApiError,
  portalRequest,
  throwPortalError,
} from "./portal";

export { PortalApiError };

export const AD_SLOTS = [
  "reader_end",
  "home_carousel",
  "manga_detail",
  "catalog_grid",
] as const;

export type AdSlot = (typeof AD_SLOTS)[number];
export type AdCreativeType = "card" | "image";

export const AD_CAMPAIGN_STATUSES = [
  "draft",
  "review",
  "rejected",
  "approved",
  "scheduled",
  "active",
  "paused",
  "finished",
] as const;

export type AdCampaignStatus = (typeof AD_CAMPAIGN_STATUSES)[number];
export type AdvertiserStatus = "pending" | "active" | "blocked";
export type AdOrderStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "refunded"
  | "expired";

export const MIN_CAMPAIGN_DAYS = 7;
export const MAX_CAMPAIGN_DAYS = 90;
export const MIN_SHARE_PERCENT = 25;
export const MAX_SHARE_PERCENT = 100;

/** Server `MIN_CAMPAIGN_PRICE_SOM` bilan bir xil. */
export const MIN_ORDER_SOM = 100_000;

export const CREATIVE_LIMITS = {
  brandName: 64,
  title: 128,
  body: 256,
  ctaText: 64,
  accentColor: 16,
  href: 500,
} as const;

export const HREF_RE = /^https:\/\/\S+$/i;
export const HEX_RE = /^#[0-9a-f]{6}$/i;

export const CAMPAIGN_NAME_LIMIT = 80;

export const IMAGE_RATIO_TOLERANCE = 0.1;

export interface AdImageSpec {
  minWidth: number;
  minHeight: number;
  targetWidth: number;
  targetHeight: number;
  ratio: number;
}

export interface AdSlotSpec {
  id: AdSlot;
  label: string;
  creativeTypes: AdCreativeType[];
  proVisible: boolean;
  cpmSom: number;
  dailyImpressions: number;
  image: AdImageSpec | null;
  /** Ovozsiz video sikl (GIF o'rniga); `null` — slotda video yo'q. */
  video?: AdImageSpec | null;
  position: number;
}

export interface AdSlotLine {
  slot: AdSlot;
  sharePercent: number;
  impressions: number;
  priceSom: number;
}

export interface AdCreative {
  id: string;
  campaignId: string;
  type: AdCreativeType;
  slot: AdSlot | null;
  active: boolean;
  brandName: string;
  title: string;
  body: string;
  ctaText: string;
  accentColor: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  /** Ovozsiz MP4 sikl; bor bo'lsa `imageUrl` uning birinchi kadri. */
  videoUrl?: string | null;
  href: string;
  /** Moderator efirdan olgan — mijoz tuzatib, qayta tekshiruvga yuboradi. */
  blockedByAdmin: boolean;
  blockReason: string | null;
  /** O'chirilgan bannerni yoqishda tahrirlash tanlangan. */
  editStartedAt?: string | null;
  /** Tahrirlangan — moderator tasdig'ini kutmoqda, efirda emas. */
  pendingReview?: boolean;
  impressions: number;
  clicks: number;
}

export type AdFinishReason = "window" | "goal" | "manual";

export interface AdCampaign {
  id: string;
  advertiserId: string;
  advertiserName: string;
  name: string;
  slots: AdSlotLine[];
  days: number;
  startDay: string;
  startsAt: string;
  endsAt: string;
  impressionsGoal: number;
  dailyCap: number;
  frequencyCap: number;
  subtotalSom: number;
  discountPercent: number;
  totalSom: number;
  status: AdCampaignStatus;
  nextAction: "submit" | "wait" | "fix" | "pay" | "none";
  rejectReason: string | null;
  finishReason: AdFinishReason | null;
  paidAt: string | null;
  paymentClaimedAt: string | null;
  orderId: string | null;
  createdBy: "advertiser" | "admin";
  /** Moderator to'xtatgan kampaniyani mijoz o'zi yoqa olmaydi. */
  pausedBy: "advertiser" | "admin" | null;
  pauseReason: string | null;
  pausedAt: string | null;
  /** Mijoz tuzatib, qayta tekshiruvga yuborgan — moderator javobi kutilmoqda. */
  fixSubmittedAt: string | null;
  /** Mijoz to'xtatgan reklamani yoqishdan oldin tahrirlash rejimida. */
  editStartedAt?: string | null;
  /** Tahrirda banner o'zgargan — efirga moderatsiyadan keyin qaytadi. */
  editedAt?: string | null;
  /** "Qayta efirga chiqarish" — shu kampaniyadan nusxa olingan. */
  renewedFrom?: string | null;
  /** To'lov oynasida tanlangan boshlanish; `null` — to'lovdan keyin darhol. */
  requestedStartAt: string | null;
  createdAt: string | null;
  creatives: AdCreative[];
}

export interface Advertiser {
  id: string;
  phone: string;
  name: string;
  legalName: string;
  inn: string;
  email: string;
  contactTelegramId: number | null;
  status: AdvertiserStatus;
  adminNote: string;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface AdQuote {
  days: number;
  lines: AdSlotLine[];
  impressions: number;
  subtotalSom: number;
  discountPercent: number;
  discountSom: number;
  totalSom: number;
}

export interface AdReportBucket {
  key: string;
  impressions: number;
  views: number;
  clicks: number;
}

export interface AdCampaignReport {
  totals: AdReportBucket & { uniqueViewers: number };
  days: AdReportBucket[];
  slots: AdReportBucket[];
  creatives: AdReportBucket[];
}

export interface AdOrder {
  id: string;
  advertiserId: string;
  campaignId: string;
  amount: number;
  provider: string;
  providerRef: string | null;
  transId: string | null;
  status: AdOrderStatus;
  paidAt: string | null;
  createdAt: string | null;
}

export interface CampaignSlotInput {
  slot: AdSlot;
  sharePercent: number;
}

export interface CampaignPayload {
  name: string;
  slots: CampaignSlotInput[];
  startDay: string;
  days: number;
  frequencyCap?: number;
}

export interface CreativePayload {
  type: AdCreativeType;
  slot?: AdSlot;
  brandName: string;
  title?: string;
  body?: string;
  ctaText?: string;
  accentColor?: string;
  href: string;
}

export type PaymentProvider = "payme" | "click" | "uzum" | "paynet";

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  "payme",
  "click",
  "uzum",
  "paynet",
];

export interface CheckoutSession {
  provider: PaymentProvider;
  orderId: string;
  providerRef: string;
  paymentUrl: string | null;
  instructions: string;
  amount: number;
  currency: string;
}

export interface CardPaymentDetails {
  cardNumber: string;
  cardHolder: string;
  bank: string;
  telegram: string;
}

export interface PaymentMethods {
  card: CardPaymentDetails | null;
  online: boolean;
}

export async function getPaymentMethods() {
  const { data } = await portalRequest<{ data: PaymentMethods }>(
    "/payment-methods",
  );
  return data;
}

export async function claimCardPayment(id: string) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}/payment-claim`,
    "POST",
  );
  return data;
}

export function isAwaitingPaymentCheck(campaign: AdCampaign): boolean {
  return (
    campaign.status === "approved" &&
    !campaign.paidAt &&
    !!campaign.paymentClaimedAt
  );
}

export function isPausedByModerator(campaign: AdCampaign): boolean {
  return campaign.status === "paused" && campaign.pausedBy === "admin";
}

/** Mijoz o'zi to'xtatib, yoqishdan oldin bannerlarni tahrirlayapti. */
export function isEditingPaused(campaign: AdCampaign): boolean {
  return (
    campaign.status === "paused" &&
    campaign.pausedBy === "advertiser" &&
    !!campaign.editStartedAt
  );
}

/**
 * Tugagan reklama tahrirsiz qayta chiqsa moderatsiyasiz to'lovga o'tadi:
 * muddati tabiiy tugagan va hech bir banner bloklanmagan bo'lishi kerak
 * (backend `renew` bilan bir xil shart).
 */
export function renewSkipsReview(campaign: AdCampaign): boolean {
  return (
    (campaign.finishReason === "window" || campaign.finishReason === "goal") &&
    !campaign.creatives.some((creative) => creative.blockedByAdmin)
  );
}

/** Moderator to'xtatgan yoki kamida bitta bannerni bloklagan. */
export function needsFix(campaign: AdCampaign): boolean {
  return (
    isPausedByModerator(campaign) ||
    campaign.creatives.some((creative) => creative.blockedByAdmin)
  );
}

/** `null` — to'lovdan keyin darhol; aks holda ISO vaqt (Toshkent). */
export async function setCampaignStart(id: string, startAt: string | null) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}/start`,
    "POST",
    { startAt },
  );
  return data;
}

/** Yoqishdan oldin tahrirlash rejimini ochadi (tugash sanasi o'zgarmaydi). */
export async function startCampaignEdit(id: string) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}/edit`,
    "POST",
  );
  return data;
}

/** Tugagan reklamadan yangi nusxa: `edit` — qoralama, aks holda to'lovga tayyor. */
export async function renewCampaign(id: string, edit: boolean) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}/renew`,
    "POST",
    { edit },
  );
  return data;
}

export async function submitFix(id: string) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}/submit-fix`,
    "POST",
  );
  return data;
}

export async function getRateCard() {
  const { data } = await portalRequest<{ data: AdSlotSpec[] }>("/rate-card");
  return data;
}

export async function getCampaignQuote(
  lines: CampaignSlotInput[],
  days: number,
): Promise<AdQuote> {
  const { data } = await portalRequest<{ data: AdQuote }>("/quote", "POST", {
    lines,
    days,
  });
  return data;
}

export async function getCampaigns() {
  const { data } = await portalRequest<{ data: AdCampaign[] }>("/campaigns");
  return data;
}

export async function getCampaign(id: string) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}`,
  );
  return data;
}

export async function createCampaign(payload: CampaignPayload) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    "/campaigns",
    "POST",
    payload,
  );
  return data;
}

export async function updateCampaign(
  id: string,
  payload: Partial<CampaignPayload>,
) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}`,
    "PATCH",
    payload,
  );
  return data;
}

export type CampaignAction = "submit" | "pause" | "resume";

export async function runCampaignAction(id: string, action: CampaignAction) {
  const { data } = await portalRequest<{ data: AdCampaign }>(
    `/campaigns/${id}/${action}`,
    "POST",
  );
  return data;
}

export async function startCheckout(id: string, provider?: PaymentProvider) {
  const { data } = await portalRequest<{ data: CheckoutSession }>(
    `/campaigns/${id}/checkout`,
    "POST",
    provider ? { provider } : {},
  );
  return data;
}

export async function getCampaignStats(
  id: string,
  params: { from?: string; to?: string } = {},
) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][],
  ).toString();
  const { data } = await portalRequest<{ data: AdCampaignReport }>(
    `/campaigns/${id}/stats${query ? `?${query}` : ""}`,
  );
  return data;
}

export async function getOrders() {
  const { data } = await portalRequest<{ data: AdOrder[] }>("/orders");
  return data;
}

export async function getCampaignOrders(id: string) {
  const orders = await getOrders();
  return orders.filter((order) => order.campaignId === id);
}

export async function createCreative(
  campaignId: string,
  payload: CreativePayload,
) {
  const { data } = await portalRequest<{ data: AdCreative }>(
    `/campaigns/${campaignId}/creatives`,
    "POST",
    payload,
  );
  return data;
}

export async function updateCreative(
  id: string,
  payload: Partial<CreativePayload> & { active?: boolean },
) {
  const { data } = await portalRequest<{ data: AdCreative }>(
    `/creatives/${id}`,
    "PATCH",
    payload,
  );
  return data;
}

/** O'chirilgan bannerni yoqib, tahrirlashni ochadi (to'langan kampaniyada). */
export async function startCreativeEdit(id: string) {
  const { data } = await portalRequest<{ data: AdCreative }>(
    `/creatives/${id}/edit`,
    "POST",
  );
  return data;
}

export async function deleteCreative(id: string) {
  const { data } = await portalRequest<{ data: { ok: boolean } }>(
    `/creatives/${id}`,
    "DELETE",
  );
  return data;
}

async function uploadCreativeFile(
  id: string,
  kind: "image" | "logo" | "video",
  file: File,
) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${PORTAL_BASE}/creatives/${id}/${kind}`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  if (!res.ok) await throwPortalError(res);
  const { data } = (await res.json()) as { data: AdCreative };
  return data;
}

export function uploadCreativeImage(id: string, file: File) {
  return uploadCreativeFile(id, "image", file);
}

export function uploadCreativeLogo(id: string, file: File) {
  return uploadCreativeFile(id, "logo", file);
}

/** GIF/MP4/MOV/WebM — server ovozsiz MP4 ga siqadi va poster yasaydi. */
export function uploadCreativeVideo(id: string, file: File) {
  return uploadCreativeFile(id, "video", file);
}

export async function removeCreativeVideo(id: string) {
  const { data } = await portalRequest<{ data: AdCreative }>(
    `/creatives/${id}/video`,
    "DELETE",
  );
  return data;
}

/** Server chegarasi bilan bir xil (`AD_VIDEO_UPLOAD_MAX_BYTES`). */
export const VIDEO_UPLOAD_MAX_MB = 10;

/** Server multipart chegarasi (`main.ts`) — rasm uchun. */
export const IMAGE_UPLOAD_MAX_MB = 8;

/** GIF ham video yo'lidan o'tadi: server uni ovozsiz MP4 ga aylantiradi. */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || file.type === "image/gif";
}

/** Brauzerda `<video>` bilan ko'rsatiladigan fayl (GIF `<img>` da o'zi aylanadi). */
export function isVideoPreview(file: File): boolean {
  return file.type.startsWith("video/");
}

export function checkImageAgainstSpec(
  width: number,
  height: number,
  spec: AdImageSpec,
): { ok: true } | { ok: false; reason: "size" | "ratio" } {
  if (width < spec.minWidth || height < spec.minHeight) {
    return { ok: false, reason: "size" };
  }
  const ratio = width / height;
  const drift = Math.abs(ratio - spec.ratio) / spec.ratio;
  return drift <= IMAGE_RATIO_TOLERANCE ? { ok: true } : { ok: false, reason: "ratio" };
}
