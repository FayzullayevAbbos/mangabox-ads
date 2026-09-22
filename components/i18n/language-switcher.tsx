"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RiTranslate2, RiExpandUpDownLine } from "@remixicon/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LOCALE_COOKIE,
  locales,
  localeNames,
  type Locale,
} from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageSwitcher({
  className,
  align = "end",
  side = "bottom",
  showLabel = true,
}: {
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  showLabel?: boolean;
}) {
  const locale = useLocale();
  const c = useT("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function selectLocale(next: string) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${ONE_YEAR};samesite=lax`;
    // Re-render server components so they read the new locale cookie, and let
    // the root layout feed the matching dictionary back to the client provider.
    startTransition(() => router.refresh());
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={c.language}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60",
          className,
        )}
      >
        <RiTranslate2 className="size-4" />
        {showLabel && <span>{localeNames[locale]}</span>}
        <RiExpandUpDownLine className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="min-w-40">
        <DropdownMenuRadioGroup value={locale} onValueChange={selectLocale}>
          {locales.map((l: Locale) => (
            <DropdownMenuRadioItem key={l} value={l}>
              {localeNames[l]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
