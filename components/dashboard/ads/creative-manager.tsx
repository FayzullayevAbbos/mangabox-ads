"use client";

import * as React from "react";
import {
  RiAddLine,
  RiImageLine,
  RiTimeLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { toast } from "sonner";

import {
  SLOT_BANNER_GRID,
  SlotBannerCard,
} from "@/components/dashboard/ads/slot-banner-card";
import { ratioLabel, readImageSize } from "@/components/dashboard/ads/image-file";
import { CharCounter, TextField } from "@/components/dashboard/ads/text-field";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { SelectMenu } from "@/components/dashboard/select-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  checkImageAgainstSpec,
  createCreative,
  CREATIVE_LIMITS,
  deleteCreative,
  HEX_RE,
  HREF_RE,
  isPausedByModerator,
  needsFix,
  PortalApiError,
  updateCreative,
  uploadCreativeImage,
  uploadCreativeLogo,
  type AdCampaign,
  type AdCreative,
  type AdCreativeType,
  type AdImageSpec,
  type AdSlot,
} from "@/lib/api/ads";
import { formatDate } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";


/** Kreativ matni faqat moderatsiyagacha o'zgaradi; `active` esa har doim. */
function isEditable(campaign: AdCampaign): boolean {
  return campaign.status === "draft" || campaign.status === "rejected";
}

/**
 * Tuzatish: moderator to'xtatgan kampaniyaning bannerlari yoki bloklangan
 * banner tahrirlanadi (qo'shish/o'chirish emas) — admin qayta ko'rmaguncha
 * efirga chiqmaydi.
 */
/** To'langan kampaniya: o'chirilgan banner muddatni to'xtatmaydi. */
function isPaid(campaign: AdCampaign): boolean {
  return ["scheduled", "active", "paused"].includes(campaign.status);
}

/** Qolgan barcha bannerlar o'chiq — reklama hech qayerda chiqmay qoladi. */
function isLastActive(campaign: AdCampaign, creative: AdCreative): boolean {
  return !campaign.creatives.some(
    (c) => c.id !== creative.id && c.active && !c.blockedByAdmin,
  );
}

function isFixable(campaign: AdCampaign, creative: AdCreative): boolean {
  return isPausedByModerator(campaign) || creative.blockedByAdmin;
}

export function CreativeManager({
  campaign,
  onChanged,
}: {
  campaign: AdCampaign;
  onChanged: () => void;
}) {
  const t = useT("ads");
  const m = useT("portal").moderation;
  const off = t.sheet.creatives.deactivate;
  // Bannerlar kampaniyadagi joylar tartibida (plan qadamidagidek).
  const slotOrder = campaign.slots.map((line) => line.slot);
  const ordered = [...campaign.creatives].sort(
    (x, y) =>
      (x.slot ? slotOrder.indexOf(x.slot) : -1) -
      (y.slot ? slotOrder.indexOf(y.slot) : -1),
  );
  const { specOf, labelOf } = useRateCard();
  const [editing, setEditing] = React.useState<AdCreative | "new" | null>(null);
  const [removing, setRemoving] = React.useState<AdCreative | null>(null);
  const [deactivating, setDeactivating] = React.useState<AdCreative | null>(null);
  const [busy, setBusy] = React.useState(false);

  const editable = isEditable(campaign);

  /** Rasmli kreativ uchun ochiq slotlar: kampaniyada sotib olingan + rasmli. */
  const imageSlots = campaign.slots
    .map((line) => line.slot)
    .filter((slot) => specOf(slot)?.image);

  const toggleActive = async (creative: AdCreative, active: boolean) => {
    setBusy(true);
    try {
      await updateCreative(creative.id, { active });
      toast.success(t.toasts.creativeSaved);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!removing) return;
    setBusy(true);
    try {
      await deleteCreative(removing.id);
      toast.success(t.toasts.creativeDeleted);
      setRemoving(null);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {editable
            ? t.sheet.creatives.cardSlotHint
            : needsFix(campaign)
              ? m.fixHint
              : t.sheet.creatives.lockedHint}
        </p>
        {editable && (
          <Button size="sm" onClick={() => setEditing("new")}>
            <RiAddLine className="size-4" />
            {t.sheet.creatives.add}
          </Button>
        )}
      </div>

      {campaign.creatives.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t.sheet.creatives.empty}
        </p>
      ) : (
        <ul className={SLOT_BANNER_GRID}>
          {ordered.map((creative) => (
            <li key={creative.id}>
              <SlotBannerCard
                creative={creative}
                slot={campaign.slots[0]?.slot ?? null}
                control={
                  !creative.blockedByAdmin && (
                    <Switch
                      size="sm"
                      aria-label={t.sheet.creatives.active}
                      checked={creative.active}
                      disabled={busy}
                      onCheckedChange={(v) => {
                        // O'chirishdan oldin har doim so'raymiz (yoqish darhol):
                        // to'langan kampaniyada muddat ham to'xtamaydi.
                        if (!v) setDeactivating(creative);
                        else void toggleActive(creative, v === true);
                      }}
                    />
                  )
                }
                actions={
                  (editable || isFixable(campaign, creative)) && (
                    <>
                      <UploadButtons
                        creative={creative}
                        spec={specOf(creative.slot)?.image ?? null}
                        onDone={onChanged}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(creative)}
                      >
                        {editable ? t.actions.edit : m.fixBanner}
                      </Button>
                      {editable && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRemoving(creative)}
                        >
                          {t.sheet.creatives.remove}
                        </Button>
                      )}
                    </>
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}

      <CreativeDialog
        target={editing}
        campaign={campaign}
        imageSlots={imageSlots}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onChanged();
        }}
      />

      <Dialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && !busy && setDeactivating(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{off.title}</DialogTitle>
            <DialogDescription>
              {deactivating &&
                interpolate(off.text, {
                  slot: deactivating.slot
                    ? labelOf(deactivating.slot)
                    : t.sheet.creatives.anySlot,
                })}
            </DialogDescription>
          </DialogHeader>
          {(isPaid(campaign) ||
            (deactivating && isLastActive(campaign, deactivating))) && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-300">
              <RiTimeLine className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1 text-sm">
                {isPaid(campaign) && (
                  <>
                    <p className="font-semibold">{off.timeTitle}</p>
                    <p>
                      {interpolate(off.time, { date: formatDate(campaign.endsAt) })}
                    </p>
                  </>
                )}
                {deactivating && isLastActive(campaign, deactivating) && (
                  <p className="font-medium">{off.last}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setDeactivating(null)}
            >
              {t.actions.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => {
                const target = deactivating;
                setDeactivating(null);
                if (target) void toggleActive(target, false);
              }}
            >
              {off.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={removing !== null}
        onOpenChange={(open) => !open && !busy && setRemoving(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.sheet.creatives.removeTitle}</DialogTitle>
            <DialogDescription>
              {t.sheet.creatives.removeConfirm}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setRemoving(null)}
            >
              {t.actions.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void remove()}
            >
              {t.actions.proceed}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Rasm faqat `image` turidagi, sloti bor kreativga yuklanadi. O'lcham va
 * nisbat serverga yuborilgunga qadar tekshiriladi — 400 ning matni
 * foydalanuvchiga tushunarsiz bo'ladi.
 */
function UploadButtons({
  creative,
  spec,
  onDone,
}: {
  creative: AdCreative;
  spec: AdImageSpec | null;
  onDone: () => void;
}) {
  const t = useT("ads");
  const [uploading, setUploading] = React.useState<"image" | "logo" | null>(
    null,
  );
  const imageRef = React.useRef<HTMLInputElement | null>(null);
  const logoRef = React.useRef<HTMLInputElement | null>(null);

  const canUploadImage = creative.type === "image" && !!creative.slot && !!spec;

  const send = async (kind: "image" | "logo", file: File) => {
    if (kind === "image" && spec) {
      const size = await readImageSize(file);
      if (size) {
        const check = checkImageAgainstSpec(size.width, size.height, spec);
        if (!check.ok) {
          toast.error(
            check.reason === "size"
              ? interpolate(t.sheet.creatives.imageTooSmall, {
                  min: `${spec.minWidth}×${spec.minHeight}`,
                  actual: `${size.width}×${size.height}`,
                })
              : interpolate(t.sheet.creatives.imageWrongRatio, {
                  ratio: ratioLabel(spec.ratio),
                  actual: `${size.width}×${size.height}`,
                }),
          );
          return;
        }
      }
    }
    setUploading(kind);
    try {
      await (kind === "image"
        ? uploadCreativeImage(creative.id, file)
        : uploadCreativeLogo(creative.id, file));
      toast.success(t.toasts.uploaded);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(null);
      if (imageRef.current) imageRef.current.value = "";
      if (logoRef.current) logoRef.current.value = "";
    }
  };

  return (
    <>
      {canUploadImage && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={uploading !== null}
            title={
              spec
                ? interpolate(t.sheet.creatives.imageHint, {
                    min: `${spec.minWidth}×${spec.minHeight}`,
                    ratio: ratioLabel(spec.ratio),
                  })
                : undefined
            }
            onClick={() => imageRef.current?.click()}
          >
            <RiImageLine className="size-4" />
            {uploading === "image"
              ? t.sheet.creatives.uploading
              : t.sheet.creatives.image}
          </Button>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void send("image", file);
            }}
          />
        </>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={uploading !== null}
        onClick={() => logoRef.current?.click()}
      >
        <RiUploadCloud2Line className="size-4" />
        {uploading === "logo"
          ? t.sheet.creatives.uploading
          : t.sheet.creatives.logo}
      </Button>
      <input
        ref={logoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void send("logo", file);
        }}
      />
    </>
  );
}

type FormState = {
  type: AdCreativeType;
  slot: AdSlot | "";
  brandName: string;
  title: string;
  body: string;
  ctaText: string;
  accentColor: string;
  href: string;
};

function toForm(target: AdCreative | "new"): FormState {
  if (target === "new") {
    return {
      type: "card",
      slot: "",
      brandName: "",
      title: "",
      body: "",
      ctaText: "",
      accentColor: "",
      href: "",
    };
  }
  return {
    type: target.type,
    slot: target.slot ?? "",
    brandName: target.brandName,
    title: target.title,
    body: target.body,
    ctaText: target.ctaText,
    accentColor: target.accentColor ?? "",
    href: target.href,
  };
}

function CreativeDialog({
  target,
  campaign,
  imageSlots,
  onClose,
  onSaved,
}: {
  target: AdCreative | "new" | null;
  campaign: AdCampaign;
  imageSlots: AdSlot[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT("ads");
  const { labelOf } = useRateCard();
  const isNew = target === "new";
  const [form, setForm] = React.useState<FormState>(() =>
    toForm(target ?? "new"),
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<{
    field: string;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (target) {
      setForm(toForm(target));
      setError(null);
    }
  }, [target]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError((e) => (e && e.field === key ? null : e));
  };

  const save = async () => {
    if (saving) return;
    if (!form.brandName.trim()) {
      setError({ field: "brandName", message: t.sheet.creatives.brandRequired });
      return;
    }
    if (!HREF_RE.test(form.href.trim())) {
      setError({ field: "href", message: t.sheet.creatives.hrefInvalid });
      return;
    }
    if (form.accentColor.trim() && !HEX_RE.test(form.accentColor.trim())) {
      setError({
        field: "accentColor",
        message: t.sheet.creatives.accentInvalid,
      });
      return;
    }
    if (form.type === "image" && !form.slot) {
      setError({ field: "slot", message: t.sheet.creatives.slotRequired });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        // Card kreativda slot serverda baribir `null` bo'ladi.
        ...(form.type === "image" ? { slot: form.slot as AdSlot } : {}),
        brandName: form.brandName.trim(),
        title: form.title.trim(),
        body: form.body.trim(),
        ctaText: form.ctaText.trim(),
        accentColor: form.accentColor.trim(),
        href: form.href.trim(),
      };
      if (isNew) {
        await createCreative(campaign.id, { type: form.type, ...payload });
      } else if (target) {
        await updateCreative(target.id, payload);
      }
      toast.success(t.toasts.creativeSaved);
      onSaved();
    } catch (err) {
      if (err instanceof PortalApiError && err.field) {
        setError({ field: err.field, message: err.message });
      }
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const errorFor = (field: string) =>
    error?.field === field ? (
      <p className="text-xs text-destructive">{error.message}</p>
    ) : null;

  const typeOptions = [
    { value: "card", label: t.sheet.creatives.typeCard },
    ...(imageSlots.length > 0
      ? [{ value: "image", label: t.sheet.creatives.typeImage }]
      : []),
  ];

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && !saving && onClose()}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isNew
              ? t.sheet.creatives.createTitle
              : t.sheet.creatives.editTitle}
          </DialogTitle>
          <DialogDescription>
            {imageSlots.length === 0
              ? t.sheet.creatives.noImageSlots
              : t.sheet.creatives.cardSlotHint}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isNew && (
            <div className="space-y-2">
              <Label>{t.sheet.creatives.type}</Label>
              <SelectMenu
                fullWidth
                label={
                  typeOptions.find((o) => o.value === form.type)?.label ??
                  t.sheet.creatives.typeCard
                }
                value={form.type}
                options={typeOptions}
                onSelect={(v) => set("type", v as AdCreativeType)}
              />
            </div>
          )}

          {form.type === "image" && (
            <div className="space-y-2">
              <Label>{t.sheet.creatives.slot}</Label>
              <SelectMenu
                fullWidth
                label={
                  form.slot ? labelOf(form.slot) : t.sheet.creatives.slotRequired
                }
                value={form.slot}
                options={imageSlots.map((slot) => ({
                  value: slot,
                  label: labelOf(slot),
                }))}
                onSelect={(v) => set("slot", v as AdSlot)}
              />
              {errorFor("slot")}
            </div>
          )}

          <TextField
            label={t.sheet.creatives.brandName}
            value={form.brandName}
            limit={CREATIVE_LIMITS.brandName}
            onChange={(v) => set("brandName", v)}
            error={errorFor("brandName")}
          />
          <TextField
            label={t.sheet.creatives.title}
            value={form.title}
            limit={CREATIVE_LIMITS.title}
            onChange={(v) => set("title", v)}
            error={errorFor("title")}
          />

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>{t.sheet.creatives.body}</Label>
              <CharCounter value={form.body} limit={CREATIVE_LIMITS.body} />
            </div>
            <Textarea
              rows={2}
              maxLength={CREATIVE_LIMITS.body}
              className="min-h-20 text-[0.9375rem] md:text-[0.9375rem]"
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
            />
            {errorFor("body")}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t.sheet.creatives.cta}
              value={form.ctaText}
              limit={CREATIVE_LIMITS.ctaText}
              onChange={(v) => set("ctaText", v)}
              error={errorFor("ctaText")}
            />
            <div className="space-y-2">
              <Label>{t.sheet.creatives.accent}</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="#1E88E5"
                  className="h-10 font-mono text-[0.9375rem] md:text-[0.9375rem]"
                  value={form.accentColor}
                  onChange={(e) => set("accentColor", e.target.value)}
                />
                <span
                  aria-hidden
                  className="size-7 shrink-0 rounded-md border border-border"
                  style={
                    HEX_RE.test(form.accentColor.trim())
                      ? { backgroundColor: form.accentColor.trim() }
                      : undefined
                  }
                />
              </div>
              {errorFor("accentColor")}
            </div>
          </div>

          <TextField
            label={t.sheet.creatives.href}
            value={form.href}
            limit={CREATIVE_LIMITS.href}
            onChange={(v) => set("href", v)}
            error={errorFor("href")}
            mono
            placeholder="https://"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
          >
            {t.actions.cancel}
          </Button>
          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving
              ? t.sheet.creatives.saving
              : isNew
                ? t.sheet.creatives.create
                : t.sheet.creatives.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
