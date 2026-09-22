import { cn } from "@/lib/utils";

// MangaBox Analitika brend belgisi — quti (box) ichidagi ustunli grafik.
// `currentColor` ishlatadi, shuning uchun mavzu/kontekst rangiga moslashadi.
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("block", className)}
      role="img"
      aria-label="MangaBox"
    >
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="M8 16.5v-3" />
      <path d="M12 16.5v-6.5" />
      <path d="M16 16.5v-4.5" />
    </svg>
  );
}
