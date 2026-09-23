"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiBillLine,
  RiMegaphoneLine,
  RiPriceTag3Line,
  RiSettings3Line,
  RiSideBarLine,
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
  SidebarRail,
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
  const t = useT("portal");
  const nav = useT("nav");
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  // `state` faqat desktop holatini bildiradi. Mobilda sidebar Sheet sifatida
  // to'liq kenglikda ochiladi — desktop yig'ilgan bo'lsa ham matnlar ko'rinishi
  // kerak.
  const collapsed = !isMobile && state === "collapsed";

  const navGroups: NavGroup[] = [
    {
      label: t.nav.group,
      items: [
        { title: t.nav.campaigns, href: "/dashboard", icon: RiMegaphoneLine },
        { title: t.nav.orders, href: "/dashboard/orders", icon: RiBillLine },
        { title: t.nav.rateCard, href: "/dashboard/rate-card", icon: RiPriceTag3Line },
        { title: t.nav.settings, href: "/dashboard/settings", icon: RiSettings3Line },
      ],
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "py-4",
          collapsed ? "items-center gap-3 px-2" : "flex-row items-center px-4",
        )}
      >
        <Link
          href="/dashboard"
          className={cn("flex min-w-0 items-center gap-2", !collapsed && "flex-1")}
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
        {!isMobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={nav.header.toggleSidebar}
            title={nav.header.toggleSidebar}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-5"
          >
            <RiSideBarLine />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className={collapsed ? "px-0" : "px-2"}>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === item.href ||
                      pathname.startsWith("/dashboard/campaigns")
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isActive}
                      tooltip={item.title}
                      className="gap-3 px-3 text-[0.9375rem] font-medium group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:[&>span]:hidden [&>svg]:size-5 data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:hover:bg-primary/15 data-[active=true]:hover:text-primary"
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

      <SidebarFooter className={collapsed ? "items-center p-2" : "p-3"}>
        <UserMenu collapsed={collapsed} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
