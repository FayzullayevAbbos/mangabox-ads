import { cn } from "@/lib/utils";

/**
 * Oq sirt kulrang canvas ustida — sahifadagi har bir mazmun bloki shu panelda
 * turadi. Sarlavha yo'q bo'lsa yuqori chiziq ham chizilmaydi.
 */
export function Panel({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
