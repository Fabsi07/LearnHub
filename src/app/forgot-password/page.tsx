import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";
import { AuthSplitLayout } from "@/components/login/AuthSplitLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      headline={
        <>
          Passwort{" "}
          <span style={{ color: "#7a000a", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>
            vergessen
          </span>
          ?
        </>
      }
      subtitle={
        <>
          Künftig läuft das Zurücksetzen über deinen zentralen DHBW-Account.
          Die Anbindung ist aktuell noch in Vorbereitung.
        </>
      }
    >
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Passwort zurücksetzen
          </h1>
          <p className="text-gray-500 text-sm">
            Diese Funktion ist noch nicht verfügbar.
          </p>
        </div>

        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-semibold">
              Auth-System noch nicht mit DHBW-System verbunden.
            </span>{" "}
            Sobald die Anmeldung über das zentrale DHBW-Login (SSO) läuft,
            erfolgt das Zurücksetzen direkt über deinen DHBW-Account.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-red-dark hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Anmeldung
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
