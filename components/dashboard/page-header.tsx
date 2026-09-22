import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  badge,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Sarlavha yonidagi kichik ko'rsatkich — masalan jami yozuvlar soni. */
  badge?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground sm:text-[0.9375rem]">
            {description}
          </p>
        )}
      </div>
      {/* Mobilda amal tugmasi sarlavha ostiga tushadi, desktopda o'ng chekkada. */}
      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  );
}
