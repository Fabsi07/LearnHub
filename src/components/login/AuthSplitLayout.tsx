import Image from "next/image";
import { LearnHubBrand } from "@/components/brand/LearnHubBrand";
import { LanguageSelect } from "@/lib/i18n/LanguageProvider";

interface AuthSplitLayoutProps {
  /** Große Überschrift im linken Marken-Panel. */
  headline: React.ReactNode;
  /** Erklärender Untertitel unter der Überschrift. */
  subtitle: React.ReactNode;
  /** Inhalt der rechten Spalte (Formular bzw. Hinweis). */
  children: React.ReactNode;
}

/**
 * Geteiltes Split-Screen-Layout der Auth-Seiten (Login, Registrieren,
 * Passwort vergessen): links das rote Marken-Panel mit Blueprint-Grid,
 * rechts der seitenspezifische Inhalt. Vermeidet dreifach dupliziertes Markup.
 */
export function AuthSplitLayout({
  headline,
  subtitle,
  children,
}: AuthSplitLayoutProps) {
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

        {/* Header: Titel links + DHBW-Logo rechts */}
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

        {/* Mitte: vertikal zentrierter Text */}
        <div className="relative flex-1 flex items-center">
          <div className="space-y-6">
            <p className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-xl">
              {headline}
            </p>
            <p className="text-lg text-white/70 max-w-md">{subtitle}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-sm text-white/60">
          © {new Date().getFullYear()} LearnHub. Alle Rechte vorbehalten.
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-gray-50 p-6 lg:p-12">
        <div className="absolute right-5 top-5">
          <LanguageSelect />
        </div>
        {children}
      </div>
    </div>
  );
}
