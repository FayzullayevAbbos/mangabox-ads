"use client";

import * as React from "react";
import { RiCheckLine, RiErrorWarningLine, RiFileCopyLine } from "@remixicon/react";
import { toast } from "sonner";

import { ratioLabel } from "@/components/dashboard/ads/image-file";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { SlotPreview } from "@/components/dashboard/ads/slot-preview";
import { CharCounter, TextField } from "@/components/dashboard/ads/text-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CREATIVE_LIMITS,
  HEX_RE,
  type AdCampaign,
  type AdSlot,
} from "@/lib/api/ads";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

import { ImagePicker } from "./image-picker";
import { SitePreview } from "./site-preview";
import { WizardSection } from "./wizard-section";
import {
  campaignLogo,
  draftOf,
  hasErrors,
  posterOf,
  slotCreative,
  validateCreative,
  type CreativeDraft,
  type CreativeField,
  type CreativeFiles,
  type CreativeTarget,
  type SlotDrafts,
  type SlotErrors,
} from "./wizard-model";

function useObjectUrlMap(
  files: Partial<Record<AdSlot, File>>,
): Partial<Record<AdSlot, string>> {
  const urls = React.useMemo(() => {
    const next: Partial<Record<AdSlot, string>> = {};
    for (const [slot, file] of Object.entries(files) as [AdSlot, File][]) {
      next[slot] = URL.createObjectURL(file);
    }
    return next;
  }, [files]);
  React.useEffect(
    () => () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url)),
    [urls],
  );
  return urls;
}

export function CreativeStep({
  campaign,
  drafts,
  files,
  posterSlots,
  errors,
  active,
  onActive,
  onDrafts,
  onFiles,
  onErrors,
}: {
  campaign: AdCampaign;
  drafts: SlotDrafts;
  files: CreativeFiles;
  posterSlots: AdSlot[];
  errors: SlotErrors;
  active: AdSlot;
  onActive: (slot: AdSlot) => void;
  onDrafts: (drafts: SlotDrafts) => void;
  onFiles: (files: CreativeFiles) => void;
  onErrors: (errors: SlotErrors) => void;
}) {
  const t = useT("ads");
  const w = useT("portal").wizard.creative;
  const c = t.sheet.creatives;
  const { specOf, labelOf } = useRateCard();
  const localLogos = useObjectUrlMap(files.logos);
  const localPosters = useObjectUrlMap(files.posters);

  const slots = campaign.slots.map((line) => line.slot);
  const draft = draftOf(drafts, active);
  const slotErrors = errors[active] ?? {};
  const spec = posterSlots.includes(active) ? (specOf(active)?.image ?? null) : null;

  const setError = (target: CreativeTarget, message?: string) => {
    if (slotErrors[target] === message) return;
    const next = { ...slotErrors };
    if (message) next[target] = message;
    else delete next[target];
    onErrors({ ...errors, [active]: next });
  };

  const set = <K extends keyof CreativeDraft>(key: K, value: CreativeDraft[K]) => {
    onDrafts({ ...drafts, [active]: { ...draft, [key]: value } });
    setError(key);
  };

  const logoSrc = (slot: AdSlot): string | null => {
    if (localLogos[slot]) return localLogos[slot] ?? null;
    const own = slotCreative(campaign, slot);
    return own ? own.logoUrl : campaignLogo(campaign);
  };

  const posterSrc = (slot: AdSlot): string | null => {
    if (!posterSlots.includes(slot)) return null;
    if (localPosters[slot]) return localPosters[slot] ?? null;
    if (files.removedPosters.includes(slot)) return null;
    return posterOf(campaign, slot)?.imageUrl ?? null;
  };

  const pickPoster = (file: File) => {
    setError("poster");
    onFiles({
      ...files,
      posters: { ...files.posters, [active]: file },
      removedPosters: files.removedPosters.filter((s) => s !== active),
    });
  };

  const removePoster = () => {
    setError("poster");
    const posters = { ...files.posters };
    delete posters[active];
    onFiles({
      ...files,
      posters,
      removedPosters: posterOf(campaign, active)
        ? [...files.removedPosters, active]
        : files.removedPosters,
    });
  };

  const pickLogo = (file: File | null) => {
    setError("logo");
    const logos = { ...files.logos };
    if (file) logos[active] = file;
    else delete logos[active];
    onFiles({ ...files, logos });
  };

  // Matn va (tanlangan bo'lsa) logotip boshqa joylarga ko'chadi; rasm
  // ko'chmaydi — har joyning o'lchami boshqa.
  const applyToAll = () => {
    const next: SlotDrafts = {};
    for (const slot of slots) next[slot] = { ...draft };
    onDrafts(next);
    const logo = files.logos[active];
    if (logo) {
      const logos: CreativeFiles["logos"] = {};
      for (const slot of slots) logos[slot] = logo;
      onFiles({ ...files, logos });
    }
    const cleared: SlotErrors = {};
    for (const slot of slots) {
      const { poster } = errors[slot] ?? {};
      if (poster) cleared[slot] = { poster };
    }
    onErrors(cleared);
    toast.success(w.appliedAll);
  };

  const slotStatus = (slot: AdSlot): "ready" | "error" | "empty" => {
    if (hasErrors(errors[slot])) return "error";
    return validateCreative(draftOf(drafts, slot)).length === 0 ? "ready" : "empty";
  };

  const accentValid = HEX_RE.test(draft.accentColor.trim());
  const accentLive =
    draft.accentColor.trim() && !accentValid ? c.accentInvalid : undefined;
  const errorText = (field: CreativeField, fallback?: string) => {
    const message = slotErrors[field] ?? fallback;
    return message ? (
      <p data-field-error className="text-xs text-destructive">
        {message}
      </p>
    ) : undefined;
  };

  return (
    <div className="space-y-6">
      {slots.length > 1 && (
        <WizardSection title={w.slotPickerTitle} description={w.slotTabsHint}>
          <div role="tablist" className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {slots.map((slot, index) => {
              const status = slotStatus(slot);
              const selected = slot === active;
              return (
                <button
                  key={slot}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onActive(slot)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                    status === "error" && !selected && "border-destructive/50",
                  )}
                >
                  <SlotPreview slot={slot} active={selected} className="w-9 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm font-semibold",
                        selected && "text-primary",
                      )}
                    >
                      {index + 1}. {labelOf(slot)}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex items-center gap-1 text-xs",
                        status === "ready" && "text-success",
                        status === "error" && "text-destructive",
                        status === "empty" && "text-muted-foreground",
                      )}
                    >
                      {status === "ready" && <RiCheckLine className="size-3.5" />}
                      {status === "error" && <RiErrorWarningLine className="size-3.5" />}
                      {status === "ready"
                        ? w.statusReady
                        : status === "error"
                          ? w.statusError
                          : w.statusEmpty}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </WizardSection>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:gap-8">
        <div className="space-y-6">
          <WizardSection key={active}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-heading text-base font-semibold tracking-tight">
                {slots.length > 1
                  ? interpolate(w.bannerFor, { slot: labelOf(active) })
                  : w.textSection}
              </h2>
              {slots.length > 1 && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary tabular-nums">
                  {slots.indexOf(active) + 1}/{slots.length}
                </span>
              )}
            </div>
            <TextField
              label={c.brandName}
              value={draft.brandName}
              limit={CREATIVE_LIMITS.brandName}
              placeholder={w.brandPlaceholder}
              onChange={(v) => set("brandName", v)}
              error={errorText("brandName")}
            />
            <TextField
              label={c.title}
              value={draft.title}
              limit={CREATIVE_LIMITS.title}
              placeholder={w.titlePlaceholder}
              onChange={(v) => set("title", v)}
              error={errorText("title")}
            />
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="wizard-body">{c.body}</Label>
                <CharCounter value={draft.body} limit={CREATIVE_LIMITS.body} />
              </div>
              <Textarea
                id="wizard-body"
                rows={3}
                maxLength={CREATIVE_LIMITS.body}
                placeholder={w.bodyPlaceholder}
                className="min-h-20 text-[0.9375rem] md:text-[0.9375rem]"
                value={draft.body}
                aria-invalid={slotErrors.body ? true : undefined}
                onChange={(e) => set("body", e.target.value)}
              />
              {errorText("body")}
            </div>
            <TextField
              label={c.href}
              value={draft.href}
              limit={CREATIVE_LIMITS.href}
              placeholder="https://"
              mono
              hint={w.hrefHint}
              onChange={(v) => set("href", v)}
              error={errorText("href")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label={c.cta}
                value={draft.ctaText}
                limit={CREATIVE_LIMITS.ctaText}
                placeholder={w.ctaPlaceholder}
                onChange={(v) => set("ctaText", v)}
                error={errorText("ctaText")}
              />
              <div className="space-y-2">
                <Label htmlFor="wizard-accent">{c.accent}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={c.accent}
                    value={accentValid ? draft.accentColor.trim() : "#7c3aed"}
                    onChange={(e) => set("accentColor", e.target.value)}
                    className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
                  />
                  <Input
                    id="wizard-accent"
                    placeholder="#1E88E5"
                    maxLength={CREATIVE_LIMITS.accentColor}
                    className="h-10 font-mono text-[0.9375rem] md:text-[0.9375rem]"
                    value={draft.accentColor}
                    onChange={(e) => set("accentColor", e.target.value)}
                  />
                </div>
                {errorText("accentColor", accentLive)}
              </div>
            </div>
            <ImagePicker
              label={w.logo}
              hint={w.logoHint}
              src={logoSrc(active)}
              frameClassName="size-16 rounded-full"
              canRemove={!!files.logos[active]}
              error={slotErrors.logo}
              onPick={pickLogo}
              onRemove={() => pickLogo(null)}
              onError={(message) => setError("logo", message)}
            />
            {spec && (
              <ImagePicker
                label={w.poster}
                hint={interpolate(w.posterSpec, {
                  min: `${spec.minWidth}×${spec.minHeight}`,
                  ratio: ratioLabel(spec.ratio),
                })}
                src={posterSrc(active)}
                spec={spec}
                frameClassName={spec.ratio < 1 ? "h-24 w-16" : "h-16 w-28"}
                canRemove
                error={slotErrors.poster}
                onPick={pickPoster}
                onRemove={removePoster}
                onError={(message) => setError("poster", message)}
              />
            )}
            {spec && <p className="text-xs text-muted-foreground">{w.postersText}</p>}
            {slots.length > 1 && (
              <div className="border-t border-border pt-4">
                <Button type="button" variant="outline" size="sm" onClick={applyToAll}>
                  <RiFileCopyLine data-icon="inline-start" />
                  {w.applyAll}
                </Button>
              </div>
            )}
          </WizardSection>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6">
          <p className="text-sm font-medium text-muted-foreground">
            {w.preview}
            {slots.length > 1 && ` · ${labelOf(active)}`}
          </p>
          <SitePreview
            slots={slots}
            active={active}
            dataOf={(slot) => ({
              draft: draftOf(drafts, slot),
              logoSrc: logoSrc(slot),
              imageSrc: posterSrc(slot),
            })}
          />
        </aside>
      </div>
    </div>
  );
}
