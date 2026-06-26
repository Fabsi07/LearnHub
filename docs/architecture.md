# Architekturüberblick — LearnHub

| Feld       | Inhalt                                                            |
| ---------- | ----------------------------------------------------------------- |
| **Zweck**  | Kompakter technischer Überblick für Abgabe, Übergabe und Review   |
| **Stand**  | 25.06.2026 (Meilenstein 3)                                        |
| **Bezug**  | Ergänzt [CLAUDE.md](../CLAUDE.md) und [docs/tech-stack.md](./tech-stack.md) |

---

## 1. Überblick in einem Satz

LearnHub ist eine Next.js-15-Anwendung (App Router) mit React 18 und TypeScript,
die über Prisma auf eine PostgreSQL-Datenbank zugreift. Der fachliche Kern ist
eine deterministische, serverseitige Lernplanungslogik. Die Anwendung läuft im
Projektkontext lokal (Datenbank via Docker).

---

## 2. Schichten

```txt
Browser
  │  (HTTP, lh_session-Cookie)
  ▼
Next.js App Router  ──────────────────────────────────────────────┐
  │                                                                │
  ├─ middleware.ts        Auth-Guard (Cookie-Prüfung, Redirects)   │
  │                                                                │
  ├─ app/(app)/*          Geschützte Seiten (Server Components)    │
  │     └─ DashboardShell → Sidebar / Topbar / Feature-Seiten      │
  │                                                                │
  ├─ app/login|register|forgot-password   Öffentliche Auth-Seiten  │
  ├─ app/impressum|datenschutz|nutzungsordnung   Rechtsseiten      │
  │                                                                │
  └─ app/api/*            Route Handler (NextResponse.json)        │
        │                                                          │
        ▼                                                          │
   lib/<feature>/         Logik, Validierung (zod), DTOs ──────────┘
        │
        ▼
   Prisma Client  ──►  PostgreSQL
```

Strukturprinzip (siehe CLAUDE.md §3–4): `app/` bleibt dünn, Render-/Interaktions-
logik liegt in `components/<feature>/`, Berechnungen und Datenzugriff in
`lib/<feature>/`. Wiederverwendbare UI in `components/ui/`, Layout in
`components/layout/`.

---

## 3. Request-Fluss (Beispiel: Lernplan-Detailseite)

1. Browser ruft `/study-plan/<id>` auf.
2. `middleware.ts` prüft das `lh_session`-Cookie. Fehlt es → Redirect auf
   `/login?redirect=…`.
3. Die Server Component lädt über `lib/auth/session` die Session und über Prisma
   den Lernplan — stets auf `ownerId`/`userId` der angemeldeten Person begrenzt.
4. Interaktive Teile (Aufgaben abhaken, Umplanung) sind kleine Client-Komponenten,
   die `app/api/study-plan/[id]/...`-Route-Handler aufrufen.
5. Route Handler validieren (zod), schreiben über Prisma und antworten mit
   `NextResponse.json()`.

---

## 4. Datenmodell (Prisma)

Zentrale Modelle in [prisma/schema.prisma](../prisma/schema.prisma):

- **User / Session** — Auth; Session-`id` ist der opake Token im Cookie.
- **StudyPlan** — Lernplan inkl. Algorithmus-Eingaben (difficulty, priorKnowledge,
  pages, credits) und -Ergebnis (totalHours, hoursPerDay, planType).
- **Task** — Aufgabe eines Lernplans; optionale 1:1-Verknüpfung zu einem
  `CalendarEvent` (Should-Have S1).
- **CalendarEvent** — Termine (LOCAL/EXTERNAL), farbcodiert nach Typ.
- **CalendarSource** — externe Kalenderquellen (z. B. DHBW-ICS).
- **Notification / NotificationSettings** — Benachrichtigungen und persistente
  Präferenzen.
- **Feedback** — eingereichtes Nutzer-Feedback.

**Wichtige Löschregeln:** Lernplan-Löschung kaskadiert auf Tasks und generierte
Lerneinheiten; Task-Löschung trennt nur die Verknüpfung zum Kalendertermin
(`SetNull`). Details siehe Schema-Kommentare und PRD §8.1.

---

## 5. API-Oberfläche

Alle Route Handler liegen unter `src/app/api/<resource>/route.ts` und antworten
über `NextResponse.json()`:

| Bereich        | Routen (Auszug)                                                        |
| -------------- | ---------------------------------------------------------------------- |
| Auth           | `/api/auth/login`, `/register`, `/logout`                              |
| Profil         | `/api/profile`, `/api/profile/avatar`                                  |
| Lernpläne      | `/api/study-plan`, `/[id]`, `/[id]/replan`, `/[id]/tasks`, `/[id]/tasks/[taskId]` |
| Kalender       | `/api/calendar/events`, `/[id]`, `/external`, `/sources`              |
| Benachrichtig. | `/api/notifications`, `/[id]`, `/check`, `/api/settings/notifications` |
| Feedback       | `/api/feedback`, `/[id]`                                               |
| Admin          | `/api/admin/users`, `/[id]`                                            |

---

## 6. Authentifizierung & Autorisierung

Eigene E-Mail/Passwort-Auth (bcrypt) mit DB-Sessions per HTTP-Only-Cookie
(`lh_session`, `SameSite=Lax`). Konzept: [docs/auth-concept.md](./auth-concept.md).

- `middleware.ts` prüft nur die **Cookie-Existenz** (Edge-Runtime ohne Prisma)
  und steuert Redirects/401 sowie Admin-/DEV-Rollen.
- Die echte Session-Validierung läuft in Server Components und Route Handlern
  über `getSession()`.
- Rollen: `USER`, `ADMIN`, `DEV` (Feedback-/Verwaltungszugriff).

---

## 7. Externe Integration

DHBW-Termine werden über `node-ical` serverseitig aus einem ICS-Feed gelesen
(`/api/calendar/external`). Da der externe Server instabil sein kann, gelten
Retry, Exponential Backoff, Timeout und ein In-Memory-Cache via `globalThis`
als Pflicht. Externe Events sind read-only.

---

## 8. Lernplanungslogik

Deterministischer Algorithmus in `src/lib/calculations/` und `src/lib/study-plan/`
(Formel-Konzept unter [docs/Algorithmus/](./Algorithmus/)). Gleiche Eingaben und
gleiches Bezugsdatum erzeugen dasselbe Ergebnis. Abgesichert durch Unit-Tests in
[tests/study-plan/](../tests/study-plan/).

---

## 9. Qualitätssicherung

- **Unit-Tests** (`node --test`): `tests/study-plan/` (Fälligkeiten,
  Planberechnung, Fortschritt, Aufgaben-Validierung).
- **Manueller Abnahmetest**: [docs/testing/manual-acceptance-test.md](./testing/manual-acceptance-test.md)
  für UC1–UC6.
- **Statische Prüfung**: `npm run typecheck` (TS strict) und `npm run lint`.
- Offen: automatisierte API-/E2E-Tests.

---

## 10. Betrieb (lokal)

Setup über [README.md](../README.md) / [SETUP.md](../SETUP.md): PostgreSQL via
`docker compose`, Migrationen via `prisma:deploy`, Client via `prisma:generate`,
Start via `npm run dev`. Ein produktives Hosting ist im MVP nicht vorgesehen
(PRD §9).
