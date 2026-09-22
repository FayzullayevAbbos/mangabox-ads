"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiAdvertisementLine,
  RiMegaphoneLine,
  RiBookOpenLine,
  RiBroadcastLine,
  RiChat3Line,
  RiExchangeDollarLine,
  RiFlag2Line,
  RiGroupLine,
  RiLayoutGridLine,
  RiMoneyDollarCircleLine,
  RiRefreshLine,
  RiSearch2Line,
  RiShareForwardBoxLine,
  RiVideoLine,
  RiWalletLine,
} from "@remixicon/react";
import type { ComponentType } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { BrandMark } from "@/components/brand-mark";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type NavGroup = { label: string; items: NavItem[] };

export function AppSidebar() {
  const t = useT("nav");
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  // `state` faqat desktop holatini bildiradi. Mobilda sidebar Sheet sifatida
  // to'liq kenglikda ochiladi — desktop yig'ilgan bo'lsa ham matnlar ko'rinishi
  // kerak.
  const collapsed = !isMobile && state === "collapsed";

  // API kalitlari va webhook'lar asosiy navigatsiyada emas — ular hisob
  // menyusidagi (sidebar pastida) sozlamalar bo'limida.
  const navGroups: NavGroup[] = [
    {
      label: t.groups.core,
      items: [
        { title: t.items.overview, href: "/dashboard", icon: RiLayoutGridLine },
      ],
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-4 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={() => setOpenMobile(false)}
        >
          <div className="flex size-9 shrink-0 items-center justify-center">
            <BrandMark className="size-6 text-foreground" />
          </div>
          <span
            className={cn(
              "font-heading text-xl font-semibold tracking-tight",
              collapsed && "hidden",
            )}
          >
            MangaBox
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isActive}
                      tooltip={item.title}
                      className="gap-3 px-3 text-[0.9375rem] font-medium [&>svg]:size-5 data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:hover:bg-primary/15 data-[active=true]:hover:text-primary"
                    >
                      {/* Mobilda navigatsiya Sheet ichida — bosilgach yopiladi. */}
                      <Link href={item.href} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <UserMenu collapsed={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
