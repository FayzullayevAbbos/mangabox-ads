import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TextField({
  label,
  value,
  limit,
  onChange,
  error,
  mono,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  limit: number;
  onChange: (value: string) => void;
  error?: React.ReactNode;
  mono?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <CharCounter value={value} limit={limit} />
      </div>
      <Input
        maxLength={limit}
        placeholder={placeholder}
        className={cn(
          "h-10 text-[0.9375rem] md:text-[0.9375rem]",
          mono && "font-mono",
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ?? (hint && <p className="text-xs text-muted-foreground">{hint}</p>)}
    </div>
  );
}

export function CharCounter({ value, limit }: { value: string; limit: number }) {
  return (
    <span
      className={cn(
        "font-mono text-[0.6875rem] text-muted-foreground",
        value.length >= limit && "text-destructive",
      )}
    >
      {value.length}/{limit}
    </span>
  );
}
