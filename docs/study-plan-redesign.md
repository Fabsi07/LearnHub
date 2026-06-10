# Lernplan-Seite – Redesign Spezifikation

> **Stand:** 09.06.2026  
> **Bezug:** Issues #44 (D1), #45 (D2), #46 (D3)  
> **Ziel:** Die Lernplan-Seite von einem reinen Algorithmus-Rechner zu einer vollständigen Lernplan-Verwaltung umbauen.

---

## 1. Aktueller Zustand

Die Seite `/study-plan` zeigt aktuell nur ein **Eingabe-Formular für den Algorithmus** (Klausurdatum, Schwierigkeit, Vorwissen, Seiten, ECTS) und die berechneten Ergebnisse. Es gibt:

- ❌ Keine Übersicht über angelegte Lernpläne
- ❌ Keine Möglichkeit, Lernpläne zu speichern
- ❌ Keine Detailansicht
- ❌ Keine Aufgabenverwaltung

---

## 2. Zielzustand – Seitenstruktur

Die Lernplan-Seite wird in **zwei Views** aufgeteilt:

```
/study-plan          → Übersicht aller Lernpläne (Liste/Karten)
/study-plan/[id]     → Detailansicht eines Lernplans
```

---

## 3. View 1: Lernplan-Übersicht (`/study-plan`)

### 3.1 Layout

- **Header:** Titel „Meine Lernpläne" + Button „+ Neuer Lernplan" (oben rechts)
- **Karten-Grid:** Alle Lernpläne des eingeloggten Nutzers als Karten (2–3 Spalten auf Desktop, 1 Spalte auf Mobile)
- **Leerer Zustand:** Wenn keine Lernpläne vorhanden → Illustration + Text + CTA-Button zum Anlegen

### 3.2 Lernplan-Karte (Pflichtfelder)

Jede Karte zeigt **mindestens**:

| Feld | Beschreibung | Quelle (DB) |
|------|-------------|-------------|
| **Titel** | Name des Lernplans | `StudyPlan.title` |
| **Veranstaltung / Fach** | z.B. „Mathematik 2" | `StudyPlan.subject` |
| **Zieldatum** | Datum der Klausur/Abgabe, formatiert als `DD.MM.YYYY` | `StudyPlan.targetDate` |
| **Zieltyp-Badge** | Pill mit Icon: KLAUSUR / ABGABE / PRÄSENTATION / etc. | `StudyPlan.goalType` |
| **Fortschrittsbalken** | % erledigter Aufgaben (erledigte Tasks / gesamt Tasks) | berechnet aus `Task.completed` |
| **Nächste Aufgabe** | Titel der nächsten offenen Aufgabe nach Fälligkeit | früheste `Task` mit `completed=false` |
| **Tage verbleibend** | „noch X Tage" oder „überfällig" in Rot | berechnet aus `targetDate` |

### 3.3 Karten-Interaktion

- Klick auf Karte → navigiert zu `/study-plan/[id]`
- Hover-Effekt (leichte Elevation/Shadow)
- Kontextmenü (3-Punkte-Menü) auf der Karte mit: **Bearbeiten** / **Löschen**

### 3.4 Sortierung & Filterung (Nice-to-have)

- Standard-Sortierung: nach `targetDate` aufsteigend (nächste Klausur zuerst)
- Optional: Filter nach Zieltyp (KLAUSUR, ABGABE, …)

---

## 4. View 2: Lernplan-Detailansicht (`/study-plan/[id]`)

### 4.1 Layout

```
┌─────────────────────────────────────────────────┐
│  ← Zurück zur Übersicht          [Bearbeiten]   │
├─────────────────────────────────────────────────┤
│  MATHEMATIK 2          [KLAUSUR-Badge]          │
│  Klausur – 15.07.2026  noch 36 Tage             │
│  Beschreibung (optional)                        │
├──────────────────┬──────────────────────────────┤
│  Fortschritt     │  Algorithmus-Ergebnis        │
│  ████░░░░  40%   │  42 h gesamt / 1.2 h/Tag     │
│  4 / 10 erledigt │  [Normaler Lernplan]         │
├──────────────────┴──────────────────────────────┤
│  Aufgaben                        [+ Aufgabe]    │
│  ─────────────────────────────────────────────  │
│  ☑ Vorlesungsfolien durcharbeiten   12.06       │
│  ☐ Übungsblatt 1 lösen              15.06       │
│  ☐ Zusammenfassung erstellen        20.06       │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

### 4.2 Lernplan-Header (Pflichtfelder)

| Feld | Anzeige |
|------|---------|
| Titel | Große Überschrift (H1) |
| Fach/Veranstaltung | Subtitel grau |
| Zieltyp | Farbiger Badge (z.B. Rot = KLAUSUR) |
| Zieldatum | `DD.MM.YYYY` + „noch X Tage" / „überfällig" |
| Beschreibung | Optional, grauer Text |

### 4.3 Fortschritts-Widget

- Horizontaler Fortschrittsbalken (erledigte / gesamt Tasks in %)
- Kennzahlen: „X von Y Aufgaben erledigt"

### 4.4 Algorithmus-Ergebnis-Widget (read-only)

- Wird beim Erstellen/Bearbeiten des Lernplans berechnet und **gespeichert**
- Zeigt: Gesamtstunden, Stunden/Tag, Plantyp (normal/kritisch)
- Button „Neu berechnen" falls sich Eingaben geändert haben

### 4.5 Aufgabenliste

Jede Aufgabe hat:

| Feld | Typ | Pflicht |
|------|-----|---------|
| Titel | Text | ✅ |
| Fälligkeitsdatum | Date | ✅ |
| Geschätzter Aufwand | Minuten (UI: Stunden + Minuten) | ✅ |
| Schwierigkeit | 1–5 | ✅ |
| Beschreibung | Textarea | ❌ |
| Status (erledigt) | Checkbox | — |

**Interaktionen:**
- Checkbox zum Abhaken (PATCH `completed = true`)
- Inline-Edit oder Modal zum Bearbeiten
- Löschen (mit Bestätigungs-Dialog)
- Drag & Drop Reihenfolge (Nice-to-have)

---

## 5. Modal: Lernplan anlegen / bearbeiten

Ein **Modal oder Slide-Over** öffnet sich bei „+ Neuer Lernplan" / „Bearbeiten":

### Pflichtfelder im Formular

| Feld | Typ | Validierung |
|------|-----|------------|
| Titel | Text-Input | min. 1 Zeichen, max. 100 |
| Veranstaltung / Fach | Text-Input | min. 1 Zeichen, max. 100 |
| Zieltyp | Select (GoalType Enum) | Pflicht |
| Zieldatum | Date-Picker | muss in der Zukunft liegen |
| Beschreibung | Textarea | optional, max. 500 Zeichen |

### Algorithmus-Eingaben (optional, für automatische Berechnung)

| Feld | Typ | Default |
|------|-----|---------|
| Schwierigkeit | Select 1–5 | 3 |
| Vorwissen | Select 1–5 | 3 |
| Anzahl Seiten | Number | — |
| ECTS-Punkte | Number (1–10) | — |

> Wenn Seiten und ECTS angegeben → Algorithmus wird direkt beim Speichern berechnet und das Ergebnis gespeichert.

### Scheduling-Constraints (Lerneinheiten pro Woche)

| Constraint | Wert |
|------------|------|
| **Ziel-Häufigkeit** | 3–4 Lerneinheiten pro Woche je Thema |
| **Maximale Häufigkeit** | max. 5 Lerneinheiten pro Woche je Thema |
| **Einheitsdauer** | 2 h pro Timeslot |

> Der Algorithmus verteilt die berechnete Gesamtstundenzahl so, dass pro Thema **bevorzugt 3–4 Lerneinheiten à 2 h pro Woche** eingeplant werden. Mehr als **5 Lerneinheiten pro Woche** sind nicht zulässig, um Überlastung zu vermeiden.

---

## 6. API-Routen (zu implementieren)

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| `GET` | `/api/study-plan` | Alle Lernpläne des eingeloggten Users |
| `POST` | `/api/study-plan` | Neuen Lernplan anlegen |
| `GET` | `/api/study-plan/[id]` | Einzelnen Lernplan mit Tasks laden |
| `PATCH` | `/api/study-plan/[id]` | Lernplan bearbeiten |
| `DELETE` | `/api/study-plan/[id]` | Lernplan löschen |
| `POST` | `/api/study-plan/[id]/tasks` | Aufgabe anlegen |
| `PATCH` | `/api/study-plan/[id]/tasks/[taskId]` | Aufgabe bearbeiten / abhaken |
| `DELETE` | `/api/study-plan/[id]/tasks/[taskId]` | Aufgabe löschen |

---

## 7. Datenbankmodell (bereits vorhanden)

Das Prisma-Schema hat bereits alle nötigen Felder:

```prisma
model StudyPlan {
  id          String    // cuid
  title       String    // Pflicht
  subject     String    // Veranstaltung/Fach – Pflicht
  description String?   // optional
  goalType    GoalType  // KLAUSUR | ABGABE | PRAESENTATION | ...
  targetDate  DateTime  // Zieldatum – Pflicht
  ownerId     String    // Verknüpfung mit User
  tasks       Task[]
}

model Task {
  id               String
  title            String
  description      String?
  estimatedMinutes Int
  difficulty       Int       // 1–5
  dueDate          DateTime
  completed        Boolean
  completedAt      DateTime?
  studyPlanId      String
}
```

> ✅ Kein Schema-Änderungsbedarf – nur API + UI fehlen noch.

---

## 8. Komponenten-Übersicht (neu zu erstellen)

```
src/components/study-plan/
├── StudyPlanOverview.tsx        # Übersicht mit Karten-Grid
├── StudyPlanCard.tsx            # Einzelne Karte in der Übersicht
├── StudyPlanDetail.tsx          # Detailansicht
├── StudyPlanForm.tsx            # Modal-Formular (anlegen/bearbeiten)
├── TaskList.tsx                 # Aufgabenliste in der Detailansicht
├── TaskItem.tsx                 # Einzelne Aufgabe (Checkbox + Felder)
├── TaskForm.tsx                 # Modal/Inline-Form für Aufgaben
└── AlgorithmResultWidget.tsx    # Kompaktes Widget mit Algorithmus-Ergebnis

src/app/(app)/study-plan/
├── page.tsx                     # Übersicht (StudyPlanOverview)
└── [id]/
    └── page.tsx                 # Detailansicht (StudyPlanDetail)
```

---

## 9. Implementierungs-Reihenfolge

1. **API-Routen** für StudyPlan CRUD (`/api/study-plan`)
2. **Übersichtsseite** mit leeren Zustand und Karten-Grid
3. **Formular-Modal** zum Anlegen
4. **Detailansicht** mit Header und Fortschritt
5. **Aufgaben-API** + Aufgabenliste in Detailansicht
6. **Algorithmus-Widget** in Detailansicht integrieren
7. **Bearbeiten & Löschen** für Plan und Aufgaben

---

## 10. Bezug zu bestehenden Issues

| Issue | Titel | Abgedeckt durch |
|-------|-------|----------------|
| #44 D1 | Lernplan-Übersicht erstellen | Abschnitte 3, 8, 9 |
| #45 D2 | Lernplan anlegen, bearbeiten, löschen | Abschnitte 5, 6, 9 |
| #46 D3 | Aufgaben verwalten | Abschnitt 4.5, 6, 8 |
| #39 G2 | Algorithmus als TS-Funktion | Bereits umgesetzt ✅ |
| #51 G3 | Algorithmus in Flow integrieren | Abschnitt 4.4, 5 |
