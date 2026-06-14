# Lernplan-Umsetzung – Verwaltung + Algorithmus → Kalender

> **Stand:** 10.06.2026
> **Branch:** `lernplan`
> **Ziel:** Die `/study-plan`-Seite vom reinen Rechner zu einer **vollständigen Lernplan-Verwaltung**
> ausbauen (Übersicht, Detail, CRUD, Aufgaben – gemäß [study-plan-redesign.md](study-plan-redesign.md))
> **und** aus dem Algorithmus konkrete Lerneinheiten erzeugen, die als Termine **in den Kalender** eingetragen
> werden (feste Uhrzeit-Slots, im Kalender frei verschiebbar).

Dieses Dokument ist die Arbeits-Checkliste. Wir arbeiten die Schritte in Abschnitt **9** der Reihe nach ab.
Die **Entscheidungen** in Abschnitt **8** sind bereits geklärt (siehe dort).

---

## 1. Ziel in einem Satz

Der Nutzer legt einen **Lernplan an** (wird gespeichert, erscheint in der Übersicht, hat eine Detailseite) →
der Algorithmus berechnet den Aufwand → ein **Scheduler** verteilt diesen Aufwand auf konkrete
**2-Stunden-Lerneinheiten** über die verbleibenden Tage → der Nutzer prüft die Vorschau → mit einem Klick
werden die Einheiten als **Kalender-Termine** (Typ „Lernsession") gespeichert und sind dort frei verschiebbar.

---

## 2. Ist-Zustand (was schon da ist)

| Baustein | Datei | Status |
|----------|-------|--------|
| Berechnungs-Algorithmus | [src/lib/calculations/studyPlanAlgorithm.ts](../src/lib/calculations/studyPlanAlgorithm.ts) | ✅ fertig: Faktoren, Gesamtstunden, Stunden/Tag, Plantyp, Phasen |
| Eingabe-/Ergebnis-UI | [src/components/study-plan/StudyPlanPageContent.tsx](../src/components/study-plan/StudyPlanPageContent.tsx) | ✅ reiner Rechner (kein Speichern, kein Tagesplan) |
| DB-Modelle | [prisma/schema.prisma](../prisma/schema.prisma) | ✅ `StudyPlan`, `Task`, `CalendarEvent` (mit `studyPlanId` + `taskId`-Link) |
| Kalender-Events-API | [src/app/api/calendar/events/route.ts](../src/app/api/calendar/events/route.ts) | ✅ GET/POST lokale Events (Typ `LERNEINHEIT` = „Lernsession") |
| Konfliktprüfung DHBW | [src/components/calendar/events.ts](../src/components/calendar/events.ts) | ✅ `overlapsAnyDhbwEvent()` |
| Konzept-Doku | `docs/Algorithmus/*` + [docs/study-plan-redesign.md](study-plan-redesign.md) | ✅ Phasen, Plantypen, Ausgabeformat, Constraints |

### Wichtige bereits definierte Regeln (aus der Konzept-Doku)

- **Formel:** `Gesamtstunden = 25 × D × ((S + W + V + C) / 4)`
- **Plantyp:** `Stunden/Tag ≤ 2` → *normal*, sonst *kritisch*. Im kritischen Plan werden maximal
  zwei 2-h-Einheiten desselben Fachs pro Tag geplant; an freien Tagen bleiben insgesamt bis zu
  drei Einheiten aus mindestens zwei Fächern möglich.
- **Phasen normal:** Grundlagen 40 %, Vertiefung 35 %, Anwendung 15 %, Wiederholung 10 %.
- **Phasen kritisch:** Priorisierung 10 %, Kernstoff 50 %, Aufgaben 30 %, Wiederholung 10 %.
- **Scheduling-Constraints** ([study-plan-redesign.md §5](study-plan-redesign.md)):
  - Orientierung: häufig **3–4 Lerneinheiten pro Woche**, bei geringem Aufwand auch 1–2
  - Maximum: **5 Lerneinheiten pro Woche**
  - Dauer: **2 h pro Einheit**

---

## 3. Die Lücke (was fehlt)

1. **Tagesplan/Scheduler:** Der Algorithmus liefert nur Summen (Gesamtstunden + Phasen-Stunden).
   Es fehlt die Umrechnung in **konkrete, datierte 2-h-Einheiten** mit zugeordneter Phase und Aufgaben.
2. **Kalender-Eintrag:** Es gibt keinen Weg, die Einheiten als Termine zu speichern.
3. **Persistenz des Plans:** Der Plan selbst (`StudyPlan`) wird nirgends gespeichert; es gibt keine
   Study-Plan-API (nur `.gitkeep`).
4. **Verknüpfung:** `CalendarEvent.studyPlanId` wird vom POST-Endpoint noch nicht entgegengenommen.

---

## 4. End-to-End-Flow (Zielbild)

```
1. Nutzer öffnet /study-plan und füllt das Klausur-Formular aus
   (Fach, Deadline, Schwierigkeit, Vorwissen, Seiten, ECTS)
        │
2. calculateStudyPlan(input)  →  AlgorithmResult (Stunden + Phasen)   [vorhanden]
        │
3. scheduleStudyPlan(result, optionen, bestehendeEvents)             [NEU – Kernstück]
        │     → Liste konkreter Sessions:
        │       { datum, start, ende (+2h), phase, aufgaben[] }
        │
4. Vorschau anzeigen: Wochenübersicht + Liste der Einheiten           [NEU – UI]
   (Nutzer kann Plan akzeptieren / verwerfen)
        │
5. „In Kalender übernehmen" → StudyPlan speichern + pro Session
   ein CalendarEvent (Typ Lernsession, studyPlanId-Link)              [NEU – API]
        │
6. Termine erscheinen im Kalender und sind dort normal editierbar
```

---

## 5. Architektur-Entscheidungen (Vorschlag)

Im Einklang mit `CLAUDE.md` (kleine inkrementelle Schritte, keine neuen globalen Systeme, keine neuen Dependencies):

- **Scheduler als reine Funktion** in `src/lib/study-plan/scheduler.ts` – ohne Seiteneffekte,
  damit gut testbar und deterministisch (gleiche Eingabe → gleicher Plan, wie in `Ausgabeformat.md` gefordert).
- **Sessions = CalendarEvents** (kein Umweg über `Task`-Modell für den MVP).
  Jede Lerneinheit ist direkt ein `CalendarEvent` mit `source = LOCAL`, `type = LERNEINHEIT`,
  `studyPlanId` gesetzt und konkreten Aufgaben im bereits vorhandenen `tasks`-Feld.
  → Damit landen die „Stunden im Kalender" mit minimalem neuen Code.
- **Konfliktprüfung wiederverwenden:** `overlapsAnyDhbwEvent()` bzw. eine erweiterte Variante,
  die auch bestehende lokale Lernsessions berücksichtigt (keine Doppelbelegung).
- **Konstanten** (Slot-Dauer, Sessions/Woche) zentral im Scheduler, abgeleitet aus der Konzept-Doku.

> **Begriffsabgrenzung (wichtig):**
> - **Aufgabe (`Task`)** = manuelle To-do am Lernplan, die der Nutzer in der Detailseite verwaltet
>   (Titel, Fälligkeit, Status, abhakbar). → Redesign-Doc §4.5.
> - **Lerneinheit (`ScheduledSession` → `CalendarEvent`)** = vom Algorithmus erzeugter, datierter
>   2-h-Lernblock, der im **Kalender** landet.
>
> Beides existiert nebeneinander: Tasks sind die Checkliste, Sessions sind die Termine.

---

## 6. Der Scheduler – Kernstück (Detail-Logik)

Datei: `src/lib/study-plan/scheduler.ts`

### Eingaben
- `result: AlgorithmResult` (Gesamtstunden, Phasen, Tage bis Deadline, Plantyp)
- `startDate` (heute), `deadline`
- `existingEvents: CalEvent[]` (zum Vermeiden von Kollisionen)
- `options` (siehe offene Entscheidungen): bevorzugte Wochentage, bevorzugtes Zeitfenster

### Konstanten
```ts
const SLOT_HOURS = 2;                // Dauer einer Lerneinheit
const MAX_SESSIONS_PER_WEEK = 5;     // hartes Limit
const MAX_SESSIONS_PER_SUBJECT_PER_DAY = 2; // höchstens 4 h desselben Fachs
const MAX_SESSIONS_PER_DAY_FREE = 3; // global höchstens 6 h an freien Tagen
const LATEST_END_HOUR = 21;          // keine Einheit endet nach 21 Uhr (schlaffreundlich)
const SESSION_GAP_MIN = 30;          // Mindestpause zwischen zwei Blöcken am selben Tag
```

### Schritt-Logik
1. **Anzahl Einheiten:** `sessionsNeeded = ceil(totalHours / SLOT_HOURS)`.
2. **Kapazität prüfen:**
   `weeks = max(1, ceil(daysUntilDeadline / 7))`, `capacity = weeks × MAX_SESSIONS_PER_WEEK`.
   Wenn `sessionsNeeded > capacity` → **Warnung „Überlastung"** und auf `capacity` deckeln
   (im kritischen Plan erwartbar – passt zur Konzept-Doku).
3. **Einheiten pro Woche:** `perWeek = min(MAX, max(1, ceil(sessionsNeeded / weeks)))`.
   3–4 Einheiten sind ein Orientierungsbereich, aber kein künstliches Minimum.
4. **Phasen → Einheiten:** Pro Phase `sessions_phase = round(phase.hours / totalHours × sessionsNeeded)`.
   Phasen werden **chronologisch** zugewiesen (erst Grundlagen-Einheiten, dann Vertiefung, …),
   damit die Lernlogik (verstehen → vertiefen → anwenden → wiederholen) erhalten bleibt.
5. **Tage wählen:** Pro Woche `perWeek` Tage möglichst **gleichmäßig verteilt** aus den erlaubten
   Wochentagen (z. B. Mo/Mi/Fr/Sa) – nicht alle Einheiten hintereinander.
6. **Zeit-Slot finden:** Für jeden gewählten Tag den **ersten freien 2-h-Block** im Tagesfenster
   (`DAY_START_HOUR`–`DAY_END_HOUR` aus `events.ts`) suchen, beginnend beim bevorzugten Startzeitpunkt,
   der **nicht** mit bestehenden Terminen (DHBW + eigene) kollidiert. Findet sich keiner → Tag überspringen.
7. **Ausgabe:** `ScheduledSession[]` mit `date, start, end, phaseName, tasks[]`.
   Aufgaben pro Session aus einem **Phasen-Template** (kurze, konkrete To-dos – siehe `Ausgabeformat.md`).

### Ausgabe-Typ (Vorschlag)
```ts
interface ScheduledSession {
  date: Date;
  start: Date;       // konkreter Beginn
  end: Date;         // start + 2h
  phaseName: string; // z.B. "Grundlagen aufbauen"
  tasks: string[];   // konkrete To-dos für diese Einheit
}
interface ScheduleResult {
  sessions: ScheduledSession[];
  warnings: string[];   // z.B. Überlastung
}
```

---

## 7. Datenmodell – Anpassungen

Die Modelle `StudyPlan`, `Task`, `CalendarEvent` existieren bereits. Nötig sind zwei kleine, **additive**
Erweiterungen (optionale Felder → risikoarme Migration):

**7.1 `StudyPlan` um Algorithmus-Felder erweitern** (Entscheidung 8.5 = ja), damit Eingaben/Ergebnis
gespeichert und auf der Detailseite angezeigt + neu berechnet werden können:

```prisma
model StudyPlan {
  // ... bestehende Felder ...
  // Algorithmus-Eingaben (optional, nur wenn berechnet):
  difficulty     Int?     // 1–5
  priorKnowledge Int?     // 1–5
  pages          Int?
  credits        Int?
  // Algorithmus-Ergebnis (optional, abgeleitet):
  totalHours     Float?
  hoursPerDay    Float?
  planType       String?  // "normal" | "kritisch"
}
```

**7.2 POST `/api/calendar/events`** muss optional `studyPlanId` akzeptieren und speichern
*(`tasks` wird bereits unterstützt; `studyPlanId` fehlt noch).*

**7.3 Löschverhalten:** Beim Löschen eines `StudyPlan` bleiben die Kalender-Events erhalten und verlieren
nur die Verknüpfung – `onDelete: SetNull` ist im Schema bereits so definiert.

---

## 8. Entscheidungen (geklärt)

| # | Frage | Entscheidung |
|---|-------|--------------|
| 8.1 | **Wochentage** für Lerneinheiten? | Mo–Sa, Sonntag frei (im Code anpassbar) |
| 8.2 | **Zeitfenster** der Slots? | **Feste Uhrzeit-Slots** (bevorzugt 16:00–18:00, sonst erster freier 2-h-Block am Tag). Termine sind im Kalender per Drag&Drop **frei verschiebbar**. |
| 8.3 | **Persistenz-Trigger**? | Erst **Vorschau**, dann Button „In Kalender übernehmen" |
| 8.4 | **Mehrere Klausuren gleichzeitig**? | MVP: nur gegen bestehende Kalender-Events prüfen; Mehrplan-Optimierung später |
| 8.5 | **Algorithmus-Werte am `StudyPlan` speichern**? | **Ja** – Eingaben + Ergebnis als optionale Felder (kleine Migration, §7.1) |
| 8.6 | **Scope dieses Branches**? | **Volle Verwaltung** (Übersicht + Detail + CRUD + Aufgaben aus `study-plan-redesign.md`) **plus** Scheduler → Kalender |

---

## 9. Step-by-Step Umsetzung (Arbeits-Checkliste)

Reihenfolge: erst Daten/Persistenz (A+B), dann Verwaltungs-UI (C+D), dann Scheduler+Kalender (E+F), dann Abschluss (G).
Nach jeder Phase soll `npm run build` grün sein.

### Phase A – Schema & Migration
- [x] **A1** `StudyPlan` um Algorithmus-Felder erweitern (§7.1: difficulty, priorKnowledge, pages, credits, totalHours, hoursPerDay, planType).
- [x] **A2** Migration erstellen (`npm run prisma:migrate`) + `prisma generate`.

### Phase B – StudyPlan-API (CRUD)
- [x] **B1** `GET /api/study-plan` – alle Lernpläne des eingeloggten Users (inkl. Task-Zähler für Fortschritt).
- [x] **B2** `POST /api/study-plan` – Lernplan anlegen (Algorithmus serverseitig berechnen + Felder speichern).
- [x] **B3** `GET /api/study-plan/[id]` – ein Plan inkl. Tasks.
- [x] **B4** `PATCH /api/study-plan/[id]` – bearbeiten (bei geänderten Eingaben Ergebnis neu berechnen).
- [x] **B5** `DELETE /api/study-plan/[id]` – löschen (Tasks via Cascade; Kalender-Events bleiben, Link → null).
- [x] **B6** Aufgaben-API: `POST /api/study-plan/[id]/tasks`, `PATCH .../tasks/[taskId]`, `DELETE .../tasks/[taskId]`.
- [x] **B7** Server-State-Hook `src/lib/study-plan/useStudyPlans.ts` (Fetch ohne React Query, gemäß `CLAUDE.md`).

### Phase C – Übersichtsseite (`/study-plan`)
- [x] **C1** `StudyPlanOverview.tsx` – Header „Meine Lernpläne" + Button „+ Neuer Lernplan" + Karten-Grid + Leerzustand.
- [x] **C2** `StudyPlanCard.tsx` – Titel, Fach, Zieldatum, Zieltyp-Badge, Fortschrittsbalken, nächste Aufgabe, „noch X Tage".
- [x] **C3** `StudyPlanForm.tsx` – Modal zum Anlegen/Bearbeiten (Pflichtfelder + Algorithmus-Eingaben, Redesign §5).
- [x] **C4** Karte: Klick → Detailseite; 3-Punkte-Menü → Bearbeiten/Löschen (mit Bestätigung).

### Phase D – Detailseite (`/study-plan/[id]`)
- [x] **D1** Route `src/app/(app)/study-plan/[id]/page.tsx` + `StudyPlanDetail.tsx` (Header, Zurück-Link, Bearbeiten).
- [x] **D2** Fortschritts-Widget (erledigte/gesamt Tasks).
- [x] **D3** `AlgorithmResultWidget.tsx` – gespeichertes Ergebnis (Gesamtstunden, Std/Tag, Plantyp) + „Neu berechnen".
- [x] **D4** `TaskList.tsx` / `TaskItem.tsx` / `TaskForm.tsx` – Aufgaben anzeigen, abhaken, anlegen, bearbeiten, löschen.

### Phase E – Scheduler (Logik, reine Funktion)
- [x] **E1** `src/lib/study-plan/scheduler.ts`: Typen `ScheduledSession`, `ScheduleResult`, `ScheduleOptions`.
- [x] **E2** Phasen-Templates (konkrete Aufgaben je Phase, normal + kritisch) als Konstanten.
- [x] **E3** `scheduleStudyPlan(result, options, existingEvents)` implementieren (Logik aus §6).
- [x] **E4** Konfliktprüfung gegen bestehende Events (DHBW + eigene Lernsessions); feste Slots, Sonntag frei.
- [x] **E5** Warnungen (Überlastung, kein freier Slot) zurückgeben.

### Phase F – Kalender-Anbindung
- [x] **F1** `POST /api/calendar/events` um `studyPlanId` erweitern (annehmen + speichern + zurückgeben).
- [x] **F2** In der Detailseite: Button „Lernplan in Kalender eintragen" → bestehende Events laden
  (`useExternalEvents` + lokale Events) → `scheduleStudyPlan(...)` → **Vorschau** (Wochenübersicht + Liste).
- [x] **F3** Warnungen sichtbar machen; Button **„In Kalender übernehmen"** → Sessions als Events speichern (mit `studyPlanId`).
- [x] **F4** Termine sind danach im Kalender sichtbar, editierbar und **per Drag&Drop verschiebbar** (bereits vorhanden).

### Phase G – Abschluss
- [x] **G1** `npm run build` grün (Lint + Typecheck).
- [x] **G2** Manueller Durchlauf: Plan anlegen → Detail → berechnen → Vorschau → eintragen → im Kalender prüfen.
- [x] **G3** Doku/PRD kurz aktualisieren, PR erstellen.

---

## 10. Definition von „schönes Ergebnis" (Akzeptanzkriterien)

- Aus den Klausurdaten entstehen **konkrete, datierte 2-h-Lerneinheiten**, nicht nur Summen.
- Die Einheiten werden aufwandsabhängig gleichmäßig verteilt und respektieren **max. 5 pro Woche**.
  Häufig entstehen 3–4 Einheiten, bei geringem Aufwand sind auch 1–2 korrekt. Sie kollidieren **nicht** mit DHBW-Vorlesungen
  oder bereits geplanten Lernsessions.
- Pro Fach werden maximal **2 × 2 h pro Tag** geplant; an freien Tagen sind fachübergreifend weiterhin
  maximal **3 × 2 h** möglich.
- Bei drei aufeinanderfolgenden Tagen mit jeweils zwei Einheiten desselben Fachs erscheint eine
  kritische Empfehlung für einen Fach- oder Pausentag.
- Die Phasen sind **chronologisch sinnvoll** verteilt (Grundlagen früh, Wiederholung spät).
- Jede Einheit hat **konkrete Aufgaben** (im `tasks`-Feld des Termins sichtbar).
- Mit **einem Klick** landen alle Einheiten im Kalender und sind dort normal bearbeitbar/löschbar.
- Bei zu wenig Zeit erscheint eine **klare Warnung** statt eines unrealistischen Plans.

---

## 11. Bezug zu bestehenden Dokumenten

- Berechnungslogik & Faktoren: `docs/Algorithmus/Algorithmus_neue_Formel.md`
- Phasen & Plantypen: `docs/Algorithmus/Konzept normaler Lernplan.md`, `Konzept kritischer Lernplan.md`
- Ausgabestruktur (Tagesplan/JSON): `docs/Algorithmus/Ausgabeformat.md`
- Constraints & spätere Verwaltung: `docs/study-plan-redesign.md`
</content>
</invoke>
