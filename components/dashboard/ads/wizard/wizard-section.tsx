import { cn } from "@/lib/utils";

export function WizardSection({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
    >
      {title && (
        <div>
          <h2 className="font-heading text-base font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
