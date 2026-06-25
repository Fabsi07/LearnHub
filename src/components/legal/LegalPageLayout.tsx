import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LearnHubBrand } from "@/components/brand/LearnHubBrand";

interface LegalPageLayoutProps {
  /** Seitentitel (z. B. „Impressum"). */
  title: string;
  /** Kurzer einleitender Satz unter dem Titel. */
  intro: string;
  /** Stand-Datum der Seite, z. B. „25. Juni 2026". */
  updatedAt: string;
  /** Seiteninhalt (Abschnitte). */
  children: React.ReactNode;
}

/**
 * Gemeinsames Layout der rechtlichen Seiten (Impressum, Datenschutz,
 * Nutzungsordnung). Ruhiges, akademisch-professionelles Lese-Layout ohne
 * Sidebar – die Seiten sind öffentlich erreichbar (siehe middleware.ts).
 */
export function LegalPageLayout({
  title,
  intro,
  updatedAt,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/login" aria-label="Zur Startseite">
            <LearnHubBrand
              className="gap-2"
              markClassName="h-8 w-11"
              markVariant="plain"
              hubClassName="text-brand-red"
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-red-dark hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-3 text-gray-600">{intro}</p>
        <p className="mt-2 text-sm text-gray-400">Stand: {updatedAt}</p>

        <article className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700 [&_a]:font-medium [&_a]:text-brand-red [&_a:hover]:underline [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </article>

        <footer className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-200 pt-6 text-sm text-gray-500">
          <Link href="/impressum" className="hover:text-brand-red hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-brand-red hover:underline">
            Datenschutzerklärung
          </Link>
          <Link href="/nutzungsordnung" className="hover:text-brand-red hover:underline">
            Nutzungsordnung
          </Link>
        </footer>
      </main>
    </div>
  );
}
