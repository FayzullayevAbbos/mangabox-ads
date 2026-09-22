"use client";

import { useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PhoneInput } from "@/components/auth/phone-input";
import { portalLogin, AuthError } from "@/lib/api/portal-auth";
import { useT } from "@/lib/i18n/provider";

export default function LoginPage() {
  const router = useRouter();
  const t = useT("auth");
  const c = useT("common");
  const p = useT("portal");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isFormValid = phone.replace(/\D/g, "").length >= 12 && password.length >= 8;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setHasError(false);
      if (!isFormValid) return;

      setLoading(true);
      try {
        await portalLogin(phone, password);
        toast.success(t.login.toasts.success);
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        setHasError(true);
        setLoading(false);
        if (err instanceof AuthError) {
          if (err.status === 401 || err.status === 400) {
            toast.error(t.login.toasts.invalidCredentials);
          } else if (err.status === 429) {
            toast.error(c.errors.tooManyRequests);
          } else {
            toast.error(err.message || c.errors.generic);
          }
        } else {
          toast.error(c.errors.network);
        }
      }
    },
    [phone, password, isFormValid, router, t, c],
  );

  return (
    <div className="w-full max-w-[420px] space-y-6">
      <div className="text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.login.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.login.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-phone">{t.login.phoneLabel}</Label>
          <PhoneInput
            value={phone}
            onChange={(v) => {
              setPhone(v);
              setHasError(false);
            }}
            error={hasError}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">{t.login.passwordLabel}</Label>
          <InputGroup className={`h-12 bg-card ${hasError ? "border-destructive" : ""}`}>
            <InputGroupInput
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setHasError(false);
              }}
              disabled={loading}
              aria-invalid={hasError}
              className="text-base md:text-base"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-sm"
                aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              {c.status.verifying}
            </span>
          ) : (
            t.login.submit
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {p.register.noAccount}{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          {p.register.link}
        </Link>
      </p>
    </div>
  );
}
