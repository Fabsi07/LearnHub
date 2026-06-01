# Technologien und Tools

Stand: 2026-05-18

## Zielsetzung

LearnHub wird als lokale Webanwendung fuer ein Hochschulprojekt entwickelt. Der Stack ist auf eine schnelle MVP-Umsetzung, klare UI-Strukturen und spaetere Erweiterbarkeit ausgelegt.

---

## Frontend

- Next.js 15 mit App Router
- React 18
- TypeScript 5 mit Strict Mode
- Tailwind CSS v4
- shadcn/ui-Konfiguration mit Base UI (`@base-ui/react`)
- Lucide React fuer Icons

Begruendung:

- Next.js bietet Routing, Layouts und API-Routes in einem Framework.
- React und TypeScript ermoeglichen komponentenbasierte, typisierte Entwicklung.
- Tailwind CSS passt gut zum schnellen Aufbau konsistenter UI-Komponenten.
- Die bestehende `(app)`-Route-Group kapselt den eingeloggten App-Bereich ueber `DashboardShell`.

---

## Backend / Datenhaltung

- Next.js Route Handlers unter `src/app/api/`
- PostgreSQL als geplante lokale Datenbank
- Prisma als ORM
- Prisma-Schema aktuell noch ohne Fachmodelle

Geplanter Kern:

- `User`
- `StudyPlan`
- `Task`
- `CalendarEvent`

Derzeit ist die Persistenz noch nicht umgesetzt. Das Prisma-Schema enthaelt bisher nur Generator und PostgreSQL-Datasource. Die Ausarbeitung des Datenmodells ist ueber GitHub Issues geplant.

---

## Authentifizierung

Status: Konzept finalisiert (Issue #36 / C1), Implementierung steht aus (Tickets C2, C3).

Festlegung fuer das MVP:

- Eigene minimale Implementierung in Next.js Route Handlers (keine externe Auth-Library wie NextAuth oder Lucia).
- Passwort-Hashing mit bcrypt (`bcryptjs`, Cost 12).
- Server-Sessions in der Datenbank (`Session`-Tabelle in Prisma); opaker Token im `lh_session`-Cookie (HTTP-Only, SameSite=Lax).
- Schutzlogik in [src/middleware.ts](../src/middleware.ts) ist vorbereitet, aber ueber `AUTH_ENABLED = false` deaktiviert. C3 aktiviert sie.

Vollstaendiges Konzept inklusive Datenmodell, Endpunkten, geschuetzten Routen und Sicherheits-Erwaegungen: [docs/auth-concept.md](./auth-concept.md).

---

## Kalenderintegration

- Kalender-UI mit Tages-, Wochen- und Monatsansicht
- Externer DHBW-ICS-Abruf ueber `/api/calendar/external`
- `node-ical` zum Parsen von ICS-Daten
- Retry-, Timeout- und In-Memory-Cache-Logik fuer den externen Kalenderfeed

Wichtig: Der externe ICS-Abruf ist eine technische Integration fuer Kalenderdaten. Persistente manuelle Termine und nutzerspezifische Kalenderquellen sind noch nicht umgesetzt.

---

## Projektmanagement

- GitHub Repository
- GitHub Projects als Projektplan / Kanban-Board
- GitHub Issues fuer Aufgaben, Meilensteine, Akzeptanzkriterien und Schaetzungen
- Pull Requests fuer Review und Zusammenfuehrung

Die Projektplanung wird fuehrend im GitHub Project gepflegt. Lokale Backlog-Dateien sind Arbeitsentwuerfe oder Dokumentationshilfen.

---

## Design & Prototyping

- Excalidraw fuer Design-Skizzen und Wireframes
- Exportierte Wireframes im Repository
- HTML-Prototyp unter `docs/design/prototypes/prototype_1/`

---

## KI-Tools

- ChatGPT / Codex
- Claude
- GitHub Copilot
- OpenAI API als moegliche optionale Produktfunktion

Einsatz:

- Unterstuetzung bei Entwicklung, Review und Dokumentation
- Optionale KI-Funktionen im Produkt nur als Could-Have, nicht als MVP-Kern
- Die Lernplan-Erstellung selbst ist als deterministischer Algorithmus geplant

---

## Entwicklungsumgebung

- Visual Studio Code
- Browser fuer manuelle Tests
- Node.js / npm
- Lokale PostgreSQL-Umgebung spaeter fuer Persistenz

---

## Offene technische Punkte

- Datenmodell und erste Prisma-Migration definieren (inkl. `User` und `Session` aus [docs/auth-concept.md](./auth-concept.md))
- Lokale Datenbankkonfiguration dokumentieren
- Authentifizierung implementieren (Tickets C2, C3 nach Bestaetigung des Konzepts)
- ESLint-Konfiguration reparieren oder ergaenzen
- Root-README zu einer vollstaendigen Setup-Anleitung ausbauen
