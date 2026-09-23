"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import { toast } from "sonner";

import { useCampaignActions } from "@/components/dashboard/ads/campaign-actions";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { useQuote } from "@/components/dashboard/ads/use-quote";
import { Button } from "@/components/ui/button";
import { PortalApiError, type AdCampaign, type AdSlot } from "@/lib/api/ads";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";

import { CreativeStep } from "./creative-step";
import { PlaceStep } from "./place-step";
import { PlanStep } from "./plan-step";
import { reviewChecks, ReviewStep } from "./review-step";
import { saveCreative, savePlan } from "./wizard-api";
import { setupHref } from "./wizard-links";
import {
  creativeFromCampaign,
  emptyCreative,
  firstOpenStep,
  newPlan,
  NO_FILES,
  planFromCampaign,
  stepIndex,
  suggestName,
  toggleSlot,
  validateCreative,
  WIZARD_STEPS,
  type CreativeError,
  type CreativeFiles,
  type RateCardPick,
  type WizardStep,
} from "./wizard-model";
import { WizardStepper } from "./wizard-stepper";

const NAV_BUTTON = "h-12 w-full gap-2 px-7 text-[0.9375rem] sm:w-auto sm:min-w-40";

function startStep(
  campaign: AdCampaign | null,
  pick: RateCardPick | null,
  requested: WizardStep | null,
): WizardStep {
  if (requested && (campaign || stepIndex(requested) <= 1)) return requested;
  if (campaign) return firstOpenStep(campaign);
  return pick ? "plan" : "place";
}

function syncUrl(campaign: AdCampaign | null, step: WizardStep) {
  if (campaign) {
    window.history.replaceState(null, "", setupHref(campaign.id, step));
    return;
  }
  const params = new URLSearchParams(window.location.search);
  params.set("step", step);
  window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
}

export function CampaignWizard({
  initial,
  pick,
  requestedStep,
}: {
  initial: AdCampaign | null;
  pick: RateCardPick | null;
  requestedStep: WizardStep | null;
}) {
  const w = useT("portal").wizard;
  const router = useRouter();
  const { labelOf, specOf } = useRateCard();

  const [campaign, setCampaign] = React.useState(initial);
  const [step, setStep] = React.useState<WizardStep>(() =>
    startStep(initial, pick, requestedStep),
  );
  const [plan, setPlan] = React.useState(() =>
    initial ? planFromCampaign(initial) : newPlan(pick),
  );
  const [creative, setCreative] = React.useState(() =>
    initial ? creativeFromCampaign(initial) : emptyCreative(),
  );
  const [files, setFiles] = React.useState<CreativeFiles>(NO_FILES);
  const [saving, setSaving] = React.useState(false);
  const [placeError, setPlaceError] = React.useState(false);
  const [creativeError, setCreativeError] = React.useState<CreativeError | null>(null);
  const [startDayError, setStartDayError] = React.useState<string>();

  const quote = useQuote(plan.lines, plan.days);
  const actions = useCampaignActions({
    onDone: (updated) => router.push(`/dashboard/campaigns/${updated.id}`),
  });

  React.useEffect(() => syncUrl(campaign, step), [campaign, step]);

  const suggestedName = plan.lines.length > 0 ? suggestName(plan, labelOf) : "";
  const posterSlots: AdSlot[] = (campaign?.slots ?? [])
    .map((line) => line.slot)
    .filter((slot) => specOf(slot)?.image);

  const go = (next: WizardStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canOpen = (target: WizardStep) =>
    stepIndex(target) <= 1 || campaign !== null;

  const run = async (task: () => Promise<void>) => {
    setSaving(true);
    try {
      await task();
    } catch (err) {
      if (err instanceof PortalApiError && err.field === "startDay") {
        setStartDayError(err.message);
      }
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const nextFromPlace = () => {
    if (plan.lines.length === 0) {
      setPlaceError(true);
      return;
    }
    go("plan");
  };

  const nextFromPlan = () =>
    run(async () => {
      setStartDayError(undefined);
      const saved = await savePlan(campaign, plan, suggestedName);
      setCampaign(saved);
      setPlan(planFromCampaign(saved));
      go("creative");
    });

  const nextFromCreative = () => {
    const problem = validateCreative(creative);
    setCreativeError(problem);
    if (problem || !campaign) return;
    void run(async () => {
      const updated = await saveCreative(campaign, creative, files, posterSlots);
      setCampaign(updated);
      setFiles(NO_FILES);
      go("review");
    });
  };

  const keepDraft = () => {
    toast.success(w.review.draftSaved);
    router.push("/dashboard");
  };

  const at = stepIndex(step);
  const heading = w[step];
  const ready =
    campaign !== null && Object.values(reviewChecks(campaign)).every(Boolean);
  const planBlocked =
    plan.lines.length === 0 || quote.loading || quote.quote === null || quote.belowMinimum;

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <Link
        href="/dashboard"
        className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RiArrowLeftLine className="size-4" />
        {w.back}
      </Link>

      <header>
        <p className="text-sm font-medium text-muted-foreground">
          {campaign ? campaign.name : w.newTitle}
          {" · "}
          {interpolate(w.stepOf, { current: at + 1, total: WIZARD_STEPS.length })}
        </p>
        <h1 className="mt-1.5 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {heading.title}
        </h1>
        <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground sm:text-[0.9375rem]">
          {heading.text}
        </p>
      </header>

      <WizardStepper current={step} canOpen={canOpen} onOpen={go} />

      {campaign?.rejectReason && (
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-destructive">
          <RiErrorWarningLine className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">{w.rejected}</p>
            <p className="mt-0.5 text-sm">{campaign.rejectReason}</p>
          </div>
        </div>
      )}

      {step === "place" && (
        <>
          {placeError && plan.lines.length === 0 && (
            <p className="text-sm text-destructive">{w.place.required}</p>
          )}
          <PlaceStep
            selected={plan.lines.map((line) => line.slot)}
            onToggle={(slot) => setPlan((prev) => toggleSlot(prev, slot))}
          />
        </>
      )}

      {step === "plan" && (
        <PlanStep
          plan={plan}
          suggestedName={suggestedName}
          quote={quote}
          startDayError={startDayError}
          onChange={setPlan}
        />
      )}

      {step === "creative" && campaign && (
        <CreativeStep
          campaign={campaign}
          draft={creative}
          files={files}
          posterSlots={posterSlots}
          error={creativeError}
          onDraft={(next) => {
            setCreative(next);
            setCreativeError(null);
          }}
          onFiles={setFiles}
        />
      )}

      {step === "review" && campaign && <ReviewStep campaign={campaign} onGo={go} />}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {at > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={NAV_BUTTON}
            disabled={saving}
            onClick={() => go(WIZARD_STEPS[at - 1])}
          >
            <RiArrowLeftLine className="size-4" />
            {w.nav.back}
          </Button>
        ) : (
          <span className="hidden sm:block" />
        )}

        {step === "review" && campaign ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={NAV_BUTTON}
              onClick={keepDraft}
            >
              {w.review.saveDraft}
            </Button>
            <Button
              type="button"
              size="lg"
              className={NAV_BUTTON}
              disabled={!ready || actions.busy !== null}
              onClick={() => actions.submit(campaign)}
            >
              {actions.busy ? w.review.submitting : w.review.submit}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="lg"
            className={NAV_BUTTON}
            disabled={saving || (step === "plan" && planBlocked)}
            onClick={() => {
              if (step === "place") nextFromPlace();
              else if (step === "plan") void nextFromPlan();
              else nextFromCreative();
            }}
          >
            {saving ? w.nav.saving : w.nav.next}
            {!saving && <RiArrowRightLine className="size-4" />}
          </Button>
        )}
      </div>

      {actions.dialogs}
    </div>
  );
}
