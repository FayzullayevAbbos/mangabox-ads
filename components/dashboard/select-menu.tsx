"use client";

import { RiExpandUpDownLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Filtrlar uchun sodda tanlov menyusi (select o'rniga dropdown). */
export function SelectMenu({
  label,
  value,
  options,
  onSelect,
  fullWidth,
  className,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onSelect: (value: string) => void;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between font-normal",
            fullWidth && "w-full",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          <RiExpandUpDownLine className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.value}
            checked={value === o.value}
            onCheckedChange={() => onSelect(o.value)}
          >
            <span className="truncate">{o.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Foydalanuvchi roli: bepul / pro / admin. */
export function RoleBadge({ role }: { role: string }) {
  const t = useT("analytics");
  const label =
    role === "premium"
      ? t.users.roles.premium
      : role === "admin"
        ? t.users.roles.admin
        : t.users.roles.free;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
        role === "premium"
          ? "bg-primary/10 text-primary"
          : role === "admin"
            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
