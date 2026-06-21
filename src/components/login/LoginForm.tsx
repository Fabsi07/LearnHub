"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Anmeldung fehlgeschlagen.");
        return;
      }

      const data = (await res.json().catch(() => ({}))) as {
        role?: "USER" | "ADMIN" | "DEV";
      };
      const redirect = searchParams.get("redirect");
      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : null;
      const canOpenManagement = data.role === "ADMIN" || data.role === "DEV";
      const target =
        safeRedirect && (canOpenManagement || !safeRedirect.startsWith("/admin"))
          ? safeRedirect
          : canOpenManagement
            ? "/admin"
            : "/dashboard";

      router.replace(target);
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* 1. Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Willkommen zurück
        </h1>
        <p className="text-gray-500 text-sm">
          Melde dich wieder an.
        </p>
      </div>

      {/* 2. Formular */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Feld 1: Benutzerkennung */}
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

        {/* Feld 2: Passwort */}
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
              autoComplete="current-password"
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

        {/* 3. Zusatzoptionen */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(val) => setRememberMe(val as boolean)}
              className="border-gray-300"
            />
            <label
              htmlFor="remember"
              className="text-sm text-gray-500 cursor-pointer select-none"
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

        {/* Fehlermeldung */}
        {error && (
          <p role="alert" className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-3 py-2 text-sm text-brand-red">
            {error}
          </p>
        )}

        {/* 4. CTA Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-bold text-base disabled:opacity-60"
          >
            {isLoading ? "Anmelden…" : "Anmelden"}
          </Button>
        </div>

        {/* 5. Registrieren */}
        <p className="text-center text-sm text-gray-500">
          Noch keinen Account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-red hover:text-brand-red-dark hover:underline"
          >
            Jetzt Registrieren
          </Link>
        </p>
      </form>
    </div>
  );
}

