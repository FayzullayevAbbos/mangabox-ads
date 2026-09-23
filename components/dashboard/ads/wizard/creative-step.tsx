"use client";

import * as React from "react";

import { ratioLabel } from "@/components/dashboard/ads/image-file";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { CharCounter, TextField } from "@/components/dashboard/ads/text-field";
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

import { AdPreview, type PosterPreview } from "./ad-preview";
import { ImagePicker, useObjectUrl } from "./image-picker";
import { WizardSection } from "./wizard-section";
import {
  mainCard,
  posterOf,
  type CreativeDraft,
  type CreativeError,
  type CreativeFiles,
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
  draft,
  files,
  posterSlots,
  error,
  onDraft,
  onFiles,
}: {
  campaign: AdCampaign;
  draft: CreativeDraft;
  files: CreativeFiles;
  posterSlots: AdSlot[];
  error: CreativeError | null;
  onDraft: (draft: CreativeDraft) => void;
  onFiles: (files: CreativeFiles) => void;
}) {
  const t = useT("ads");
  const w = useT("portal").wizard.creative;
  const c = t.sheet.creatives;
  const { specOf, labelOf } = useRateCard();
  const localLogo = useObjectUrl(files.logo);
  const localPosters = useObjectUrlMap(files.posters);

  const set = <K extends keyof CreativeDraft>(key: K, value: CreativeDraft[K]) =>
    onDraft({ ...draft, [key]: value });

  const logoSrc = localLogo ?? mainCard(campaign)?.logoUrl ?? null;

  const posterSrc = (slot: AdSlot): string | null => {
    if (localPosters[slot]) return localPosters[slot] ?? null;
    if (files.removedPosters.includes(slot)) return null;
    return posterOf(campaign, slot)?.imageUrl ?? null;
  };

  const pickPoster = (slot: AdSlot, file: File) =>
    onFiles({
      ...files,
      posters: { ...files.posters, [slot]: file },
      removedPosters: files.removedPosters.filter((s) => s !== slot),
    });

  const removePoster = (slot: AdSlot) => {
    const posters = { ...files.posters };
    delete posters[slot];
    onFiles({
      ...files,
      posters,
      removedPosters: posterOf(campaign, slot)
        ? [...files.removedPosters, slot]
        : files.removedPosters,
    });
  };

  const previews: PosterPreview[] = posterSlots.flatMap((slot) => {
    const src = posterSrc(slot);
    const ratio = specOf(slot)?.image?.ratio;
    return src && ratio ? [{ slot, src, ratio }] : [];
  });

  const accentValid = HEX_RE.test(draft.accentColor.trim());
  const errorText = (field: CreativeError, message: string) =>
    error === field ? <p className="text-xs text-destructive">{message}</p> : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:gap-8">
      <div className="space-y-6">
        <WizardSection title={w.textSection}>
          <TextField
            label={c.brandName}
            value={draft.brandName}
            limit={CREATIVE_LIMITS.brandName}
            placeholder={w.brandPlaceholder}
            onChange={(v) => set("brandName", v)}
            error={errorText("brandName", c.brandRequired)}
          />
          <TextField
            label={c.title}
            value={draft.title}
            limit={CREATIVE_LIMITS.title}
            placeholder={w.titlePlaceholder}
            onChange={(v) => set("title", v)}
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
              onChange={(e) => set("body", e.target.value)}
            />
          </div>
          <TextField
            label={c.href}
            value={draft.href}
            limit={CREATIVE_LIMITS.href}
            placeholder="https://"
            mono
            hint={w.hrefHint}
            onChange={(v) => set("href", v)}
            error={errorText(
              "href",
              draft.href.trim() ? c.hrefInvalid : w.hrefRequired,
            )}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={c.cta}
              value={draft.ctaText}
              limit={CREATIVE_LIMITS.ctaText}
              placeholder={w.ctaPlaceholder}
              onChange={(v) => set("ctaText", v)}
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
              {draft.accentColor.trim() && !accentValid && (
                <p className="text-xs text-destructive">{c.accentInvalid}</p>
              )}
            </div>
          </div>
          <ImagePicker
            label={w.logo}
            hint={w.logoHint}
            src={logoSrc}
            frameClassName="size-16 rounded-full"
            canRemove={!!files.logo}
            onPick={(file) => onFiles({ ...files, logo: file })}
            onRemove={() => onFiles({ ...files, logo: null })}
          />
        </WizardSection>

        {posterSlots.length > 0 && (
          <WizardSection title={w.posters} description={w.postersText}>
            {posterSlots.map((slot) => {
              const spec = specOf(slot)?.image ?? null;
              return (
                <ImagePicker
                  key={slot}
                  label={labelOf(slot)}
                  hint={
                    spec
                      ? interpolate(w.posterSpec, {
                          min: `${spec.minWidth}×${spec.minHeight}`,
                          ratio: ratioLabel(spec.ratio),
                        })
                      : undefined
                  }
                  src={posterSrc(slot)}
                  spec={spec}
                  frameClassName={spec && spec.ratio < 1 ? "h-24 w-16" : "h-16 w-28"}
                  canRemove
                  onPick={(file) => pickPoster(slot, file)}
                  onRemove={() => removePoster(slot)}
                />
              );
            })}
          </WizardSection>
        )}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-6">
        <p className="text-sm font-medium text-muted-foreground">{w.preview}</p>
        <AdPreview draft={draft} logoSrc={logoSrc} posters={previews} />
      </aside>
    </div>
  );
}
