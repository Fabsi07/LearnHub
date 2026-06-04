# CLAUDE.md – LearnHub

Kompakter Leitfaden für AI Coding Agents.
Diese Datei beschreibt die **tatsächliche** Architektur und bestehende Entscheidungen der Codebase – nicht hypothetische Zielzustände.

Bei Konflikt mit anderen AI-Kontextdateien gilt `CLAUDE.md`.

---

# 1. Product Philosophy

LearnHub ist eine produktivitätsorientierte Lernplattform für Studierende.

Die UX soll:

* klar
* ruhig
* strukturiert
* akademisch-professionell
* fokussiert

wirken.

Prioritäten:

* geringe kognitive Belastung
* schnelle Navigation
* klare Informationshierarchie
* Wiederverwendbarkeit
* einfache Wartbarkeit

Vermeiden:

* unnötige Animationen
* Social-Media-Patterns
* Notification-Spam
* aggressive Gamification
* visuelles Chaos
* unnötige technische Komplexität

---

# 2. Tech Stack

| Bereich       | Technologie                          |
| ------------- | ------------------------------------ |
| Framework     | Next.js 15 (App Router)              |
| Frontend      | React 18 + TypeScript 5 strict       |
| Styling       | Tailwind CSS v4                      |
| UI            | shadcn + `@base-ui/react`            |
| Icons         | `lucide-react` only                  |
| DB            | Prisma 6 (`prisma` CLI + `@prisma/client`) + PostgreSQL |
| Auth          | Noch nicht implementiert             |
| Utilities     | `clsx` + `tailwind-merge` via `cn()` |
| External APIs | `node-ical` für DHBW ICS Feed        |

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate
```

---

# 3. Architektur

Die App verwendet eine klassische Next.js App-Router-Struktur.

```txt
(app)/ layout.tsx
  └── DashboardShell
        ├── Sidebar
        ├── Topbar
        └── Feature Pages
```

Die `(app)` Route Group übernimmt automatisch das gesamte eingeloggte Layout.

## Wichtige Regel

Pages innerhalb von `(app)` dürfen **niemals erneut** `<DashboardShell>` rendern.

---

# 4. Folder Structure

```txt
src/
├── app/
│   ├── (app)/
│   ├── api/
│   ├── login/
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── calendar/
│   ├── dashboard/
│   ├── notifications/
│   ├── settings/
│   └── study-plan/
│
├── lib/
├── types/
└── middleware.ts
```

## Strukturregeln

* `app/` bleibt dünn
* Business-Logik liegt in `components/<feature>/`
* Wiederverwendbare UI → `components/ui/`
* Layout-Komponenten → `components/layout/`
* Kleine lokale Helfer bleiben feature-nah

---

# 5. Coding Conventions

## Naming

| Typ                  | Format           |
| -------------------- | ---------------- |
| Komponenten          | `PascalCase.tsx` |
| Utilities            | `camelCase.ts`   |
| Ordner               | `kebab-case`     |
| Next Pages/Layouts   | Default Export   |
| Sonstige Komponenten | Named Exports    |

---

## TypeScript

* Strict Mode aktiv
* Keine impliziten `any`
* `interface` für Props
* `type` für Domain-/Union-Types

---

## Imports

Reihenfolge:

1. React / Next
2. Externe Libraries
3. `@/components`
4. `@/lib`
5. Relative Imports

Immer `@/*` Alias verwenden.

Keine tiefen relativen Pfade (`../../../`).

---

# 6. Server vs Client Components

## Default: Server Component

`"use client"` nur wenn benötigt für:

* State
* Effects
* Browser APIs
* Event Handler
* `next/navigation` Hooks

Interaktivität möglichst in kleine Client-Children kapseln.

Große Pages bevorzugt serverseitig halten.

---

# 7. UI-Prinzipien

## Brand Colors

| Variable                  | Wert      |
| ------------------------- | --------- |
| `--color-brand-red`       | `#e20014` |
| `--color-brand-red-dark`  | `#b5000f` |
| `--color-brand-red-light` | `#ff3347` |

Neue Komponenten bevorzugt mit Tailwind-Utilities (`bg-brand-red`) statt Inline-Hexwerten.

---

## Styling-Regeln

* Tailwind first
* `cn()` für Class-Merging verwenden
* Inline-Styles nur bei dynamischen Werten
* `lucide-react` exklusiv für Icons
* Keine neuen globalen CSS-Dateien

---

## Dark Mode

Dark Mode wird über State gesteuert, nicht über `dark:` Klassen auf `<html>`.

---

# 8. Wiederverwendbarkeit

## Vor neuen Komponenten immer prüfen:

1. Existiert bereits eine ähnliche UI?
2. Kann bestehende Variante erweitert werden?
3. Kann bestehende Komponente reused werden?

Duplicate UI vermeiden.

---

## Komponenten-Regeln

| Zweck                | Ort                     |
| -------------------- | ----------------------- |
| Wiederverwendbare UI | `components/ui/`        |
| Layout               | `components/layout/`    |
| Feature-spezifisch   | `components/<feature>/` |

---

# 9. State Management

## Erlaubt

* `useState`
* `useReducer`
* Lift State Up

## Nicht verwenden

* Redux
* Zustand
* Jotai
* komplexe globale State-Systeme

## Server State

Custom Hooks in `src/lib/<feature>/use*.ts`

Kein React Query oder SWR.

---

# 10. API-Regeln

## Route Handlers

```txt
src/app/api/<resource>/route.ts
```

Responses immer über:

```ts
NextResponse.json()
```

---

## Externe APIs

Externe Systeme können instabil sein.

Deshalb:

* Retry Logic
* Exponential Backoff
* Timeout Handling
* server-side Fetching
* In-Memory Cache via `globalThis`

sind Pflicht.

---

# 11. Entwicklungsregeln

## Architektur

* Bestehende Architektur nicht unnötig refactoren
* Keine großflächigen Rewrites ohne explizite Anforderung
* Kleine inkrementelle Änderungen bevorzugen

---

## Datenbank

Prisma-Schema ist bewusst noch fast leer.

Wichtig:

* Keine Prisma-Models erfinden
* Keine speculative architecture
* DB-Ideen dokumentieren statt implementieren

---

## Kalender

* Keine Dummy-Events mehr
* Externe Events kommen ausschließlich über `/api/calendar/external`
* Read-only Events dürfen nicht editierbar sein
* All-Day-Events gehören ausschließlich in die AllDayBar

---

## Dependencies

Keine neuen Dependencies ohne klaren Nutzen.

Vor neuer Library prüfen:

1. Kann bestehende Lösung erweitert werden?
2. Reicht shadcn/base-ui bereits aus?

---

## Qualität

Vor jedem Commit:

```bash
npm run build
```

muss erfolgreich durchlaufen.

---

# 12. AI-Agent-Regeln

Vor jeder größeren Änderung:

1. Bestehende Architektur analysieren
2. Existierende Komponenten prüfen
3. Keine Duplikate erzeugen
4. Lösungen möglichst einfach halten
5. Keine unnötigen Abstraktionen hinzufügen

---

## AI soll vermeiden:

* unnötige Enterprise-Patterns
* premature optimization
* massive Refactors
* generische Abstraktionslayer
* neue globale Systeme
* Architektur-Umbauten ohne klaren Grund

---

# 13. Bekannte Baustellen

* Auth existiert noch nicht
* Prisma-Schema noch offen
* `src/types/` aktuell weitgehend leer
* DHBW OWA Server ist instabil
* Retry + Cache sind essenziell
* DB-bezogene TODOs landen in:

```txt
docs/kalender-db-todos.md
```
