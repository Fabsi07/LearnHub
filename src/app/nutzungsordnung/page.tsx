import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Nutzungsordnung – LearnHub",
  description: "Regeln und Hinweise zur Nutzung der LearnHub-Anwendung.",
};

export default function NutzungsordnungPage() {
  return (
    <LegalPageLayout
      title="Nutzungsordnung"
      intro="Diese Nutzungsordnung beschreibt den vorgesehenen Einsatz von LearnHub im Rahmen des Hochschulprojekts."
      updatedAt="25. Juni 2026"
    >
      <section className="space-y-3">
        <h2>1. Geltungsbereich und Zweck</h2>
        <p>
          LearnHub ist ein studentischer Prototyp zur persönlichen Lernplanung
          (Lernpläne, Aufgaben, Kalender, Benachrichtigungen). Die Anwendung ist
          für die Selbstorganisation einer einzelnen studierenden Person ausgelegt
          und nicht für Lerngruppen, Dozierende oder den institutionellen Einsatz
          konzipiert.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Konto und Zugangsdaten</h2>
        <ul>
          <li>
            Jede Person ist für die Geheimhaltung ihres Passworts und die
            Nutzung ihres Kontos selbst verantwortlich.
          </li>
          <li>
            Konten sind persönlich; eine Weitergabe der Zugangsdaten ist nicht
            vorgesehen.
          </li>
          <li>
            Das Zurücksetzen des Passworts ist im aktuellen Stand noch nicht
            angebunden und soll künftig über das zentrale DHBW-Login (SSO)
            erfolgen.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. Zulässige Nutzung</h2>
        <ul>
          <li>
            Die Anwendung darf ausschließlich zu den vorgesehenen Lern- und
            Organisationszwecken genutzt werden.
          </li>
          <li>
            Es dürfen keine rechtswidrigen, beleidigenden oder
            persönlichkeitsverletzenden Inhalte eingegeben werden.
          </li>
          <li>
            Versuche, die Anwendung zu manipulieren, zu überlasten oder auf Daten
            anderer Konten zuzugreifen, sind untersagt.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. Inhalte der Nutzer</h2>
        <p>
          Für die selbst eingegebenen Inhalte (z. B. Lernpläne, Aufgaben,
          Termine, Feedback) ist die jeweilige Person verantwortlich. Da es sich
          um einen Prototyp handelt, sollten keine besonders sensiblen oder
          unwiederbringlich wichtigen Daten ausschließlich in LearnHub gespeichert
          werden.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. Verfügbarkeit und Gewährleistung</h2>
        <p>
          LearnHub wird als Projekt-Prototyp ohne Anspruch auf dauerhafte
          Verfügbarkeit, Fehlerfreiheit oder Datenerhalt bereitgestellt.
          Einzelne Funktionsbereiche können als Vorschau (Mockup) gekennzeichnet
          oder noch nicht vollständig angebunden sein. Eine Haftung für Schäden
          aus der Nutzung wird im Rahmen des gesetzlich Zulässigen ausgeschlossen.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Datenschutz</h2>
        <p>
          Einzelheiten zur Verarbeitung personenbezogener Daten finden sich in der{" "}
          <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
