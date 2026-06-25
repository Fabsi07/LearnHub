# Übergabedokumentation — LearnHub (in Vorbereitung)

| Feld       | Inhalt                                                          |
| ---------- | --------------------------------------------------------------- |
| **Status** | In Vorbereitung — wird bis zur Abgabe (05.07.2026) finalisiert  |
| **Stand**  | 25.06.2026 (Meilenstein 3)                                      |
| **Zweck**  | Alles, was ein Team zum Weiterbetrieb/-entwickeln von LearnHub braucht |

> Dieses Dokument ist bewusst als lebendiger Entwurf angelegt. Abschnitte mit
> ⏳ werden bis zur finalen Abgabe vervollständigt.

---

## 1. Was ist LearnHub?

Webbasierte Lernmanagement-Anwendung für Studierende: Lernpläne, Aufgaben,
Kalender und Benachrichtigungen an einem Ort, mit deterministischer
Lernplanberechnung als Kern. Fachlicher Umfang: [docs/prd.md](./prd.md).

---

## 2. Schnelleinstieg für Übernehmende

1. Repository klonen, Voraussetzungen prüfen (Node 20+, Docker, Git).
2. Setup nach [README.md](../README.md) bzw. [SETUP.md](../SETUP.md) durchführen.
3. Architektur verstehen: [docs/architecture.md](./architecture.md).
4. Arbeitsregeln und Konventionen: [CLAUDE.md](../CLAUDE.md).
5. App lokal starten (`npm run dev`) und mit dem Admin-Zugang (siehe README)
   anmelden.

---

## 3. Repository-Landkarte

| Pfad                     | Inhalt                                              |
| ------------------------ | --------------------------------------------------- |
| `src/app/(app)/`         | Geschützte Feature-Seiten (Dashboard, Kalender, …)  |
| `src/app/api/`           | Route Handler (REST-artige Endpunkte)              |
| `src/components/`        | UI nach Feature + `ui/` + `layout/`                 |
| `src/lib/`               | Logik, Validierung, Datenzugriff je Feature         |
| `prisma/`                | Schema + Migrationen                                |
| `tests/study-plan/`      | Unit-Tests der Planungslogik                        |
| `docs/`                  | Projekt-, Architektur- und Testdokumentation        |

---

## 4. Betrieb & Konfiguration

- **Datenbank:** PostgreSQL via `docker compose up -d`.
- **Migrationen:** `npm run prisma:deploy` (Setup/Pull), `npm run prisma:migrate`
  (eigene Schemaänderungen).
- **Umgebungsvariablen:** siehe `.env.example` (u. a. `DATABASE_URL`,
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME`).
- **Admin-Account:** Es gibt keinen separaten Anlege-Schritt. Meldet man sich
  im Login mit der konfigurierten `ADMIN_EMAIL` **und** `ADMIN_PASSWORD` an
  (Defaults `0000@learnhub.admin` / `0000admin`, überschreibbar via `.env`),
  legt `ensureFixedAdminAccount()` das Konto beim ersten Mal mit Rolle `ADMIN`
  an. Bei späteren Logins wird ein bestehendes Konto nicht verändert.
  (Code: `src/lib/auth/admin.ts`, aufgerufen in `src/app/api/auth/login/route.ts`.)

---

## 5. Qualitätssicherung

- `npm run build`, `npm run typecheck`, `npm run lint`, `npm test` vor jedem
  Commit (siehe CLAUDE.md §11).
- **Automatisierte Unit-Tests** (`npm test`, Node-Test-Runner) unter
  [tests/study-plan/](../tests/study-plan/): Lernplanberechnung
  (`learningPlan`), Umplanung, Fortschrittsberechnung (`progress`),
  Fälligkeiten (`dueDates`) und Aufgabenvalidierung (`taskValidation`).
- Manueller Abnahmetest UC1–UC6:
  [docs/testing/manual-acceptance-test.md](./testing/manual-acceptance-test.md).
- Statische Prüfung: `npm run typecheck` (TS strict) und `npm run lint`.
- Aufgabensteuerung/Issues: GitHub Projects.
- Noch offen: automatisierte API-/E2E-Tests.

---

## 6. Bekannte Einschränkungen & offene Punkte

Gepflegt in [CLAUDE.md §13](../CLAUDE.md) und
[docs/tech-stack.md](./tech-stack.md) („Offene technische Punkte"). Mockups bzw.
nicht implementierte Bereiche: [docs/mockups.md](./mockups.md).

Kurzfassung:

- Demo-Daten/Seed (S4) vorhanden: `npm run seed` (idempotent, Login `demo@learnhub.test` / `demo12345`).
- Transparenzanzeige der Planungslogik (S5) offen.
- API-/E2E-Tests fehlen; Unit-Tests bisher nur für die Planungslogik.
- E-Mail-Änderung/Passwort-Reset bewusst als Mockup (künftig DHBW-SSO).
- KI-Funktionen bewusst zurückgestellt (Could-Have).

---

## 7. Empfohlene nächste Schritte (für Weiterentwicklung)

1. API- und E2E-Tests ergänzen.
2. SSO-Anbindung (DHBW) inkl. Passwort-Reset.
3. Produktiv-/Hosting-Konzept inkl. externem Datei-Storage für Profilbilder.

---

## 8. Noch zu ergänzen ⏳

- ⏳ Ansprechpartner und Verantwortlichkeiten nach Projektende.
- ⏳ Lizenz-/Rechtehinweise zum Code und zu verwendeten Assets.
- ⏳ Screenshots der zentralen Screens.
- ⏳ Verweis auf das finale Abgabepaket in Moodle.
