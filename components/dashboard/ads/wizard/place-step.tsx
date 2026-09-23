"use client";

import { PlaceCard } from "@/components/dashboard/ads/rate-card-tab";
import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdSlot } from "@/lib/api/ads";

export function PlaceStep({
  selected,
  onToggle,
}: {
  selected: AdSlot[];
  onToggle: (slot: AdSlot) => void;
}) {
  const { specs } = useRateCard();
  const maxDaily = specs.reduce((m, s) => Math.max(m, s.dailyImpressions), 0);

  return (
    <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
      {specs.length === 0
        ? Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[13.5rem] w-full rounded-xl" />
          ))
        : specs.map((spec) => (
            <PlaceCard
              key={spec.id}
              spec={spec}
              maxDaily={maxDaily}
              selected={selected.includes(spec.id)}
              onChoose={() => onToggle(spec.id)}
            />
          ))}
    </div>
  );
}
