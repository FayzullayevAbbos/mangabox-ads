"use client";

import { useMemo } from "react";

import { useT } from "@/lib/i18n/provider";
import { interpolate } from "@/lib/i18n/interpolate";

interface PasswordStrengthProps {
  password: string;
}

type Strength = "empty" | "weak" | "fair" | "strong";

function computeStrength(pw: string): Strength {
  if (!pw) return "empty";

  const length = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^a-zA-Z\d]/.test(pw);
  const variety = +hasLower + +hasUpper + +hasDigit + +hasSpecial;

  if (length < 8 || variety < 2) return "weak";
  if (length < 10 || variety < 3) return "fair";
  return "strong";
}

const segmentColors: Record<Strength, { bg: string; text: string }> = {
  empty: { bg: "bg-border", text: "text-muted-foreground" },
  weak: { bg: "bg-destructive", text: "text-destructive" },
  fair: { bg: "bg-chart-3", text: "text-chart-3" },
  strong: { bg: "bg-green-500", text: "text-green-600" },
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const t = useT("auth");
  const level = useMemo(() => computeStrength(password), [password]);

  const labels: Record<Exclude<Strength, "empty">, string> = {
    weak: t.passwordStrength.weak,
    fair: t.passwordStrength.fair,
    strong: t.passwordStrength.strong,
  };

  const segments = 3;
  const filled = level === "empty" ? 0 : level === "weak" ? 1 : level === "fair" ? 2 : 3;

  const { text } = segmentColors[level];

  if (level === "empty") return null;

  const label = labels[level];

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-label={interpolate(t.passwordStrength.ariaLabel, { label })}
      >
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full transition-colors ${i < filled ? segmentColors[level].bg : "bg-border"}`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${text}`}>{label}</span>
    </div>
  );
}
