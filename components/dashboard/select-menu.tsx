"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

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
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className={cn(fullWidth && "w-full", className)}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
