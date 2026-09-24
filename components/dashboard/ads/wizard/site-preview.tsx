"use client";

import * as React from "react";
import { Albert_Sans } from "next/font/google";

import { useRateCard } from "@/components/dashboard/ads/rate-card-context";
import type { AdSlot } from "@/lib/api/ads";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

import type { CreativeDraft } from "./wizard-model";

/*
 * mongaboxuz-mainpage `components/sponsored/*` ning telefondagi (390px)
 * nusxasi: saytdagi `clamp()` qiymatlari shu kenglik uchun hisoblangan.
 * Sayt o'zgarsa shu yerni ham moslash kerak — maqsad mijoz yuborishdan
 * oldin aynan efirdagi ko'rinishni ko'rishi.
 */

const siteFont = Albert_Sans({ subsets: ["latin", "latin-ext"] });

/** Telefon kengligi va sayt konteynerining chekkasi (o'lchangan: 14px). */
const PHONE_WIDTH = 390;
const GUTTER = 14;
/** Belgi mijoz portalining emas, saytning tilida (asosiy auditoriya — uz). */
const SITE_LABEL = "Reklama";

/** Saytning qorong'i mavzu tokenlari (`globals.css` → `--color-wt-*`). */
const SITE = {
  bg: "lab(3.4 0.49 -0.69)",
  bgSection: "oklch(0.2 0.01 304)",
  bgSecondary: "oklch(0.25 0.012 303)",
  bgEtc: "oklch(0.305 0.012 303)",
  line: "oklch(0.285 0.013 303)",
  lineThumb: "rgba(255, 255, 255, 0.08)",
  title: "oklch(0.965 0.005 78)",
  secondary: "oklch(0.85 0.005 70)",
  minor: "oklch(0.62 0.005 70)",
  brand: "oklch(0.724 0.187 49)",
  scrim:
    "linear-gradient(90deg, oklch(0.11 0.006 305 / 0.94) 0%, oklch(0.11 0.006 305 / 0.78) 42%, oklch(0.11 0.006 305 / 0.34) 100%)",
} as const;

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

type Accent = { background: string; foreground: string };

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Saytdagi `sponsoredAccent` bilan bir xil: yorug' rangda matn qora. */
function siteAccent(color: string): Accent {
  const match = color.trim().match(HEX_RE);
  if (!match) return { background: SITE.brand, foreground: SITE.title };
  let hex = match[1];
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return {
    background: `#${hex}`,
    foreground: luminance > 0.4 ? "#141216" : "#ffffff",
  };
}

type PreviewItem = {
  brandName: string;
  title: string;
  body: string;
  ctaText: string;
  accent: Accent;
  logoUrl: string | null;
  imageUrl: string | null;
  label: string;
};

function Img({ src, className }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={className} draggable={false} />;
}

function Label({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border border-current/40 px-[5px] py-px text-[10px] leading-[14px] font-bold tracking-[0.04em] uppercase",
        className,
      )}
    >
      {text}
    </span>
  );
}

function CarouselSlide({ item }: { item: PreviewItem }) {
  const poster = item.imageUrl ?? item.logoUrl;
  const title = item.title || item.brandName;
  return (
    <div
      className="relative h-[152px] overflow-hidden rounded-[20px]"
      style={{ background: SITE.bgSection }}
    >
      {item.imageUrl ? (
        <div aria-hidden className="absolute inset-0">
          <Img src={item.imageUrl} className="size-full scale-110 object-cover blur-[8px]" />
        </div>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 140% at 100% 0%, ${item.accent.background} 0%, transparent 70%)`,
          }}
        />
      )}
      <div aria-hidden className="absolute inset-0" style={{ background: SITE.scrim }} />

      <div className="relative flex h-full items-stretch gap-3 p-4">
        <div className={cn("flex min-w-0 flex-1 flex-col", !item.ctaText && "justify-center")}>
          <span className="flex min-w-0 items-center gap-1.5 self-start">
            <span
              className="rounded-full px-2 py-1 text-[9.5px] leading-none font-bold tracking-[0.08em] uppercase"
              style={{ background: "rgb(255 255 255 / 0.2)", color: SITE.title }}
            >
              {item.label}
            </span>
            <span
              className="truncate text-[11px] font-semibold"
              style={{ color: "rgb(255 255 255 / 0.8)" }}
            >
              {item.brandName}
            </span>
          </span>
          <p
            className="mt-2 line-clamp-1 text-[19px] leading-[1.26] font-extrabold text-balance"
            style={{ color: SITE.title }}
          >
            {title}
          </p>
          {item.body && (
            <p
              className="mt-1 line-clamp-1 text-[12.5px] leading-[1.42] font-medium text-pretty"
              style={{ color: "rgb(255 255 255 / 0.85)" }}
            >
              {item.body}
            </p>
          )}
          {item.ctaText && (
            <span className="mt-auto pt-2">
              <span
                className="inline-flex h-[30px] w-fit items-center rounded-full px-3.5 text-[12px] font-bold"
                style={{ background: item.accent.background, color: item.accent.foreground }}
              >
                {item.ctaText}
              </span>
            </span>
          )}
        </div>
        {poster && (
          <div
            className="relative w-[84px] flex-none overflow-hidden rounded-[10px] border"
            style={{
              borderColor: "oklch(0.96 0.005 78 / 0.26)",
              background: "oklch(0.11 0.006 305 / 0.35)",
            }}
          >
            <Img
              src={poster}
              className={cn(
                "size-full",
                item.imageUrl ? "object-cover" : "object-contain p-[12%]",
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function BrandMark({ item }: { item: PreviewItem }) {
  return item.logoUrl ? (
    <Img
      src={item.logoUrl}
      className="size-[52px] shrink-0 rounded-[10px] object-cover ring-1 ring-white/10"
    />
  ) : (
    <span
      aria-hidden
      className="flex size-[52px] shrink-0 items-center justify-center rounded-[10px] text-[20px] font-extrabold"
      style={{ background: item.accent.background, color: item.accent.foreground }}
    >
      {item.brandName.charAt(0).toUpperCase()}
    </span>
  );
}

/** Manga sahifasi va rasmsiz bob oxiri. */
function CardCreative({ item }: { item: PreviewItem }) {
  return (
    <div
      className="relative flex overflow-hidden border"
      style={{ borderColor: SITE.line, background: SITE.bgSecondary }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: item.accent.background }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3.5 pl-[17px]">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <BrandMark item={item} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5" style={{ color: SITE.minor }}>
              <Label text={item.label} />
              <span className="truncate text-[12px] font-semibold">{item.brandName}</span>
            </div>
            {item.title && (
              <p
                className="mt-1 line-clamp-1 text-[15px] leading-5 font-bold"
                style={{ color: SITE.title }}
              >
                {item.title}
              </p>
            )}
            {item.body && (
              <p
                className="mt-0.5 line-clamp-2 text-[13px] leading-[18px] font-medium"
                style={{ color: SITE.minor }}
              >
                {item.body}
              </p>
            )}
          </div>
        </div>
        {item.ctaText && (
          <span
            className="flex h-[38px] shrink-0 items-center justify-center rounded-full px-[18px] text-[13px] font-bold"
            style={{ background: item.accent.background, color: item.accent.foreground }}
          >
            {item.ctaText}
          </span>
        )}
      </div>
    </div>
  );
}

/** Rasmli bob oxiri: 16:9 rasm, ostida brend va tugma matni. */
function ImageCreative({ item, imageUrl }: { item: PreviewItem; imageUrl: string }) {
  return (
    <div
      className="overflow-hidden border"
      style={{ borderColor: SITE.line, background: SITE.bgSecondary }}
    >
      <div className="relative aspect-video w-full overflow-hidden" style={{ background: SITE.bgEtc }}>
        <Img src={imageUrl} className="size-full object-cover" />
        <Label
          text={item.label}
          className="absolute top-2.5 left-2.5 bg-black/55 text-white backdrop-blur-sm"
        />
      </div>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <span
          className="min-w-0 flex-1 truncate text-[13px] font-semibold"
          style={{ color: SITE.secondary }}
        >
          {item.brandName}
        </span>
        {item.ctaText && (
          <span className="shrink-0 text-[13px] font-bold" style={{ color: SITE.brand }}>
            {item.ctaText} →
          </span>
        )}
      </div>
    </div>
  );
}

function CatalogTile({ item }: { item: PreviewItem }) {
  return (
    <div className="min-w-0">
      <div
        className="relative flex aspect-[3/5] w-full flex-col items-center justify-center gap-2.5 overflow-hidden rounded-sm p-2.5 text-center"
        style={{ background: item.accent.background, color: item.accent.foreground }}
      >
        {item.imageUrl && (
          <Img src={item.imageUrl} className="absolute inset-0 size-full object-cover opacity-35" />
        )}
        {item.logoUrl && (
          <Img
            src={item.logoUrl}
            className="relative h-[44%] max-h-[72px] w-auto max-w-[72px] rounded-[12px] object-cover shadow-md"
          />
        )}
        <p className="relative line-clamp-3 text-[12px] leading-4 font-extrabold">
          {item.title || item.brandName}
        </p>
        {item.ctaText && (
          <span className="relative mt-0.5 max-w-full truncate rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-bold">
            {item.ctaText}
          </span>
        )}
        <Label
          text={item.label}
          className="absolute top-[5px] left-[5px] z-10 bg-black/45 text-white"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-sm border"
          style={{ borderColor: SITE.lineThumb }}
        />
      </div>
      <div className="flex flex-col items-start gap-y-0.5 pt-2">
        <span
          className="line-clamp-2 text-[13px] leading-[19px] font-medium"
          style={{ color: SITE.secondary }}
        >
          {item.brandName}
        </span>
        <span className="line-clamp-1 text-[11px] leading-[18px] font-medium" style={{ color: SITE.minor }}>
          {item.body}
        </span>
      </div>
    </div>
  );
}

/** Katalogda reklama oddiy manga muqovalari orasida turadi. */
function CoverStub() {
  return (
    <div aria-hidden className="min-w-0">
      <div className="aspect-[3/5] w-full rounded-sm" style={{ background: SITE.bgEtc }} />
      <div className="mt-2 h-3 w-4/5 rounded-sm" style={{ background: SITE.bgSecondary }} />
      <div className="mt-1.5 h-2.5 w-1/2 rounded-sm" style={{ background: SITE.bgSecondary }} />
    </div>
  );
}

function SlotBody({ slot, item }: { slot: AdSlot; item: PreviewItem }) {
  if (slot === "home_carousel") {
    return (
      <>
        <CarouselSlide item={item} />
        <div aria-hidden className="mt-2.5 flex justify-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full" style={{ background: SITE.brand }} />
          <span className="size-1.5 rounded-full" style={{ background: SITE.bgEtc }} />
          <span className="size-1.5 rounded-full" style={{ background: SITE.bgEtc }} />
        </div>
      </>
    );
  }
  if (slot === "catalog_grid") {
    return (
      <div className="grid grid-cols-3 gap-x-[10px] gap-y-5">
        <CoverStub />
        <CatalogTile item={item} />
        <CoverStub />
      </div>
    );
  }
  if (slot === "reader_end" && item.imageUrl) {
    return <ImageCreative item={item} imageUrl={item.imageUrl} />;
  }
  return <CardCreative item={item} />;
}

/**
 * Ichkarida haqiqiy 390px ekran chiziladi va konteynerga sig'guncha
 * kichraytiriladi — o'lchamlar, qator uzilishi va qirqilish telefondagidek.
 */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ scale: 1, height: 0 });

  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const scale = Math.min(1, outer.clientWidth / PHONE_WIDTH);
      setBox({ scale, height: inner.offsetHeight * scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className="overflow-hidden rounded-2xl border border-border"
      style={{ height: box.height || undefined, background: SITE.bg }}
    >
      <div
        ref={innerRef}
        className={cn(siteFont.className, "origin-top-left py-4 antialiased")}
        style={{
          width: PHONE_WIDTH,
          paddingInline: GUTTER,
          transform: `scale(${box.scale})`,
          color: SITE.title,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export type SlotPreviewData = {
  draft: CreativeDraft;
  logoSrc: string | null;
  /** Joyning rasmi — faqat rasm qabul qiladigan joylarda. */
  imageSrc: string | null;
};

/**
 * `active` berilsa tab tashqarida boshqariladi (banner qadami: forma va
 * preview bitta joyni ko'rsatadi); berilmasa o'z tablarini chizadi.
 */
export function SitePreview({
  slots,
  dataOf,
  active: controlled,
  note = true,
}: {
  slots: AdSlot[];
  dataOf: (slot: AdSlot) => SlotPreviewData;
  active?: AdSlot;
  /** Pastdagi "telefondagi ko'rinish" izohi — ro'yxatda takrorlanmasin. */
  note?: boolean;
}) {
  const w = useT("portal").wizard.creative;
  const { labelOf } = useRateCard();
  const [picked, setPicked] = React.useState<AdSlot | null>(null);
  const own = picked && slots.includes(picked) ? picked : slots[0];
  const active = controlled ?? own;
  if (!active) return null;

  const { draft, logoSrc, imageSrc } = dataOf(active);
  const item: PreviewItem = {
    brandName: draft.brandName.trim() || w.previewBrand,
    title: draft.title.trim() || w.previewTitle,
    body: draft.body.trim(),
    ctaText: draft.ctaText.trim(),
    accent: siteAccent(draft.accentColor),
    logoUrl: logoSrc,
    imageUrl: imageSrc,
    label: SITE_LABEL,
  };

  return (
    <div className="space-y-3">
      {!controlled && slots.length > 1 && (
        <div role="tablist" className="flex flex-wrap gap-1.5">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              role="tab"
              aria-selected={slot === active}
              onClick={() => setPicked(slot)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                slot === active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {labelOf(slot)}
            </button>
          ))}
        </div>
      )}
      <PhoneFrame>
        <SlotBody slot={active} item={item} />
      </PhoneFrame>
      {note && <p className="text-xs text-muted-foreground">{w.previewNote}</p>}
    </div>
  );
}
