"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? "Registrierung fehlgeschlagen. Bitte erneut versuchen.");
    } catch {
      setError("Verbindung zum Server fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* 1. Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Account erstellen
        </h1>
        <p className="text-gray-500 text-sm">
          Lege dein LearnHub-Konto in wenigen Sekunden an.
        </p>
      </div>

      {/* 2. Formular */}
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
            autoComplete="email"
            className="h-11 w-full border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-brand-red"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="displayName"
            className="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            Anzeigename
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="z. B. Max Mustermann"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            maxLength={80}
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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mindestens 8 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="h-11 w-full border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-brand-red pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Fehler-Anzeige */}
        {error ? (
          <p
            role="alert"
            className="text-sm text-brand-red bg-brand-red/5 border border-brand-red/20 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        ) : null}

        {/* 3. CTA */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-bold text-base disabled:opacity-60"
          >
            {submitting ? "Wird erstellt …" : "Account erstellen"}
          </Button>
        </div>

        {/* 4. Login-Link */}
        <p className="text-center text-sm text-gray-500">
          Bereits einen Account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-red hover:text-brand-red-dark hover:underline"
          >
            Jetzt Anmelden
          </Link>
        </p>
      </form>
    </div>
  );
}
