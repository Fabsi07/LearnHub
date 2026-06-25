import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Impressum – LearnHub",
  description: "Angaben gemäß § 5 DDG zum studentischen Projekt LearnHub.",
};

export default function ImpressumPage() {
  return (
    <LegalPageLayout
      title="Impressum"
      intro="Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)."
      updatedAt="25. Juni 2026"
    >
      <section className="space-y-3">
        <h2>Projektkontext</h2>
        <p>
          LearnHub ist eine im Rahmen des Anwendungsprojekts im Studiengang
          Informatik an der Dualen Hochschule Baden-Württemberg (DHBW)
          entwickelte Lernmanagement-Anwendung. Es handelt sich um ein
          nicht-kommerzielles studentisches Hochschulprojekt, das ausschließlich
          zu Studien- und Demonstrationszwecken betrieben wird. Ein öffentlicher
          Produktivbetrieb findet im Rahmen des Projekts nicht statt.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          Projektteam LearnHub (Anwendungsprojekt Informatik)
          <br />
          Duale Hochschule Baden-Württemberg Lörrach
          <br />
          Hangstraße 46-50
          <br />
          79539 Lörrach
          <br />
          E-Mail: projekt@dhbw-loerrach.de
        </p>
        <p>
          Projektteam: Lucas Sedelmayr (Projektleitung), Lennard Wiek, Yannik
          Roeder, Finn Pfleghaar, Fabian Winterhalter.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Betreuung</h2>
        <p>
          Betreuender Dozent / Auftraggeber: Prof. Dr. Erik Behrends, DHBW.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Haftung für Inhalte</h2>
        <p>
          Die Anwendung wird als Prototyp im Rahmen eines Studienprojekts
          bereitgestellt. Für die Richtigkeit, Vollständigkeit und Aktualität
          der bereitgestellten Funktionen und Inhalte wird keine Gewähr
          übernommen. Eine Nutzung erfolgt im Rahmen des Projektkontexts.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Urheberrecht</h2>
        <p>
          Die im Rahmen des Projekts erstellten Inhalte und Werke unterliegen dem
          Urheberrecht. Verwendete Marken (z. B. das DHBW-Logo) sind Eigentum der
          jeweiligen Rechteinhaber und werden ausschließlich im Hochschulkontext
          genutzt.
        </p>
      </section>
    </LegalPageLayout>
  );
}
