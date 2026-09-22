"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiExpandUpDownLine,
  RiLogoutBoxRLine,
  RiSettings3Line,
} from "@remixicon/react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSidebar } from "@/components/ui/sidebar";
import type { Advertiser } from "@/lib/api/ads";
import { getAdvertiser, portalLogout } from "@/lib/api/portal-auth";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; user: Advertiser };

function userInitial(user: Advertiser): string {
  const source = user.name?.trim() || user.phone;
  return source.charAt(0).toUpperCase() || "?";
}

const NAV_ITEMS = [
  { key: "settings", href: "/dashboard/settings", icon: RiSettings3Line },
] as const;

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const t = useT("chrome");
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [state, setState] = React.useState<State>({ status: "loading" });
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    getAdvertiser()
      .then((user) => {
        if (!cancelled) {
          setState(user ? { status: "ready", user } : { status: "error" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await portalLogout();
      setOpenMobile(false);
      router.replace("/auth/login");
      router.refresh();
    } catch (err) {
      setLoggingOut(false);
      toast.error(err instanceof Error ? err.message : t.userMenu.logoutError);
    }
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-secondary px-2 py-2">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        {!collapsed && (
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        )}
      </div>
    );
  }

  const user = state.status === "ready" ? state.user : null;
  const title = user ? (user.name?.trim() || user.phone) : t.userMenu.accountLabel;
  const subtitle = user ? user.phone : t.userMenu.loadError;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border bg-secondary px-2 py-2 text-left text-secondary-foreground shadow-xs transition-colors outline-none hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
          {user ? userInitial(user) : "?"}
        </div>
        <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "hidden")}>
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <RiExpandUpDownLine
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            collapsed && "hidden",
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
      >
        <DropdownMenuLabel>{t.userMenu.accountLabel}</DropdownMenuLabel>

        {NAV_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className="gap-2"
              onClick={() => setOpenMobile(false)}
            >
              <item.icon className="size-4" />
              {t.userMenu[item.key]}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={loggingOut}
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
          className="gap-2"
        >
          {loggingOut ? (
            <Spinner className="size-4" />
          ) : (
            <RiLogoutBoxRLine className="size-4" />
          )}
          {t.userMenu.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
