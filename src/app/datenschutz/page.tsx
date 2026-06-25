import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – LearnHub",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten in der LearnHub-Anwendung.",
};

export default function DatenschutzPage() {
  return (
    <LegalPageLayout
      title="Datenschutzerklärung"
      intro="Diese Erklärung beschreibt, welche Daten LearnHub verarbeitet und zu welchem Zweck. LearnHub wird als studentischer Prototyp lokal betrieben."
      updatedAt="25. Juni 2026"
    >
      <section className="space-y-3">
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist das Projektteam LearnHub
          (Anwendungsprojekt Informatik, DHBW). Kontaktangaben finden sich im{" "}
          <Link href="/impressum">Impressum</Link>.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Grundsatz: lokaler Betrieb, Datensparsamkeit</h2>
        <p>
          LearnHub ist im Rahmen des Projekts für den lokalen Betrieb auf einem
          Entwicklungsrechner ausgelegt. Es findet kein öffentliches Hosting im
          Internet statt. Es werden ausschließlich die für die Funktion
          notwendigen Daten erhoben. Es werden <strong>keine</strong> externen
          Analyse-, Tracking- oder Werbedienste eingesetzt.
        </p>
      </section>

      <section className="space-y-3">
        <h2>3. Welche Daten verarbeitet werden</h2>
        <h3>Kontodaten</h3>
        <ul>
          <li>E-Mail-Adresse</li>
          <li>Anzeigename und optionaler Benutzername</li>
          <li>Passwort – ausschließlich als bcrypt-Hash gespeichert, niemals im Klartext</li>
          <li>Optionales Profilbild (lokal in der Datenbank gespeichert)</li>
        </ul>
        <h3>Lerndaten (vom Nutzer eingegeben)</h3>
        <ul>
          <li>Lernpläne (Titel, Fach, Zieltyp, Zieldatum, Algorithmus-Eingaben)</li>
          <li>Aufgaben (Titel, Aufwand, Schwierigkeit, Fälligkeit, Status)</li>
          <li>Kalendertermine und ggf. konfigurierte externe Kalenderquellen</li>
          <li>Benachrichtigungs- und Einstellungspräferenzen</li>
          <li>Optional eingereichtes Feedback</li>
        </ul>
        <h3>Technisch notwendige Daten</h3>
        <ul>
          <li>
            Sitzungs-Cookie (<code>lh_session</code>) als HTTP-Only-Cookie zur
            Aufrechterhaltung der Anmeldung
          </li>
          <li>Zeitstempel zu Erstellung und Änderung von Datensätzen</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. Zwecke und Rechtsgrundlage</h2>
        <p>
          Die Verarbeitung erfolgt ausschließlich zur Bereitstellung der
          Anwendungsfunktionen (Konto, Lernplanung, Kalender, Benachrichtigungen)
          auf Grundlage der Nutzung der Anwendung durch die angemeldete Person.
          Jeder Nutzer sieht und verwaltet ausschließlich seine eigenen Daten;
          ein Zugriff anderer Nutzerkonten auf diese Daten ist technisch
          ausgeschlossen.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. Cookies</h2>
        <p>
          LearnHub setzt ein technisch notwendiges Sitzungs-Cookie
          (<code>lh_session</code>, <code>HttpOnly</code>,{" "}
          <code>SameSite=Lax</code>), um den Anmeldestatus zu speichern. Es
          werden keine Tracking- oder Marketing-Cookies verwendet.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Externe Kalenderquellen</h2>
        <p>
          Wenn ein Nutzer eine externe Kalenderquelle (z. B. den DHBW-ICS-Feed)
          konfiguriert, ruft LearnHub die hinterlegte Adresse serverseitig ab, um
          die Termine anzuzeigen. Dabei wird die konfigurierte URL an den jeweils
          externen Anbieter übermittelt. Für die Datenverarbeitung des externen
          Anbieters ist dessen Datenschutzerklärung maßgeblich.
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. Speicherdauer</h2>
        <p>
          Konto- und Lerndaten werden gespeichert, solange das Nutzerkonto
          besteht. Sitzungen laufen nach Ablauf der hinterlegten Gültigkeit oder
          bei Abmeldung ab. Mit dem Löschen eines Lernplans werden die zugehörigen
          Aufgaben und generierten Lerneinheiten mitgelöscht.
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. Rechte der betroffenen Person</h2>
        <p>
          Im Rahmen der geltenden Datenschutzbestimmungen bestehen die Rechte auf
          Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie
          Datenübertragbarkeit. Anfragen können über die im Impressum genannte
          Kontaktadresse gerichtet werden.
        </p>
      </section>

      <section className="space-y-3">
        <h2>9. Datensicherheit</h2>
        <p>
          Passwörter werden ausschließlich gehasht gespeichert (bcrypt).
          Sitzungen werden über HTTP-Only-Cookies abgewickelt. Da die Anwendung
          im Projektkontext lokal betrieben wird, hängt die Gesamtsicherheit
          zusätzlich von der Absicherung des jeweiligen Betriebsumfelds ab.
        </p>
      </section>
    </LegalPageLayout>
  );
}
