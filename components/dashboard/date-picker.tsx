"use client";

import * as React from "react";
import { format } from "date-fns";
import { enUS, ru, uz, type Locale as DateLocale } from "date-fns/locale";
import { RiCalendarLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/provider";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";

const DATE_LOCALES: Record<Locale, DateLocale> = { en: enUS, ru, uz };

function parseDateKey(key: string): Date | undefined {
  const d = new Date(`${key}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const dateLocale = DATE_LOCALES[useLocale()];
  const selected = parseDateKey(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-between border-input bg-field font-normal hover:bg-field",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selected
              ? format(selected, "d MMMM yyyy", { locale: dateLocale })
              : placeholder}
          </span>
          <RiCalendarLine className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={dateLocale}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(toDateKey(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
