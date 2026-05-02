"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: Login-Logik implementieren
    console.log("Login:", { username, password, rememberMe });
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
            htmlFor="username"
            className="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            E-Mail
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="name@stud.hs.de"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
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
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11 w-full border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-brand-red"
          />
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

        {/* 4. CTA Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-bold text-base"
          >
            Anmelden
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

