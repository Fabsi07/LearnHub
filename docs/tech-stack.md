# Technologien und Tools

Stand: 2026-06-18

## Zielsetzung

LearnHub ist eine lokale Webanwendung fuer ein Hochschulprojekt. Der Stack ist
auf eine schnelle MVP-Umsetzung, nachvollziehbare Fachlogik und spaetere
Erweiterbarkeit ausgelegt.

---

## Frontend

- Next.js 15 mit App Router
- React 18
- TypeScript 5 mit Strict Mode
- Tailwind CSS v4
- shadcn/ui-Konfiguration mit Base UI (`@base-ui/react`)
- Lucide React fuer Icons
- CSS-Variablen und persistenter Light-/Dark-Mode

Begruendung:

- Next.js stellt Routing, Server Components und API-Route-Handler in einem
  Framework bereit.
- React und TypeScript ermoeglichen komponentenbasierte, typisierte Entwicklung.
- Tailwind CSS und die vorhandenen UI-Primitives beschleunigen den Aufbau einer
  konsistenten Oberflaeche.
- Die `(app)`-Route-Group kapselt den geschuetzten App-Bereich ueber
  `DashboardShell`, `Sidebar` und `Topbar`.

---

## Backend / Datenhaltung

- Next.js Route Handlers unter `src/app/api/`
- PostgreSQL 16 als lokale Docker-Datenbank
- Prisma 6 als ORM und Migrationswerkzeug
- Zod fuer Request-Validierung in ausgewaehlten Endpunkten

Das Prisma-Schema enthaelt aktuell:

- `User` und `Session`
- `StudyPlan` und `Task`
- `CalendarEvent` und `CalendarSource`
- `Notification` und `NotificationSettings`
- `Feedback`

Die Datenbankmigrationen liegen versioniert unter `prisma/migrations/`.
Eingecheckte Migrationen werden beim Setup oder nach einem Pull mit
`npm run prisma:deploy` angewendet. `npm run prisma:migrate` ist fuer eigene
Aenderungen an `prisma/schema.prisma` vorgesehen.

Die API deckt Authentifizierung, Lernplan- und Aufgabenverwaltung,
algorithmische Umplanung, Kalendertermine und -quellen, Benachrichtigungen,
Feedback, Profilbilder sowie die Admin-Benutzerverwaltung ab.

---

## Authentifizierung und Rollen

Status: im MVP implementiert und aktiviert.

- Eigene minimale Implementierung in Next.js Route Handlers
- Passwort-Hashing mit `bcryptjs` und Cost-Faktor 12
- Serverseitige Sessions in PostgreSQL
- Opaker Session-Token im HTTP-Only-Cookie `lh_session`
- `SameSite=Lax`; `Secure` im Produktionsmodus
- Middleware-Schutz fuer App- und API-Routen
- Zusaetzliche serverseitige Session- und Owner-Pruefungen in Route Handlers
- Rollen `USER`, `ADMIN` und `DEV`

`ADMIN` darf Nutzer und Feedback verwalten. `DEV` darf Feedback verwalten,
erhaelt aber keinen Zugriff auf die Admin-Benutzerverwaltung.

Vollstaendiges urspruengliches Konzept:
[docs/auth-concept.md](./auth-concept.md).

---

## Lernplan und Planungslogik

Die Lernplan-Erstellung besteht aus zwei getrennten, deterministischen Schritten:

1. `studyPlanAlgorithm.ts` berechnet aus Zieldatum, Schwierigkeit, Vorwissen,
   Seitenumfang und ECTS den Gesamtaufwand, die Tagesintensitaet und den Plantyp.
2. `scheduler.ts` verteilt den Aufwand auf konkrete zweistuendige
   Lerneinheiten und prueft dabei bestehende lokale und externe Termine.

Die Planung unterscheidet normale und kritische Lernplaene, verteilt
Lerneinheiten in fachlich aufeinanderfolgende Phasen und gibt bei unrealistischer
Belastung Warnungen aus. Vor der Kalenderuebernahme wird eine Vorschau angezeigt.

Offene Aufgaben koennen ueber `replanTasks.ts` bis zum Zieldatum neu verteilt
werden. Erledigte Aufgaben bleiben unveraendert; verknuepfte Kalendertermine
werden mit aktualisiert.

---

## Kalenderintegration

- Tages-, Wochen-, Monats- und Listenansicht
- Persistente lokale Termine mit CRUD, Drag-and-drop und Resize
- Terminfilter, Suche, Typfarben und Wichtig-Markierung
- Verknuepfung von Lernplan, Aufgabe und Kalender-Lernslot
- Zieltermine der Lernplaene im Kalender
- Nutzerspezifische DHBW-Kurskennung ueber `CalendarSource`
- Externer DHBW-ICS-Abruf ueber `/api/calendar/external`
- `node-ical` zum Parsen von ICS-Daten
- Retry-, Timeout- und In-Memory-Cache-Logik fuer den externen Feed

Externe DHBW-Termine sind read-only. Eigene Termine und erzeugte Lernsessions
werden in PostgreSQL gespeichert.

---

## Benachrichtigungen, Feedback und Administration

- Persistente Benachrichtigungen mit Offen-/Erledigt-/Archiviert-Status
- Erkennung verpasster Lernsessions
- Hinweis zum Verschieben bei ein bis zwei verpassten Sessions
- Dringende Neuplanungswarnung ab drei verpassten Sessions
- Persistente Einstellungen fuer diese Warnungen
- Nutzerfeedback fuer Bugs, Verbesserungen und Feature-Ideen
- Feedback-Prioritaet und -Status fuer `ADMIN` und `DEV`
- Rollenbasierte Benutzerverwaltung fuer `ADMIN`

---

## Tests und Qualitaet

- ESLint mit Next.js-Konfiguration
- TypeScript-Strict-Mode und `npm run typecheck`
- Produktions-Build ueber `npm run build`
- Node-Test-Runner fuer die vorhandenen Unit-Tests
- Aktuelle Unit-Tests fuer Lernplanberechnung, Umplanung,
  Fortschrittsberechnung und Aufgabenvalidierung
- Manueller End-to-End-Abnahmetest unter
  [docs/testing/manual-acceptance-test.md](./testing/manual-acceptance-test.md)

Automatisierte API- und Browser-End-to-End-Tests sind derzeit noch nicht
vorhanden.

---

## Projektmanagement

- GitHub Repository
- GitHub Projects als Projektplan / Kanban-Board
- GitHub Issues fuer Aufgaben, Akzeptanzkriterien und Schaetzungen
- Pull Requests fuer Review und Zusammenfuehrung

Die Projektplanung wird fuehrend im GitHub Project gepflegt. Lokale
Planungsdateien koennen historische Arbeitsstaende enthalten.

---

## Design und Prototyping

- Excalidraw fuer Design-Skizzen und Wireframes
- Exportierte Wireframes unter `docs/design/wireframes/`
- HTML-Prototyp unter `docs/design/prototypes/prototype_1/`
- Implementierte responsive App-Shell mit Light-/Dark-Mode

---

## KI-Tools und KI-Entscheidung

Im Entwicklungsprozess wurden ChatGPT/Codex, Claude und GitHub Copilot
unterstuetzend eingesetzt.

Eine KI-Funktion im Produkt wurde fuer den aktuellen MVP bewusst nicht
implementiert. Die Kernplanung bleibt deterministisch, reproduzierbar und ohne
externen KI-Dienst nutzbar. Die Entscheidung ist unter
[docs/KI/ki-entscheidung.md](./KI/ki-entscheidung.md) dokumentiert.

---

## Entwicklungsumgebung und lokaler Betrieb

- Visual Studio Code
- Node.js LTS und npm
- Docker Desktop mit Docker Compose
- Lokale PostgreSQL-Datenbank im Container
- Browser fuer manuelle Tests

Der vollstaendige Ablauf ist in [SETUP.md](../SETUP.md) beschrieben. Der
PostgreSQL-Host-Port kann lokal ueber `POSTGRES_PORT` angepasst werden.

---

## Offene technische Punkte

- Reproduzierbare Demo-Daten beziehungsweise Seed fuer die Praesentation
- Automatisierte API- und End-to-End-Tests
- Persistenz der noch offenen Profil- und allgemeinen Reminder-Einstellungen
- Produktivbetrieb, Rate Limiting und Passwort-Recovery ausserhalb des lokalen MVP
- Externes Datei-/Objekt-Storage fuer Profilbilder bei einer spaeteren
  Produktivsetzung
