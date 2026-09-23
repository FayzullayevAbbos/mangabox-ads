"use client";

import * as React from "react";
import Link from "next/link";
import { RiLockLine } from "@remixicon/react";

import { LoadErrorState } from "@/components/dashboard/page-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCampaign, type AdCampaign } from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";

import { CampaignWizard } from "./campaign-wizard";
import { isEditableCampaign, type WizardStep } from "./wizard-model";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; campaign: AdCampaign };

export function CampaignSetup({
  campaignId,
  requestedStep,
}: {
  campaignId: string;
  requestedStep: WizardStep | null;
}) {
  const p = useT("portal");
  const [state, setState] = React.useState<State>({ status: "loading" });
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    getCampaign(campaignId)
      .then((campaign) => {
        if (!cancelled) setState({ status: "ready", campaign });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : p.campaignPage.notFound,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, attempt, p.campaignPage.notFound]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  };

  if (state.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (state.status === "error") {
    return <LoadErrorState message={state.message} onRetry={retry} />;
  }

  if (!isEditableCampaign(state.campaign)) {
    return <Locked campaignId={campaignId} />;
  }

  return (
    <CampaignWizard
      initial={state.campaign}
      pick={null}
      requestedStep={requestedStep}
    />
  );
}

function Locked({ campaignId }: { campaignId: string }) {
  const l = useT("portal").wizard.locked;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <RiLockLine className="size-5" />
      </span>
      <h1 className="font-heading text-xl font-semibold tracking-tight">{l.title}</h1>
      <p className="text-sm text-muted-foreground">{l.text}</p>
      <Button asChild className="mt-2">
        <Link href={`/dashboard/campaigns/${campaignId}`}>{l.open}</Link>
      </Button>
    </div>
  );
}
