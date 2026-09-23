import type { Metadata } from "next";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteFooter } from "@/components/site-footer";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getServerDictionary();
  return {
    title: dict.nav.header.metaTitle,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dict } = await getServerDictionary();
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="bg-canvas dark:bg-transparent">
        {/* Mobilda sticky — navigatsiya tugmasi sahifaning istalgan joyidan bir
            tegishda yetib boradi. Desktopda inset karta yumaloq burchakli,
            shuning uchun u yerda header oddiy oqimda qoladi. */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-canvas/85 px-3 backdrop-blur-sm sm:gap-3 sm:px-4 md:static dark:bg-background/85">
          <SidebarTrigger className="-ms-1 size-10 shrink-0 md:hidden" />
          {/* Mobilda bu statik yorliq o'rin egallaydi, ammo ma'lumot bermaydi —
              har bir sahifa ostida o'z PageHeader sarlavhasi bor. */}
          <span className="hidden truncate text-sm font-medium text-muted-foreground sm:inline">
            {dict.nav.header.dashboard}
          </span>
          {/* Tegish maydoni mobilda 40px — sm'dan boshlab yana ixchamlashadi. */}
          <div className="ms-auto flex shrink-0 items-center gap-1">
            <ModeToggle className="size-10 sm:h-auto sm:w-auto" />
            <LanguageSwitcher className="h-10 sm:h-auto" />
          </div>
        </header>
        {/* SidebarInset o'zi <main> — ichkarisi <div> bo'lishi kerak. */}
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</div>
        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
