# Manueller Abnahmetest — MVP-Flows

| Feld        | Inhalt                                                                    |
| ----------- | ------------------------------------------------------------------------- |
| **Bezug**   | Issue #40 (H2), PRD §7 (Use Cases UC1–UC6), PRD §14 (Abnahmekriterien)    |
| **Zweck**   | Reproduzierbarer manueller Abnahmetest vor Meilensteinen und Präsentation |
| **Geltung** | Verbindliche Testgrundlage für MVP-Abnahme                                |
| **Datei**   | `docs/testing/manual-acceptance-test.md`                                  |

---

## 1. Wie diese Datei zu benutzen ist

1. Vor jedem Durchlauf eine neue Zeile in der Durchlauf-Tabelle (§2) anlegen — mit Datum, Tester, Commit-Hash und Build-Status.
2. Die Checkliste in §4 (UC1–UC6) Schritt für Schritt abarbeiten. Pro Schritt die Checkbox abhaken **und** im Notes-Feld dokumentieren, wenn etwas vom erwarteten Ergebnis abweicht.
3. Jeden kritischen Fehler (Funktion bricht ab, Daten falsch, Sicherheitsproblem) als neues GitHub-Issue mit Label `bug` erfassen und die Issue-Nummer im Notes-Feld referenzieren.
4. Nach dem Durchlauf das Gesamtergebnis (`pass`, `pass with notes`, `fail`) in die Durchlauf-Tabelle eintragen.
5. Datei committen — die Historie der Durchläufe bleibt damit dauerhaft im Repo nachvollziehbar.

Ein Durchlauf gilt als bestanden, wenn UC1 bis UC6 ohne Funktionsabbruch durchlaufen und alle in §4 markierten „**erwartet**"-Punkte erfüllt sind.

---

## 2. Durchlauf-Historie

Eine Zeile pro Durchlauf. Älteste oben, neueste unten anhängen.

| Datum      | Tester | Commit / Build                | Ergebnis                            | Notizen / Issues                                 |
| ---------- | ------ | ----------------------------- | ----------------------------------- | ------------------------------------------------ |
| 18.06.2026 | Finn   | `<hash>` / `npm run build` ok | `pass` / `pass with notes` / `fail` | Auffälligkeiten, Issue-Nummern, Demo-Daten-Stand |

---

## 3. Vorbereitung des Tests

Vor jedem Durchlauf folgende Voraussetzungen prüfen:

- [ ] `git status` ist clean, aktueller Commit-Hash notiert.
- [ ] `npm ci` wurde auf dem aktuellen Lockfile-Stand erfolgreich ausgeführt.
- [ ] `npm run build` läuft ohne Fehler durch.
- [ ] `npm run typecheck`, `npm run lint` und `npm test` laufen ohne Fehler durch.
- [ ] Lokale PostgreSQL-Datenbank läuft, `DATABASE_URL` in `.env` gesetzt.
- [ ] `npm run prisma:deploy` und `npm run prisma:generate` wurden ausgeführt; Schema und Prisma Client sind aktuell.
- [ ] Testdaten vorbereitet: Entweder frischer Account ohne Daten für UC1 oder manuell angelegter Demo-Datenstand für UC2–UC6. Den verwendeten Datenstand in den Notizen vermerken.
- [ ] Browser: aktueller Chrome, Firefox **oder** Safari (laut PRD §8.2 Browser-Unterstützung).
- [ ] Browser-Cache und Cookies für `localhost:3000` gelöscht — sonst hängt UC1 an einer alten Session.
- [ ] `npm run dev` läuft auf `http://localhost:3000`.

---

## 4. Use-Case-Checklisten

Die folgenden sechs Abschnitte spiegeln UC1–UC6 aus dem PRD §7. Jeder Abschnitt enthält Vorbedingung, Schritte mit Eingabewerten, das erwartete Ergebnis und ein Feld für das tatsächliche Ergebnis pro Durchlauf.

> Hinweis: Die Checkliste beschreibt den aktuell implementierten MVP-Flow.
> Noch nicht vollständig angebundene Einstellungsfunktionen sind nicht Teil
> dieses Abnahmedurchlaufs.

---

### UC1 — Erstanmeldung

**Bezug:** PRD §7 UC1, Must-Have M1 + M2

**Vorbedingung**

- [ ] Es existiert kein Account mit der Test-E-Mail `acceptance+uc1@learnhub.test`.
- [ ] Browser im Inkognito-Modus oder mit gelöschtem `lh_session`-Cookie.

**Schritte**

1. [ ] `http://localhost:3000/` öffnen — Redirect auf `/login` (oder direkt zur Registrierung, falls so im UX-Flow vorgesehen).
2. [ ] Auf „Jetzt Registrieren" klicken.
3. [ ] Formular ausfüllen: E-Mail `acceptance+uc1@learnhub.test`, Anzeigename `UC1 Tester`, Passwort `Test12345` (mindestens 8 Zeichen laut Auth-Konzept §4).
4. [ ] Registrieren absenden.
5. [ ] Direkt nach erfolgreicher Registrierung das Dashboard betrachten.

**Erwartetes Ergebnis**

- Weiterleitung auf `/dashboard`.
- Dashboard zeigt `0` offene Aufgaben und aktive Lernpläne sowie einen Hinweis,
  den ersten Lernplan anzulegen.
- Cookie `lh_session` ist in den DevTools sichtbar, mit `HttpOnly` und `SameSite=Lax` (PRD §8.2 + Auth-Konzept).
- Eintrag in `User`-Tabelle existiert; `passwordHash` ist **nicht** das Klartextpasswort.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_

- -- Testdurchlauf 1 (Finn) 18.06. --
- [x] Weiterleitung auf `/dashboard`.
- [x] Dashboard zeigt `0` offene Aufgaben und aktive Lernpläne sowie einen Hinweis, den ersten Lernplan anzulegen.
- [x] Cookie `lh_session` ist in den DevTools sichtbar, mit `HttpOnly` und `SameSite=Lax`
- [x] Eintrag in `User`-Tabelle existiert; `passwordHash` ist **nicht** das Klartextpasswort.

---

### UC2 — Vorbereitung auf einen Zieltermin mit berechnetem Lernplan

**Bezug:** PRD §7 UC2, Must-Have M3 + M4 + M6

**Vorbedingung**

- [ ] User aus UC1 (oder vergleichbarer Demo-User) ist eingeloggt.
- [ ] Dashboard ist erreichbar.

**Schritte**

1. [ ] „Neuer Lernplan" anlegen.
2. [ ] Eingaben:
   - Titel: `Statistik Klausur`
   - Veranstaltung / Fach: `Statistik`
   - Zieltyp: `Klausur`
   - Zieldatum: heute + 70 Tage (≈ 10 Wochen)
   - Schwierigkeit: `3`
   - Vorwissen: `2`
   - Seiten / Folien: `120`
   - ECTS: `5`
3. [ ] Lernplan speichern und die Detailansicht öffnen.
4. [ ] Berechnete Gesamtstunden, Stunden pro Tag und Plantyp prüfen.
5. [ ] „In Kalender eintragen" öffnen und die Vorschau prüfen.
6. [ ] Die vorgeschlagenen Lerneinheiten in den Kalender übernehmen.
7. [ ] Seite neu laden und Lernplan, Aufgaben sowie Kalendertermine erneut prüfen.

**Erwartetes Ergebnis**

- Die Berechnung erzeugt Gesamtstunden, Tagesintensität und einen normalen oder kritischen Plantyp.
- Die Vorschau erzeugt konkrete zweistündige Lerneinheiten bis zum Zieldatum und berücksichtigt vorhandene Kalendertermine.
- Bei identischen Eingaben und demselben Bezugsdatum liefert eine erneute Berechnung **dasselbe Ergebnis** (Determinismus, PRD §8.1).
- Die Berechnung dauert auf einem normalen Entwicklungsrechner unter einer Sekunde (PRD §8.2 Reaktionszeit).
- Lernplan, Aufgaben und Termine bleiben nach einem Reload erhalten.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_

- -- Testdurchlauf 1 (Finn) 18.06. --
- [x] Die Berechnung erzeugt Gesamtstunden, Tagesintensität und einen normalen oder kritischen Plantyp.
- [x] Die Vorschau erzeugt konkrete zweistündige Lerneinheiten bis zum Zieldatum und berücksichtigt vorhandene Kalendertermine.
- [x] Bei identischen Eingaben und demselben Bezugsdatum liefert eine erneute Berechnung **dasselbe Ergebnis**
- [x] Die Berechnung dauert auf einem normalen Entwicklungsrechner unter einer Sekunde (PRD §8.2 Reaktionszeit).
- [x] Lernplan, Aufgaben und Termine bleiben nach einem Reload erhalten.

---

### UC3 — Tägliche Übersicht

**Bezug:** PRD §7 UC3, Must-Have M2 + M5

**Vorbedingung**

- [ ] Lernplan aus UC2 ist gespeichert.
- [ ] Die Lerneinheiten aus UC2 wurden in den Kalender übernommen.

**Schritte**

1. [ ] Dashboard öffnen.
2. [ ] Kennzahlen, nächste Lernsessions und Lernplanfortschritt prüfen.
3. [ ] Auf „Kalender" wechseln.
4. [ ] In der Wochenansicht die erzeugten Lernsessions und den Zieltermin prüfen.

**Erwartetes Ergebnis**

- Dashboard zeigt offene Aufgaben, aktive Lernpläne und anstehende verknüpfte Lernsessions.
- Der Lernplan ist mit seinem aktuellen Fortschritt erreichbar.
- Wochenansicht zeigt vorhandene Vorlesungen, Lerneinheiten und Zieltermine farblich unterschiedlich (PRD §6.1 M5).
- Falls ein DHBW-Kurs konfiguriert ist, sind externe Termine read-only und nicht editierbar.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_

- -- Testdurchlauf 1 (Finn) 18.06. --
- [x] Dashboard zeigt offene Aufgaben, aktive Lernpläne und anstehende verknüpfte Lernsessions.
- [x] Der Lernplan ist mit seinem aktuellen Fortschritt erreichbar.
- [x] Wochenansicht zeigt vorhandene Vorlesungen, Lerneinheiten und Zieltermine farblich unterschiedlich (PRD §6.1 M5).
- [x] Falls ein DHBW-Kurs konfiguriert ist, sind externe Termine read-only und nicht editierbar.

---

### UC4 — Verzug und Umplanung

**Bezug:** PRD §7 UC4, Must-Have M7

**Vorbedingung**

- [ ] Lernplan aus UC2 existiert.
- [ ] Mindestens zwei Aufgaben des Plans wurden vorher in der Detailansicht abgehakt — diese dürfen die Umplanung nicht verschieben.
- [ ] Mindestens drei Aufgaben sind offen; ihre bisherigen Fälligkeitsdaten wurden notiert.

**Schritte**

1. [ ] Lernplan öffnen.
2. [ ] „Offene Aufgaben neu verteilen" auslösen.
3. [ ] Neue Fälligkeitsdaten der offenen Aufgaben prüfen.
4. [ ] Erledigte Aufgaben prüfen.
5. [ ] Kalenderansicht öffnen und Lerneinheiten gegen den Plan abgleichen.

**Erwartetes Ergebnis**

- Offene Aufgaben sind über den verbleibenden Zeitraum bis zum Zieldatum neu verteilt.
- Bereits erledigte Aufgaben sind **unverändert** (PRD §6.1 M7).
- Die Verteilung berücksichtigt verbleibende Tage, geschätzten Aufwand und Schwierigkeit (PRD §8.1).
- Bei Aufgaben mit verknüpftem Lernslot wird der Kalendertermin mitverschoben.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_

- ***

### UC5 — Termin manuell pflegen

**Bezug:** PRD §7 UC5, Must-Have M5

**Vorbedingung**

- [ ] User ist eingeloggt.
- [ ] Kalenderansicht ist erreichbar.

**Schritte**

1. [ ] Kalender öffnen, Wochenansicht wählen.
2. [ ] „Neuer Termin" anlegen.
3. [ ] Eingaben:
   - Titel: `Sprechstunde Prof. Schmidt`
   - Datum: morgen
   - Uhrzeit: 14:00–15:00
   - Termintyp: `Sonstiges`
4. [ ] Termin speichern.
5. [ ] Termin per Drag in eine andere Zeit verschieben.
6. [ ] Termin bearbeiten (Titel ändern).
7. [ ] Termin löschen.

**Erwartetes Ergebnis**

- Termin erscheint sofort in Wochen- und Tagesansicht in der für „Sonstiges" definierten Farbe.
- Verschieben aktualisiert die Uhrzeit und ist nach Reload persistent.
- Bearbeiten und Löschen funktionieren ohne Fehlerabbruch.
- Externe DHBW-Termine sind im selben Kalender weiterhin nicht editierbar.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_

- ***

### UC6 — Abschluss einer Aufgabe

**Bezug:** PRD §7 UC6, Must-Have M4 + M2

**Vorbedingung**

- [ ] Lernplan aus UC2 enthält mindestens eine offene Aufgabe mit verknüpftem Lernslot.

**Schritte**

1. [ ] Lernplan-Detailseite öffnen.
2. [ ] Eine offene Aufgabe über ihre Checkbox als erledigt markieren.
3. [ ] Status und Fortschrittsanzeige im Lernplan prüfen.
4. [ ] Kalender öffnen und den verknüpften Lernslot prüfen.
5. [ ] Dashboard öffnen und Kennzahlen beziehungsweise Lernplanfortschritt prüfen.

**Erwartetes Ergebnis**

- Aufgabe ist im Lernplan als erledigt markiert (Datum/Zeit der Erledigung gespeichert).
- Der Lernplanfortschritt und die Anzahl offener Aufgaben werden aktualisiert.
- Der verknüpfte Kalender-Lernslot zeigt die Erledigung visuell an.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_

- ***

## 5. Querschnitt — pro Durchlauf zusätzlich prüfen

Diese Punkte sind nicht an einen einzelnen UC gebunden, müssen aber pro Durchlauf bestätigt werden:

- [ ] Logout funktioniert — `/api/auth/logout` löscht die Session-Cookies und führt zurück auf `/login` (Auth-Konzept).
- [ ] Direkter Aufruf einer geschützten Route (`/dashboard`) ohne Cookie führt auf `/login?redirect=/dashboard` (Auth-Konzept).
- [ ] Anmeldung mit gültigen Zugangsdaten führt auf `/dashboard`; eine bereits gültige Sitzung erlaubt den Zugriff auf geschützte Routen.
- [ ] Zwei verschiedene Konten sehen **ausschließlich** ihre eigenen Lernpläne, Aufgaben und Termine (PRD §8.1).
- [ ] Hauptfunktionen sind tastaturbedienbar (PRD §8.2 Zugänglichkeit).
- [ ] Keine unbehandelten Fehler in der Browser-Konsole oder im `next dev`-Log.

---

## 6. Umgang mit Befunden

| Befund-Typ        | Vorgehen                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Funktionsabbruch  | Sofort als GitHub-Issue mit Label `bug` und Severity `blocker` erfassen, Durchlauf-Ergebnis = `fail`.   |
| Falsches Ergebnis | Issue mit Label `bug`, Severity je nach Auswirkung; Durchlauf-Ergebnis = `pass with notes` oder `fail`. |
| UX-Auffälligkeit  | Issue mit Label `enhancement` anlegen, im Durchlauf nur in Notizen erwähnen, nicht als Fail zählen.     |
| Noch nicht gebaut | In der Schritt-Notiz „n/a — abhängig von Issue #X" vermerken; nicht als Pass und nicht als Fail werten. |

---

## 7. Verweise

- Use-Case-Beschreibungen: [`docs/prd.md`](../prd.md) §7
- Abnahmekriterien des Gesamtprojekts: [`docs/prd.md`](../prd.md) §14
- Auth-Konzept und geschützte Routen: [`docs/auth-concept.md`](../auth-concept.md)
- Lokales Setup: [`SETUP.md`](../../SETUP.md)
