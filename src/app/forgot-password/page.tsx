import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";
import { LearnHubBrand } from "@/components/brand/LearnHubBrand";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <div
        className="hidden lg:flex lg:w-1/2 text-white flex-col pt-2 pb-2 px-6 relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 20%, color-mix(in srgb, var(--color-brand-red-light) 35%, transparent) 0%, transparent 55%), radial-gradient(at 80% 80%, var(--color-brand-red-dark) 0%, transparent 55%), linear-gradient(135deg, var(--color-brand-red) 0%, var(--color-brand-red-dark) 100%)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="blueprint-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.6" />
              <path d="M 0 0 L 80 80 M 80 0 L 0 80" fill="none" stroke="white" strokeWidth="0.4" />
              <path d="M 40 0 L 40 80 M 0 40 L 80 40" fill="none" stroke="white" strokeWidth="0.4" />
              <circle cx="0" cy="0" r="1.4" fill="white" />
              <circle cx="80" cy="0" r="1.4" fill="white" />
              <circle cx="0" cy="80" r="1.4" fill="white" />
              <circle cx="80" cy="80" r="1.4" fill="white" />
              <circle cx="40" cy="40" r="2.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(0,0,0,0.35) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex items-center justify-between">
          <LearnHubBrand
            markClassName="h-16 w-20"
            markVariant="white"
            textClassName="text-5xl"
            hubClassName="text-[#7a000a] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          />
          <Image
            src="/images/Dhbw_Icon.png"
            alt="DHBW Logo"
            width={90}
            height={90}
            className="object-contain opacity-90"
          />
        </div>

        <div className="relative flex-1 flex items-center">
          <div className="space-y-6">
            <p className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-xl">
              Passwort{" "}
              <span style={{ color: "#7a000a", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>
                vergessen
              </span>
              ?
            </p>
            <p className="text-lg text-white/70 max-w-md">
              Künftig läuft das Zurücksetzen über deinen zentralen DHBW-Account.
              Die Anbindung ist aktuell noch in Vorbereitung.
            </p>
          </div>
        </div>

        <div className="relative text-sm text-white/60">
          © {new Date().getFullYear()} LearnHub. Alle Rechte vorbehalten.
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gray-50 p-6 lg:p-12">
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
      </div>
    </div>
  );
}
