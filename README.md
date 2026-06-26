# LearnHub

LearnHub ist eine webbasierte Lernmanagement-Anwendung fuer Studierende. Sie buendelt Lernplaene, Aufgaben und Kalendertermine in einer Oberflaeche und berechnet aus Zieldatum, Aufwand und verfuegbarer Lernzeit einen nachvollziehbaren Lernplan.

Ausfuehrliche Beschreibung im [Product Requirements Document](./docs/prd.md). Architektur- und Stack-Entscheidungen in [docs/tech-stack.md](./docs/tech-stack.md).

---

## Quickstart

Voraussetzungen:

- Node.js 20 oder neuer
- Docker Desktop
- Git

Aus dem Stand „frischer Checkout" zum laufenden Dev-Server:

```bash
git clone https://github.com/Fabsi07/LearnHub.git
cd LearnHub
npm ci
cp .env.example .env
docker compose up -d
npm run prisma:deploy
npm run prisma:generate
npm run dev
```

Anschliessend ist die App unter [http://localhost:3000](http://localhost:3000) erreichbar.

Eine ausfuehrliche Schritt-fuer-Schritt-Anleitung inklusive Windows-Hinweisen, Docker-Erststart, Port-Konflikten und Troubleshooting steht in [SETUP.md](./SETUP.md).

---

## Taegliche Befehle

| Was | Befehl |
| --- | --- |
| Dev-Server starten | `npm run dev` |
| Datenbank starten | `docker compose up -d` |
| Datenbank stoppen | `docker compose down` |
| Datenbank vollstaendig zuruecksetzen | `docker compose down -v` |
| Eingecheckte Migrationen anwenden | `npm run prisma:deploy` |
| Prisma-Client generieren | `npm run prisma:generate` |
| Build pruefen | `npm run build` |
| Linter | `npm run lint` |
| TypeScript pruefen | `npm run typecheck` |
| Unit-Tests | `npm test` |
| Demo-Daten laden | `npm run seed` |

Nach einem `git pull` mit neuen Dateien unter `prisma/migrations/`:

```bash
npm run prisma:deploy
npm run prisma:generate
```

Eigene Schema-Aenderungen werden mit `npm run prisma:migrate` als neue Migration entwickelt. Fuer Setup und Pulls wird dagegen `prisma:deploy` verwendet.

---

## Admin-Zugang

Der feste Admin-Account wird beim ersten Login automatisch angelegt. Die Defaults stehen in `.env.example` und koennen lokal ueber `ADMIN_EMAIL`, `ADMIN_PASSWORD` und `ADMIN_DISPLAY_NAME` ueberschrieben werden.

| Feld | Default |
| --- | --- |
| E-Mail | `0000@learnhub.admin` |
| Passwort | `0000admin` |

---

## Demo-Daten

`npm run seed` befuellt die lokale Datenbank mit reproduzierbaren Beispieldaten
fuer die Praesentation (drei Lernplaene, Aufgaben inkl. erledigter und
ueberfaelliger, Kalendertermine). Das Skript ist idempotent und ruehrt nur den
Demo-Account an.

| Feld | Wert |
| --- | --- |
| E-Mail | `demo@learnhub.test` |
| Passwort | `demo12345` |

---

## Projekt-Dokumentation

- [Setup-Anleitung](./SETUP.md) — ausfuehrlicher lokaler Setup- und Troubleshooting-Guide
- [Product Requirements Document](./docs/prd.md) — fachlicher Funktionsumfang inkl. Feature-Status (§17)
- [Architekturueberblick](./docs/architecture.md) — Schichten, Datenmodell und API-Oberflaeche
- [Tech-Stack](./docs/tech-stack.md) — eingesetzte Technologien und Begruendung
- [Auth-Konzept](./docs/auth-concept.md) — Login, Sessions, Schutzlogik
- [Manueller Abnahmetest](./docs/testing/manual-acceptance-test.md) — Test-Checkliste fuer UC1–UC6
- [Algorithmus-Konzept](./docs/Algorithmus/) — Formel, Phasen und Ausgabeformat der Lernplanung
- [Mockups & offene Punkte](./docs/mockups.md) — was echt funktioniert und was Vorschau ist
- [Uebergabedokumentation](./docs/handover.md) — Einstieg fuer Weiterbetrieb und -entwicklung (in Vorbereitung)
