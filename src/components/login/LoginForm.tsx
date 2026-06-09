"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getSafeRedirectPath(): string {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/dashboard";
  }
  return redirect;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (res.ok) {
        router.push(getSafeRedirectPath());
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? "Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
    } catch {
      setError("Verbindung zum Server fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Willkommen zurueck
        </h1>
        <p className="text-sm text-gray-500">Melde dich wieder an.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            E-Mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@stud.hs.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="h-11 w-full border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-brand-red"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            Passwort
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mindestens 8 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11 w-full border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-brand-red"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(val) => setRememberMe(Boolean(val))}
              className="border-gray-300"
            />
            <label
              htmlFor="remember"
              className="cursor-pointer select-none text-sm text-gray-500"
            >
              Eingeloggt bleiben
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-red hover:text-brand-red-dark hover:underline"
          >
            Passwort vergessen?
          </Link>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-3 py-2 text-sm text-brand-red"
          >
            {error}
          </p>
        ) : null}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-brand-red text-base font-bold text-white hover:bg-brand-red-dark disabled:opacity-60"
          >
            {submitting ? "Wird angemeldet ..." : "Anmelden"}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Noch keinen Account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-red hover:text-brand-red-dark hover:underline"
          >
            Jetzt registrieren
          </Link>
        </p>
      </form>
    </div>
  );
}
