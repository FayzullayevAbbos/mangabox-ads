"use client";

import * as React from "react";
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import { toast } from "sonner";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import {
  NumberField,
  QuoteSummary,
} from "@/components/dashboard/ads/quote-parts";
import { SelectMenu } from "@/components/dashboard/select-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CAMPAIGN_NAME_LIMIT,
  createCampaign,
  getCampaignQuote,
  PortalApiError,
  MAX_CAMPAIGN_DAYS,
  MAX_SHARE_PERCENT,
  MIN_CAMPAIGN_DAYS,
  MIN_ORDER_SOM,
  MIN_SHARE_PERCENT,
  updateCampaign,
  type AdCampaign,
  type AdQuote,
  type AdSlot,
  type CampaignSlotInput,
} from "@/lib/api/ads";
import { formatCount, todayKey } from "@/lib/format";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export type CampaignFormTarget = AdCampaign | "new" | null;

/** Narxnomada hisoblangan kampaniya — forma shu qiymatlar bilan ochiladi. */
export type CampaignDraft = {
  slot: AdSlot;
  sharePercent: number;
  days: number;
};

export function CampaignFormSheet({
  target,
  draft,
  onClose,
  onSaved,
}: {
  target: CampaignFormTarget;
  draft?: CampaignDraft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT("ads");
  const isNew = target === "new";

  return (
    <Sheet open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {isNew ? t.form.createTitle : t.form.editTitle}
          </SheetTitle>
          <SheetDescription>{t.form.description}</SheetDescription>
        </SheetHeader>
        {target !== null && (
          <CampaignForm
            key={isNew ? `new:${draft?.slot ?? ""}:${draft?.sharePercent ?? ""}:${draft?.days ?? ""}` : target.id}
            target={target}
            draft={draft}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

type FormState = {
  name: string;
  lines: CampaignSlotInput[];
  startDay: string;
  days: number;
  frequencyCap: number;
};

function toForm(
  target: AdCampaign | "new",
  firstSlot: AdSlot | null,
  draft?: CampaignDraft,
): FormState {
  if (target === "new") {
    const slot = draft?.slot ?? firstSlot;
    return {
      name: "",
      lines: slot
        ? [{ slot, sharePercent: draft?.sharePercent ?? MIN_SHARE_PERCENT }]
        : [],
      startDay: todayKey(),
      days: draft?.days ?? 30,
      frequencyCap: 3,
    };
  }
  return {
    name: target.name,
    lines: target.slots.map((line) => ({
      slot: line.slot,
      sharePercent: line.sharePercent,
    })),
    startDay: target.startDay,
    days: target.days,
    frequencyCap: target.frequencyCap,
  };
}

function CampaignForm({
  target,
  draft,
  onClose,
  onSaved,
}: {
  target: AdCampaign | "new";
  draft?: CampaignDraft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT("ads");
  const { specs, labelOf } = useRateCard();
  const isNew = target === "new";

  const [form, setForm] = React.useState<FormState>(() =>
    toForm(target, specs[0]?.id ?? null, draft),
  );
  const [quote, setQuote] = React.useState<AdQuote | null>(null);
  const [quoting, setQuoting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<{
    field: string;
    message: string;
  } | null>(null);

  // Narxnoma formadan keyin yuklansa birinchi slot qatori bo'sh qolardi.
  React.useEffect(() => {
    if (form.lines.length === 0 && specs.length > 0 && isNew) {
      setForm((f) => ({
        ...f,
        lines: [{ slot: specs[0].id, sharePercent: MIN_SHARE_PERCENT }],
      }));
    }
  }, [specs, form.lines.length, isNew]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError((e) => (e && e.field === key ? null : e));
  };

  /** Jonli narx — har o'zgarishda, 300 ms debounce bilan. */
  React.useEffect(() => {
    if (form.lines.length === 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    const timer = setTimeout(() => {
      getCampaignQuote(form.lines, form.days)
        .then((result) => {
          if (!cancelled) setQuote(result);
        })
        .catch(() => {
          if (!cancelled) setQuote(null);
        })
        .finally(() => {
          if (!cancelled) setQuoting(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.lines, form.days]);

  const shareHintFor = (slot: AdSlot, sharePercent: number) => {
    const spec = specs.find((s) => s.id === slot);
    if (!spec) return undefined;
    return interpolate(t.rateCard.calculator.shareHint, {
      share: sharePercent,
      count: formatCount(
        Math.round((spec.dailyImpressions * sharePercent) / 100),
      ),
    });
  };

  const usedSlots = new Set(form.lines.map((l) => l.slot));
  const freeSlots = specs.filter((s) => !usedSlots.has(s.id));

  const addLine = () => {
    const next = freeSlots[0];
    if (!next) return;
    set("lines", [
      ...form.lines,
      { slot: next.id, sharePercent: MIN_SHARE_PERCENT },
    ]);
  };

  const updateLine = (index: number, patch: Partial<CampaignSlotInput>) => {
    set(
      "lines",
      form.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  };

  const removeLine = (index: number) => {
    set(
      "lines",
      form.lines.filter((_, i) => i !== index),
    );
  };

  const belowMinimum = quote !== null && quote.totalSom < MIN_ORDER_SOM;

  const save = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      setError({ field: "name", message: t.form.nameRequired });
      return;
    }
    if (form.lines.length === 0 || belowMinimum) {
      setError({ field: "slots", message: t.form.minOrder });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createCampaign({
          name: form.name.trim(),
          slots: form.lines,
          startDay: form.startDay,
          days: form.days,
          frequencyCap: form.frequencyCap,
        });
        toast.success(t.toasts.created);
      } else {
        await updateCampaign(target.id, {
          name: form.name.trim(),
          slots: form.lines,
          startDay: form.startDay,
          days: form.days,
          frequencyCap: form.frequencyCap,
        });
        toast.success(t.toasts.updated);
      }
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

  return (
    <div className="space-y-5 px-4 pb-6">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="campaign-name">{t.form.name}</Label>
          <span
            className={cn(
              "font-mono text-[0.6875rem] text-muted-foreground",
              form.name.length >= CAMPAIGN_NAME_LIMIT && "text-destructive",
            )}
          >
            {form.name.length}/{CAMPAIGN_NAME_LIMIT}
          </span>
        </div>
        <Input
          id="campaign-name"
          maxLength={CAMPAIGN_NAME_LIMIT}
          className="h-10 text-[0.9375rem] md:text-[0.9375rem]"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        {errorFor("name")}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t.form.slots}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={freeSlots.length === 0}
            onClick={addLine}
          >
            <RiAddLine className="size-4" />
            {t.form.addSlot}
          </Button>
        </div>

        {form.lines.map((line, index) => (
          <div
            key={line.slot}
            className="space-y-3 rounded-lg bg-muted/40 px-4 py-3.5"
          >
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <SelectMenu
                  fullWidth
                  label={labelOf(line.slot)}
                  value={line.slot}
                  options={specs
                    .filter((s) => s.id === line.slot || !usedSlots.has(s.id))
                    .map((s) => ({ value: s.id, label: s.label }))}
                  onSelect={(v) => updateLine(index, { slot: v as AdSlot })}
                />
              </div>
              {form.lines.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground"
                  aria-label={t.form.removeSlot}
                  onClick={() => removeLine(index)}
                >
                  <RiCloseLine className="size-4" />
                </Button>
              )}
            </div>
            <NumberField
              label={t.rateCard.calculator.share}
              value={line.sharePercent}
              min={MIN_SHARE_PERCENT}
              max={MAX_SHARE_PERCENT}
              onChange={(v) => updateLine(index, { sharePercent: v })}
              suffix="%"
              hint={shareHintFor(line.slot, line.sharePercent)}
            />
          </div>
        ))}
        {errorFor("slots")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="campaign-start">{t.form.startDay}</Label>
          <Input
            id="campaign-start"
            type="date"
            className="h-10 text-[0.9375rem] md:text-[0.9375rem]"
            value={form.startDay}
            onChange={(e) => set("startDay", e.target.value)}
          />
          {errorFor("startDay")}
        </div>
        <NumberField
          label={t.form.days}
          value={form.days}
          min={MIN_CAMPAIGN_DAYS}
          max={MAX_CAMPAIGN_DAYS}
          onChange={(v) => set("days", v)}
        />
      </div>

      <NumberField
        label={t.form.frequencyCap}
        value={form.frequencyCap}
        min={1}
        max={10}
        onChange={(v) => set("frequencyCap", v)}
        hint={t.form.frequencyCapHint}
      />

      <Separator />

      {/* Summa inputi YO'Q — narx faqat narxnomadan. */}
      <div>
        <p className="text-sm font-medium">{t.form.quoteTitle}</p>
        <div className="mt-3">
          <QuoteSummary quote={quote} loading={quoting} />
        </div>
        {belowMinimum && (
          <p className="mt-2 text-xs text-destructive">{t.form.minOrder}</p>
        )}
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
        <Button
          type="button"
          size="lg"
          disabled={saving || quoting}
          onClick={() => void save()}
        >
          {saving ? t.form.saving : isNew ? t.form.create : t.form.save}
        </Button>
      </div>
    </div>
  );
}
