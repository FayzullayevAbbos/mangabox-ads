"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PhoneInput } from "@/components/auth/phone-input";
import {
  AuthError,
  MIN_PASSWORD_LENGTH,
  portalRegister,
} from "@/lib/api/portal-auth";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";

type Field = "name" | "legalName" | "inn" | "email";

export default function RegisterPage() {
  const router = useRouter();
  const t = useT("auth");
  const c = useT("common");
  const p = useT("portal");
  const r = p.register;

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState<Record<Field, string>>({
    name: "",
    legalName: "",
    inn: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const isFormValid =
    phone.replace(/\D/g, "").length >= 12 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    fields.name.trim().length > 0;

  const setField = (key: Field, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      await portalRegister({ phone, password, ...fields });
      toast.success(r.success);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setLoading(false);
      if (err instanceof AuthError) {
        toast.error(
          err.status === 429 ? c.errors.tooManyRequests : err.message || c.errors.generic,
        );
      } else {
        toast.error(c.errors.network);
      }
    }
  }

  const textField = (
    key: Field,
    label: string,
    options: { type?: string; autoComplete?: string; optional?: boolean } = {},
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`register-${key}`}>
        {label}
        {options.optional && (
          <span className="ml-1 font-normal text-muted-foreground">
            {r.optional}
          </span>
        )}
      </Label>
      <Input
        id={`register-${key}`}
        type={options.type ?? "text"}
        autoComplete={options.autoComplete}
        value={fields[key]}
        onChange={(e) => setField(key, e.target.value)}
        disabled={loading}
        className="h-12 bg-card text-base md:text-base"
      />
    </div>
  );

  return (
    <div className="w-full max-w-[420px] space-y-6">
      <div className="text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {r.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{r.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {textField("name", r.name, { autoComplete: "organization" })}

        <div className="space-y-2">
          <Label htmlFor="login-phone">{t.login.phoneLabel}</Label>
          <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">{t.login.passwordLabel}</Label>
          <InputGroup className="h-12 bg-card">
            <InputGroupInput
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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
          <PasswordStrength password={password} />
          <p className="text-xs text-muted-foreground">
            {interpolate(r.passwordHint, { count: MIN_PASSWORD_LENGTH })}
          </p>
        </div>

        {textField("legalName", r.legalName, { optional: true })}
        <div className="grid gap-5 sm:grid-cols-2">
          {textField("inn", r.inn, { optional: true })}
          {textField("email", r.email, {
            type: "email",
            autoComplete: "email",
            optional: true,
          })}
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
            r.submit
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {r.haveAccount}{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          {r.loginLink}
        </Link>
      </p>
    </div>
  );
}
