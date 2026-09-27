"use client";

import * as React from "react";
import { RiImageAddLine, RiUploadCloud2Line } from "@remixicon/react";
import { toast } from "sonner";

import { ratioLabel, readMediaSize } from "@/components/dashboard/ads/image-file";
import { Button } from "@/components/ui/button";
import {
  checkImageAgainstSpec,
  IMAGE_TYPES,
  IMAGE_UPLOAD_MAX_MB,
  isVideoFile,
  VIDEO_TYPES,
  VIDEO_UPLOAD_MAX_MB,
  type AdImageSpec,
} from "@/lib/api/ads";
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
  videoSrc,
  spec,
  videoSpec,
  frameClassName,
  canRemove,
  error,
  onPick,
  onRemove,
  onError,
}: {
  label: string;
  hint?: string;
  src: string | null;
  /** Bor bo'lsa ramkada rasm o'rniga ovozsiz aylanuvchi video. */
  videoSrc?: string | null;
  spec?: AdImageSpec | null;
  /** Bor bo'lsa GIF va video (MP4/MOV/WebM) ham tanlanadi — server siqadi. */
  videoSpec?: AdImageSpec | null;
  frameClassName?: string;
  canRemove: boolean;
  error?: string;
  onPick: (file: File) => void;
  onRemove: () => void;
  onError?: (message: string) => void;
}) {
  const c = useT("ads").sheet.creatives;
  const w = useT("portal").wizard.creative;
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const fail = (message: string) => {
    if (onError) onError(message);
    else toast.error(message);
  };

  const accept = async (file: File) => {
    const video = !!videoSpec && isVideoFile(file);
    if (!video && !IMAGE_TYPES.includes(file.type)) {
      fail(c.imageFormat);
      return;
    }
    const maxMb = video ? VIDEO_UPLOAD_MAX_MB : IMAGE_UPLOAD_MAX_MB;
    if (file.size > maxMb * 1024 * 1024) {
      fail(interpolate(video ? c.videoTooBig : c.imageTooBig, { max: String(maxMb) }));
      return;
    }
    const target = video ? videoSpec : spec;
    if (target) {
      // O'qib bo'lmagan format (masalan brauzer ochmaydigan MOV) serverda tekshiriladi.
      const size = await readMediaSize(file);
      const check = size && checkImageAgainstSpec(size.width, size.height, target);
      if (size && check && !check.ok) {
        const actual = `${size.width}×${size.height}`;
        fail(
          check.reason === "size"
            ? interpolate(c.imageTooSmall, {
                min: `${target.minWidth}×${target.minHeight}`,
                actual,
              })
            : interpolate(c.imageWrongRatio, {
                ratio: ratioLabel(target.ratio),
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
          error && "border-destructive",
          frameClassName,
        )}
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            muted
            loop
            autoPlay
            playsInline
            className="size-full object-cover"
          />
        ) : src ? (
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
        {(src || videoSrc) && canRemove && (
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
          {src || videoSrc ? w.replace : videoSpec ? w.chooseMedia : w.chooseFile}
        </Button>
      </div>

      {error && (
        <p data-field-error className="basis-full text-xs text-destructive">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={(videoSpec ? [...IMAGE_TYPES, ...VIDEO_TYPES] : IMAGE_TYPES).join(",")}
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
