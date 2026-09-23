"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { LoadErrorState } from "@/components/dashboard/page-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Advertiser } from "@/lib/api/ads";
import {
  changePassword,
  getAdvertiser,
  MIN_PASSWORD_LENGTH,
  updateProfile,
} from "@/lib/api/portal-auth";
import { interpolate } from "@/lib/i18n/interpolate";
import { useT } from "@/lib/i18n/provider";

type ProfileField = "name" | "legalName" | "inn" | "email";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; account: Advertiser };

export default function SettingsPage() {
  const p = useT("portal");
  const [state, setState] = React.useState<State>({ status: "loading" });

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    return getAdvertiser()
      .then((account) =>
        setState(
          account
            ? { status: "ready", account }
            : { status: "error", message: "" },
        ),
      )
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "",
        }),
      );
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10">
      <PageHeader title={p.settings.title} description={p.settings.description} />

      {state.status === "loading" && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      )}
      {state.status === "error" && (
        <LoadErrorState message={state.message} onRetry={load} />
      )}
      {state.status === "ready" && (
        <>
          <ProfileForm
            account={state.account}
            onSaved={(account) => setState({ status: "ready", account })}
          />
          <PasswordForm />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="h-10 text-[0.9375rem] md:text-[0.9375rem]"
        {...props}
      />
    </div>
  );
}

function ProfileForm({
  account,
  onSaved,
}: {
  account: Advertiser;
  onSaved: (account: Advertiser) => void;
}) {
  const p = useT("portal");
  const s = p.settings;
  const r = p.register;
  const [form, setForm] = React.useState<Record<ProfileField, string>>({
    name: account.name,
    legalName: account.legalName,
    inn: account.inn,
    email: account.email,
  });
  const [saving, setSaving] = React.useState(false);

  const set = (key: ProfileField) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !form.name.trim()) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        legalName: form.legalName.trim(),
        inn: form.inn.trim(),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
      });
      toast.success(s.saved);
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title={s.profile} description={`${s.phone}: ${account.phone}`}>
      <form onSubmit={save} className="space-y-4">
        <Field id="profile-name" label={r.name} value={form.name} onChange={set("name")} />
        <Field
          id="profile-legal"
          label={r.legalName}
          value={form.legalName}
          onChange={set("legalName")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="profile-inn" label={r.inn} value={form.inn} onChange={set("inn")} />
          <Field
            id="profile-email"
            type="email"
            label={r.email}
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !form.name.trim()}>
            {saving ? s.saving : s.save}
          </Button>
        </div>
      </form>
    </Section>
  );
}

function PasswordForm() {
  const p = useT("portal");
  const s = p.settings;
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const valid = current.length > 0 && next.length >= MIN_PASSWORD_LENGTH;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !valid) return;
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success(s.passwordChanged);
      setCurrent("");
      setNext("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title={s.password}
      description={interpolate(p.register.passwordHint, {
        count: MIN_PASSWORD_LENGTH,
      })}
    >
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Field
          id="password-current"
          type="password"
          autoComplete="current-password"
          label={s.currentPassword}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <Field
          id="password-new"
          type="password"
          autoComplete="new-password"
          label={s.newPassword}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" disabled={saving || !valid}>
            {saving ? s.saving : s.changePassword}
          </Button>
        </div>
      </form>
    </Section>
  );
}
