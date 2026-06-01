# Manueller Abnahmetest — MVP-Flows

| Feld          | Inhalt                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| **Bezug**     | Issue #40 (H2), PRD §7 (Use Cases UC1–UC6), PRD §14 (Abnahmekriterien)    |
| **Zweck**     | Reproduzierbarer manueller Abnahmetest vor Meilensteinen und Präsentation |
| **Geltung**   | Verbindliche Testgrundlage für MVP-Abnahme                                |
| **Datei**     | `docs/testing/manual-acceptance-test.md`                                  |

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

| Datum      | Tester | Commit / Build       | Ergebnis     | Notizen / Issues                                  |
| ---------- | ------ | -------------------- | ------------ | ------------------------------------------------- |
| YYYY-MM-DD | Name   | `<hash>` / `npm run build` ok | `pass` / `pass with notes` / `fail` | Auffälligkeiten, Issue-Nummern, Demo-Daten-Stand |

---

## 3. Vorbereitung des Tests

Vor jedem Durchlauf folgende Voraussetzungen prüfen:

- [ ] `git status` ist clean, aktueller Commit-Hash notiert.
- [ ] `npm install` ist auf dem aktuellen Stand (`package-lock.json` unverändert nach `install`).
- [ ] `npm run build` läuft ohne Fehler durch.
- [ ] Lokale PostgreSQL-Datenbank läuft, `DATABASE_URL` in `.env.local` gesetzt.
- [ ] `npm run prisma:migrate` wurde ausgeführt; Schema ist aktuell.
- [ ] Demo-Daten geladen (siehe Issue #53 / H1 für den Demo-Daten-Mechanismus). Falls H1 noch nicht umgesetzt: manuell vorbereiteten Datenstand verwenden und das in den Notizen vermerken.
- [ ] Browser: aktueller Chrome, Firefox **oder** Safari (laut PRD §8.2 Browser-Unterstützung).
- [ ] Browser-Cache und Cookies für `localhost:3000` gelöscht — sonst hängt UC1 an einer alten Session.
- [ ] `npm run dev` läuft auf `http://localhost:3000`.

---

## 4. Use-Case-Checklisten

Die folgenden sechs Abschnitte spiegeln UC1–UC6 aus dem PRD §7. Jeder Abschnitt enthält Vorbedingung, Schritte mit Eingabewerten, das erwartete Ergebnis und ein Feld für das tatsächliche Ergebnis pro Durchlauf.

> Hinweis: Die UCs in dieser Checkliste setzen den finalen MVP-Funktionsumfang voraus (Auth, Lernpläne, Aufgaben, Kalender, algorithmische Planung). Vor Implementierung der zugehörigen Tickets bleiben einzelne Schritte „n/a" — das ist explizit zu vermerken, nicht als Pass zu zählen.

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
- Dashboard ist leer und zeigt einen Hinweis, einen ersten Lernplan anzulegen.
- Cookie `lh_session` ist in den DevTools sichtbar, mit `HttpOnly` und `SameSite=Lax` (PRD §8.2 + Auth-Konzept §5.2).
- Eintrag in `User`-Tabelle existiert; `passwordHash` ist **nicht** das Klartextpasswort.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_
- 

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
   - Modus: **Plan automatisch berechnen**
3. [ ] Acht Themen eintragen, jeweils mit geschätztem Aufwand (z. B. 2–6 h) und subjektiver Schwierigkeit (1–5).
4. [ ] Verfügbare Lernzeit: `6 Stunden pro Woche`.
5. [ ] Berechnung auslösen.
6. [ ] Berechneten Plan öffnen und prüfen.
7. [ ] Zwei berechnete Aufgaben manuell um eine Woche nach hinten verschieben und speichern.

**Erwartetes Ergebnis**
- Die Berechnung erzeugt eine Liste konkreter Aufgaben mit Fälligkeitsdaten verteilt über den Zeitraum bis zum Zieldatum.
- Bei identischen Eingaben liefert eine erneute Berechnung **dasselbe Ergebnis** (Determinismus, PRD §8.1).
- Die Berechnung dauert auf einem normalen Entwicklungsrechner unter einer Sekunde (PRD §8.2 Reaktionszeit).
- Die zwei manuell verschobenen Aufgaben behalten ihre Verschiebung nach Reload des Plans.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_
- 

---

### UC3 — Tägliche Übersicht

**Bezug:** PRD §7 UC3, Must-Have M2 + M5

**Vorbedingung**
- [ ] Lernplan aus UC2 ist gespeichert.
- [ ] Mindestens ein Vorlesungstermin liegt für heute im Kalender (manuell angelegt oder über DHBW-ICS-Feed).
- [ ] Mindestens zwei berechnete Aufgaben fallen auf den heutigen Tag.

**Schritte**
1. [ ] Dashboard öffnen.
2. [ ] Anstehende Aufgaben und heutige Termine auf einen Blick erfassen.
3. [ ] Auf „Kalender" wechseln.
4. [ ] In der Wochenansicht den aktuellen Tag und die folgenden zwei Tage prüfen.

**Erwartetes Ergebnis**
- Dashboard zeigt die für heute geplanten Aufgaben **und** die heutigen Termine.
- Anstehende Aufgaben sind nach Fälligkeit sortiert oder klar gruppiert.
- Wochenansicht zeigt Vorlesungen, Lerneinheiten und Zieltermine farblich unterschiedlich (PRD §6.1 M5).
- Externe DHBW-Termine sind als read-only markiert und nicht editierbar (CLAUDE.md §13).

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_
- 

---

### UC4 — Verzug und Umplanung

**Bezug:** PRD §7 UC4, Must-Have M7

**Vorbedingung**
- [ ] Lernplan aus UC2 existiert.
- [ ] Mindestens zwei Aufgaben des Plans wurden vorher abgehakt (siehe UC6) — diese dürfen die Umplanung nicht verschieben.
- [ ] Mindestens drei Aufgaben sind offen und haben Fälligkeitsdaten in der Vergangenheit (manuell auf gestern setzen, um Verzug zu simulieren).

**Schritte**
1. [ ] Lernplan öffnen.
2. [ ] „Plan neu verteilen" auslösen.
3. [ ] Neue Fälligkeitsdaten der offenen Aufgaben prüfen.
4. [ ] Erledigte Aufgaben prüfen.
5. [ ] Kalenderansicht öffnen und Lerneinheiten gegen den Plan abgleichen.

**Erwartetes Ergebnis**
- Offene Aufgaben sind über den verbleibenden Zeitraum bis zum Zieldatum neu verteilt.
- Bereits erledigte Aufgaben sind **unverändert** (PRD §6.1 M7).
- Die Verteilung berücksichtigt verbleibende Tage, Aufwand und Schwierigkeit (PRD §8.1).
- Neue Fälligkeitsdaten sind sofort auch im Kalender sichtbar.

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_
- 

---

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
- 

---

### UC6 — Abschluss einer Aufgabe

**Bezug:** PRD §7 UC6, Must-Have M4 + M2

**Vorbedingung**
- [ ] Lernplan mit mindestens einer offenen Aufgabe für heute existiert.
- [ ] Dashboard zeigt die Aufgabe in der „Anstehend"-Liste.

**Schritte**
1. [ ] Dashboard öffnen.
2. [ ] Eine Aufgabe abhaken (direkt auf dem Dashboard).
3. [ ] Lernplan-Detailseite öffnen und Status der Aufgabe prüfen.
4. [ ] Auf das Dashboard zurückkehren und die „Anstehend"-Liste prüfen.

**Erwartetes Ergebnis**
- Aufgabe ist im Lernplan als erledigt markiert (Datum/Zeit der Erledigung gespeichert).
- Aufgabe verschwindet aus der „Anstehend"-Liste auf dem Dashboard.
- Verknüpfter Kalender-Lernslot zeigt die Erledigung visuell an (sofern Should-Have S1 umgesetzt ist).

**Tatsächliches Ergebnis** _(pro Durchlauf füllen)_
- 

---

## 5. Querschnitt — pro Durchlauf zusätzlich prüfen

Diese Punkte sind nicht an einen einzelnen UC gebunden, müssen aber pro Durchlauf bestätigt werden:

- [ ] Logout funktioniert — `/api/auth/logout` löscht das Cookie und führt zurück auf `/login` (Auth-Konzept §5.5).
- [ ] Direkter Aufruf einer geschützten Route (`/dashboard`) ohne Cookie führt auf `/login?redirect=/dashboard` (Auth-Konzept §6.3).
- [ ] Aufruf von `/login` mit gültigem Cookie führt auf `/dashboard`.
- [ ] Zwei verschiedene Konten sehen **ausschließlich** ihre eigenen Lernpläne, Aufgaben und Termine (PRD §8.1).
- [ ] Hauptfunktionen sind tastaturbedienbar (PRD §8.2 Zugänglichkeit).
- [ ] Keine unbehandelten Fehler in der Browser-Konsole oder im `next dev`-Log.

---

## 6. Umgang mit Befunden

| Befund-Typ        | Vorgehen                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Funktionsabbruch  | Sofort als GitHub-Issue mit Label `bug` und Severity `blocker` erfassen, Durchlauf-Ergebnis = `fail`.       |
| Falsches Ergebnis | Issue mit Label `bug`, Severity je nach Auswirkung; Durchlauf-Ergebnis = `pass with notes` oder `fail`.    |
| UX-Auffälligkeit  | Issue mit Label `enhancement` anlegen, im Durchlauf nur in Notizen erwähnen, nicht als Fail zählen.        |
| Noch nicht gebaut | In der Schritt-Notiz „n/a — abhängig von Issue #X" vermerken; nicht als Pass und nicht als Fail werten.    |

---

## 7. Verweise

- Use-Case-Beschreibungen: [`docs/prd.md`](../prd.md) §7
- Abnahmekriterien des Gesamtprojekts: [`docs/prd.md`](../prd.md) §14
- Auth-Konzept und geschützte Routen: [`docs/auth-concept.md`](../auth-concept.md)
- Bekannte Baustellen Kalender / DB: [`docs/kalender-db-todos.md`](../kalender-db-todos.md)
