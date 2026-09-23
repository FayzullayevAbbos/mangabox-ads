import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Spectral } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { getServerDictionary } from "@/lib/i18n/server";
import { siteUrl } from "@/lib/site";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  uz: "uz_UZ",
  ru: "ru_RU",
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getServerDictionary();
  const s = dict.site;
  const ogLocale = OG_LOCALES[locale] ?? "en_US";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: s.metaTitle,
      template: `%s · ${s.name}`,
    },
    description: s.metaDescription,
    applicationName: s.name,
    category: "technology",
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      type: "website",
      siteName: s.name,
      locale: ogLocale,
      url: siteUrl,
      title: s.metaTitle,
      description: s.metaDescription,
    },
    // Ommaviy sirt faqat huquqiy hujjatlar; panel va auth `robots.ts` da
    // taqiqlangan.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1c22" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, dict } = await getServerDictionary();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", outfit.variable, spectral.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <I18nProvider locale={locale} dict={dict}>
            <TooltipProvider>
              {children}
              <Toaster richColors position="top-center" />
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
