"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Mavzu (theme) provideri.
 *
 * Dark rejim FAQAT dashboard (`/dashboard/...`) uchun. Landing va auth
 * sahifalari doim yorug' bo'lishi kerak, shuning uchun ular uchun
 * `forcedTheme="light"` beriladi — bu `localStorage`dagi tanlovni o'chirmaydi,
 * shunchaki o'sha sahifalarda majburan yorug' ko'rsatadi. Dashboardga qaytganda
 * foydalanuvchining saqlangan tanlovi (light/dark/system) yana qo'llanadi.
 *
 * Bitta provider root'da turadi (next-themes ichma-ich providerni e'tiborsiz
 * qoldiradi), `usePathname` esa SSR paytida ham to'g'ri yo'lni bergani uchun
 * sahifa yangilanganda yorug'/qorong'i miltillashi (FOUC) bo'lmaydi.
 */
export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={isDashboard ? undefined : "light"}
    >
      {children}
    </NextThemesProvider>
  );
}
