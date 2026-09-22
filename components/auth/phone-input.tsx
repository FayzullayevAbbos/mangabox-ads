"use client";

import { useCallback, type ChangeEvent } from "react";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: boolean;
  disabled?: boolean;
}

// Extracts the 9-digit subscriber part from the stored value. The stored value
// always carries the 998 country code prefix (e.g. "+998901234567"), so we strip
// the leading 998 whenever it is present, regardless of how many digits follow.
function subscriberDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return (digits.startsWith("998") ? digits.slice(3) : digits).slice(0, 9);
}

// Normalizes raw text typed/pasted/autofilled into the input down to the 9-digit
// subscriber part. A full number (more than 9 digits) starting with 998 has its
// country code stripped; anything else is treated as a locally-typed subscriber.
function normalizeSubscriber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 9 && digits.startsWith("998")) {
    digits = digits.slice(3);
  }
  return digits.slice(0, 9);
}

// Formats subscriber digits as "88 546 04 56".
function formatSubscriber(digits: string): string {
  let result = "";
  if (digits.length > 0) result += digits.slice(0, 2);
  if (digits.length > 2) result += " " + digits.slice(2, 5);
  if (digits.length > 5) result += " " + digits.slice(5, 7);
  if (digits.length > 7) result += " " + digits.slice(7, 9);
  return result;
}

export function PhoneInput({
  value,
  onChange,
  error = false,
  disabled = false,
}: PhoneInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const remain = normalizeSubscriber(e.target.value);
      // Always store the full value with the +998 prefix.
      onChange(remain ? "+998" + remain : "");
    },
    [onChange],
  );

  const displayValue = formatSubscriber(subscriberDigits(value));

  return (
    <ButtonGroup className="w-full">
      <ButtonGroupText
        className={`h-12 bg-card px-3 text-base font-normal text-foreground md:text-base ${
          error ? "border-destructive" : ""
        }`}
      >
        +998
      </ButtonGroupText>
      <Input
        id="login-phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="90 345 67 89"
        disabled={disabled}
        aria-invalid={error}
        className="h-12 text-base text-foreground md:text-base"
        dir="ltr"
      />
    </ButtonGroup>
  );
}
