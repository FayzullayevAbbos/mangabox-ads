"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { RiSunLine, RiMoonLine, RiComputerLine } from "@remixicon/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Yorug'/Qorong'i/Tizim mavzularini almashtirish. `next-themes` `class`
 * strategiyasidan foydalanadi (root `<html>` ga `.dark` qo'shiladi).
 * SSR'da mavzu nomalum bo'lgani uchun ikona faqat mount bo'lgach ko'rsatiladi —
 * bu hydration nomuvofiqligining oldini oladi.
 */
export function ModeToggle({
  className,
  align = "end",
  side = "bottom",
}: {
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}) {
  const c = useT("common");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={c.theme.label}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
          className,
        )}
      >
        {/* Sun/moon cross-fade; hidden until mounted to avoid SSR mismatch. */}
        <RiSunLine
          className={cn(
            "size-4 transition-all",
            mounted ? "scale-100 rotate-0 dark:scale-0 dark:-rotate-90" : "scale-0",
          )}
        />
        <RiMoonLine
          className={cn(
            "absolute size-4 transition-all",
            mounted ? "scale-0 rotate-90 dark:scale-100 dark:rotate-0" : "scale-0",
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="min-w-36">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <RiSunLine className="size-4" />
            {c.theme.light}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <RiMoonLine className="size-4" />
            {c.theme.dark}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <RiComputerLine className="size-4" />
            {c.theme.system}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
