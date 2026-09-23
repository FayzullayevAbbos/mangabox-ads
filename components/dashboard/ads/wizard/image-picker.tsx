"use client";

import * as React from "react";
import { RiImageAddLine, RiUploadCloud2Line } from "@remixicon/react";
import { toast } from "sonner";

import { ratioLabel, readImageSize } from "@/components/dashboard/ads/image-file";
import { Button } from "@/components/ui/button";
import { checkImageAgainstSpec, type AdImageSpec } from "@/lib/api/ads";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function useObjectUrl(file: File | null | undefined): string | null {
  const url = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  React.useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

export function ImagePicker({
  label,
  hint,
  src,
  spec,
  frameClassName,
  canRemove,
  onPick,
  onRemove,
}: {
  label: string;
  hint?: string;
  src: string | null;
  spec?: AdImageSpec | null;
  frameClassName?: string;
  canRemove: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const t = useT("ads");
  const w = useT("portal").wizard.creative;
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const accept = async (file: File) => {
    if (spec) {
      const size = await readImageSize(file);
      const check = size && checkImageAgainstSpec(size.width, size.height, spec);
      if (size && check && !check.ok) {
        const actual = `${size.width}×${size.height}`;
        toast.error(
          check.reason === "size"
            ? interpolate(t.sheet.creatives.imageTooSmall, {
                min: `${spec.minWidth}×${spec.minHeight}`,
                actual,
              })
            : interpolate(t.sheet.creatives.imageWrongRatio, {
                ratio: ratioLabel(spec.ratio),
                actual,
              }),
        );
        return;
      }
    }
    onPick(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={label}
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors outline-none hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
          src && "border-solid",
          frameClassName,
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          <RiImageAddLine className="size-5" />
        )}
      </button>

      <div className="min-w-0 flex-1 basis-40">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2 max-sm:w-full">
        {src && canRemove && (
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            {w.remove}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="max-sm:flex-1"
          onClick={() => inputRef.current?.click()}
        >
          <RiUploadCloud2Line data-icon="inline-start" />
          {src ? w.replace : w.chooseFile}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void accept(file);
        }}
      />
    </div>
  );
}
