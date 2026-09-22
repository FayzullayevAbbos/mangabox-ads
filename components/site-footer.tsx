import Link from "next/link";

import { getServerDictionary } from "@/lib/i18n/server";

/**
 * Panel sahifalari uchun ixcham futer. Ikki vazifasi bor: kontent oxirida
 * nafas oladigan joy qoldirish (busiz sahifalash tugmalari ekran chetiga
 * tegib turadi) va huquqiy hujjatlarga yo'l ochish.
 *
 * `/legal` va `/checkout-pay` o'z maqsadli futerlariga ega — bu komponent
 * u yerlarda ishlatilmaydi.
 */
export async function SiteFooter() {
  const { dict } = await getServerDictionary();
  const t = dict.legal;

  const links = [
    { label: t.nav.offer, href: "/legal/offer" },
    { label: t.nav.privacy, href: "/legal/privacy" },
    { label: t.nav.contacts, href: "/legal/contacts" },
  ];

  return (
    <footer className="border-t border-border px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{t.copyright.replace("{year}", String(new Date().getFullYear()))}</p>

        <nav
          aria-label={t.footerHeading}
          className="flex flex-wrap items-center gap-x-5 gap-y-1"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm py-1 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
