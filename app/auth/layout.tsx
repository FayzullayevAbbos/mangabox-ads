import type { Metadata } from "next";

import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getServerDictionary();
  return {
    title: dict.auth.layout.metaTitle,
    description: dict.auth.layout.metaDescription,
  };
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dict } = await getServerDictionary();
  const copyright = dict.auth.footer.copyright.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-16">
      {children}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        {copyright}
      </p>
    </div>
  );
}
