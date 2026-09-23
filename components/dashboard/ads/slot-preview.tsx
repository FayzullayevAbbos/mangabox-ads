import type { AdSlot } from "@/lib/api/ads";
import { cn } from "@/lib/utils";

const ART = "fill-muted-foreground/12";
const LINE = "fill-muted-foreground/25";
const SOFT = "fill-muted-foreground/10";

/**
 * Reklama joyi — ilovaning qaysi ekranida turishini ko'rsatadigan sxema.
 * Raqam emas, o'rin: reklama bloki binafsha, qolgani ilova chizig'i.
 */
export function SlotPreview({
  slot,
  active = false,
  className,
}: {
  slot: AdSlot;
  active?: boolean;
  className?: string;
}) {
  const ad = active
    ? "fill-primary/30 stroke-primary/80"
    : "fill-primary/15 stroke-primary/45";

  return (
    <svg
      viewBox="0 0 120 204"
      role="presentation"
      className={cn("h-auto w-full", className)}
    >
      <rect
        x="0.5"
        y="0.5"
        width="119"
        height="203"
        rx="13.5"
        className="fill-background stroke-muted-foreground/25"
        strokeWidth="1"
      />
      <rect x="48" y="4" width="24" height="3" rx="1.5" className={LINE} />
      {slot === "reader_end" && <ReaderEnd ad={ad} />}
      {slot === "home_carousel" && <HomeCarousel ad={ad} />}
      {slot === "manga_detail" && <MangaDetail ad={ad} />}
      {slot === "catalog_grid" && <CatalogGrid ad={ad} />}
    </svg>
  );
}

function ReaderEnd({ ad }: { ad: string }) {
  return (
    <>
      <rect x="8" y="10" width="104" height="30" rx="3" className={ART} />
      <rect x="8" y="43" width="50" height="26" rx="3" className={ART} />
      <rect x="62" y="43" width="50" height="26" rx="3" className={ART} />
      <rect x="8" y="80" width="104" height="1" className={SOFT} />
      <rect
        x="40"
        y="76.5"
        width="40"
        height="8"
        rx="4"
        className="fill-background"
      />
      <rect x="45" y="79" width="30" height="3" rx="1.5" className={LINE} />
      <rect
        x="8.5"
        y="92.5"
        width="103"
        height="57.5"
        rx="3"
        className={ad}
        strokeWidth="1"
      />
      <rect
        x="8"
        y="160"
        width="104"
        height="14"
        rx="7"
        className="fill-muted-foreground/20"
      />
      <rect x="8" y="184" width="66" height="4" rx="2" className={SOFT} />
      <rect x="8" y="192" width="44" height="4" rx="2" className={SOFT} />
    </>
  );
}

function HomeCarousel({ ad }: { ad: string }) {
  return (
    <>
      <rect x="8" y="10" width="104" height="11" rx="5.5" className={SOFT} />
      <rect x="4" y="34" width="20" height="72" rx="3" className={ART} />
      <rect x="96" y="34" width="20" height="72" rx="3" className={ART} />
      <rect
        x="32.5"
        y="28.5"
        width="55"
        height="83"
        rx="3"
        className={ad}
        strokeWidth="1"
      />
      <circle cx="53" cy="119" r="1.6" className={LINE} />
      <circle cx="60" cy="119" r="1.6" className="fill-primary/70" />
      <circle cx="67" cy="119" r="1.6" className={LINE} />
      <rect x="8" y="132" width="38" height="4" rx="2" className={LINE} />
      <rect x="8" y="142" width="30" height="45" rx="3" className={ART} />
      <rect x="42" y="142" width="30" height="45" rx="3" className={ART} />
      <rect x="76" y="142" width="30" height="45" rx="3" className={ART} />
      <TabBar />
    </>
  );
}

function MangaDetail({ ad }: { ad: string }) {
  return (
    <>
      <rect x="8" y="10" width="40" height="60" rx="3" className={ART} />
      <rect x="54" y="12" width="50" height="6" rx="3" className={LINE} />
      <rect x="54" y="23" width="34" height="4" rx="2" className={SOFT} />
      <rect x="54" y="33" width="20" height="7" rx="3.5" className={SOFT} />
      <rect x="78" y="33" width="16" height="7" rx="3.5" className={SOFT} />
      <rect
        x="54"
        y="47"
        width="50"
        height="12"
        rx="6"
        className="fill-muted-foreground/20"
      />
      <rect x="8" y="78" width="104" height="4" rx="2" className={SOFT} />
      <rect x="8" y="86" width="104" height="4" rx="2" className={SOFT} />
      <rect x="8" y="94" width="70" height="4" rx="2" className={SOFT} />
      <rect
        x="8.5"
        y="108.5"
        width="103"
        height="33"
        rx="3"
        className={ad}
        strokeWidth="1"
      />
      <rect x="13" y="113" width="25" height="25" rx="2" className="fill-primary/25" />
      <rect x="43" y="116" width="52" height="4" rx="2" className="fill-primary/30" />
      <rect x="43" y="124" width="36" height="4" rx="2" className="fill-primary/20" />
      <rect x="8" y="150" width="32" height="4" rx="2" className={LINE} />
      <rect x="8" y="159" width="104" height="9" rx="2" className={SOFT} />
      <rect x="8" y="171" width="104" height="9" rx="2" className={SOFT} />
      <TabBar />
    </>
  );
}

function CatalogGrid({ ad }: { ad: string }) {
  return (
    <>
      <rect x="8" y="10" width="104" height="11" rx="5.5" className={SOFT} />
      <rect x="8" y="27" width="22" height="7" rx="3.5" className="fill-primary/20" />
      <rect x="34" y="27" width="28" height="7" rx="3.5" className={SOFT} />
      <rect x="66" y="27" width="18" height="7" rx="3.5" className={SOFT} />
      <rect x="8" y="42" width="32" height="48" rx="3" className={ART} />
      <rect x="44" y="42" width="32" height="48" rx="3" className={ART} />
      <rect x="80" y="42" width="32" height="48" rx="3" className={ART} />
      <rect x="8" y="96" width="32" height="48" rx="3" className={ART} />
      <rect
        x="44.5"
        y="96.5"
        width="31"
        height="47"
        rx="3"
        className={ad}
        strokeWidth="1"
      />
      <rect x="80" y="96" width="32" height="48" rx="3" className={ART} />
      <rect x="8" y="150" width="32" height="40" rx="3" className={ART} />
      <rect x="44" y="150" width="32" height="40" rx="3" className={ART} />
      <rect x="80" y="150" width="32" height="40" rx="3" className={ART} />
      <TabBar />
    </>
  );
}

function TabBar() {
  return (
    <>
      <rect x="1" y="182" width="118" height="21" rx="12" className="fill-background" />
      <rect x="8" y="182" width="104" height="1" className={SOFT} />
      <circle cx="22" cy="192" r="3" className="fill-primary/60" />
      <circle cx="47" cy="192" r="3" className={LINE} />
      <circle cx="72" cy="192" r="3" className={LINE} />
      <circle cx="97" cy="192" r="3" className={LINE} />
    </>
  );
}
