# LearnHub Issue Backlog Draft

Stand: 2026-05-17  
Zweck: Arbeitsentwurf fuer den Projektplan in GitHub Projects bis 2026-05-19.

Dieser Entwurf ist als Grundlage fuer die gemeinsame Schaetzung und Verteilung im Team gedacht. Die Tickets sind bewusst so formuliert, dass sie einzeln bearbeitbar, pruefbar und in GitHub Issues uebertragbar sind.

## Ticket-Standard

Jedes Umsetzungsticket sollte mindestens diese Struktur haben:

```md
## User Story

Als [Rolle] moechte ich [Funktion/Ziel], damit [Nutzen].

## Beschreibung

Kurze fachliche und technische Einordnung des Tickets.

## Akzeptanzkriterien

- [ ] ...
- [ ] ...
- [ ] ...

## Umsetzungshinweise

Relevante Dateien, technische Hinweise, offene Entscheidungen.

## Testing / Verifikation

- [ ] Manuell geprueft: ...
- [ ] Optional: automatisierter Test fuer ...

## Abhaengigkeiten

- Blockiert durch: ...
- Blockiert: ...

## Schaetzung

Team-Schaetzung: offen
Vorschlag: ...
```

## Schaetzskala

Vom Team abgestimmte Story-Point-Skala:

- `1`: innerhalb einer kurzen Session bis maximal 2 Stunden machbar.
- `2`: innerhalb einer langen Session bis maximal 4 Stunden machbar.
- `3`: innerhalb von maximal 2 langen Sessions machbar.
- `5`: mehr als 2 lange Sessions, aber in etwa 1 Woche mit mehreren Sessions machbar.
- `8`: nicht mehr sinnvoll innerhalb einer Woche machbar; sollte aufgeteilt werden.

Assignee-Mapping fuer GitHub:

- Lucas -> `Brati10`
- Yannik -> `Lostthetige`
- Fabi -> `Fabsi07`
- Lenni -> `Lennard79`
- Finn -> `Finnbimb`

## Milestone-Zuordnung

Vorschlag fuer GitHub Milestones:

- `1. Projektidee und Planung` bis 2026-04-27. Status: abgeschlossen.
- `2. Umfang und PRD` bis 2026-05-21. Status: aktueller fachlicher Fokus.
- `3. Prototyp` bis 2026-06-29 (präsentabel) / 2026-07-05 (fertig für Abgabe). Status: Umsetzung und Demo.

Projektmanagement-Frist:

- Bis 2026-05-19 sollte das GitHub Project genuegend vollstaendige und geschaetzte Issues enthalten, damit der Projektplan daraus ablesbar ist.

---

# Epic A: Anforderungen, Planung und Projektmanagement

## A1 - PRD nach Teammeeting finalisieren

## User Story

Als Projektteam moechten wir das PRD nach dem Teammeeting finalisieren, damit der vereinbarte MVP-Umfang eindeutig ist.

## Beschreibung

Die Datei `docs/prd.md` wird auf den abgestimmten Teamstand gebracht. Der Kern der Anwendung ist algorithmische Lernplanung. KI ist nur Could-Have, z. B. zur Bewertung bestehender Lernplaene oder zur Extraktion moeglicher Aufgaben aus hochgeladenen Lernmaterialien.

## Akzeptanzkriterien

- [ ] `docs/prd.md` ist die zentrale PRD-Datei.
- [ ] Die Rolle der KI ist eindeutig als Could-Have festgelegt.
- [ ] Lernplaene sind fachlich als Veranstaltung/Fach plus Zieldatum beschrieben, nicht starr als Klausurplan.
- [ ] Das PRD enthaelt keine widerspruechlichen Aussagen zur Planungslogik.

## Umsetzungshinweise

Relevant: `docs/prd.md`, `docs/course/README.md`.

## Testing / Verifikation

- [ ] Team-Review durchgefuehrt.
- [ ] Ergebnis im Repository oder GitHub Project nachvollziehbar dokumentiert.

## Abhaengigkeiten

- Blockiert: finale Issue-Priorisierung fuer Planungslogik.

## Schaetzung

Team-Schaetzung: 2
Assignee: Lucas
Status: erledigt / nicht neu als GitHub Issue anlegen

## A2 - Moodle-README fuer Projektplan-Abgabe erstellen

## User Story

Als Projektteam moechten wir eine kurze Abgabe-README fuer Moodle erstellen, damit die Dozentin den GitHub-Projektplan schnell findet und einordnen kann.

## Beschreibung

Es wird ein kleines Markdown-Dokument erstellt, das den Link zum GitHub Project, den aktuellen Planungsstand, die verwendete Schaetzskala und Hinweise zu offenen Punkten enthaelt.

## Akzeptanzkriterien

- [ ] README enthaelt Link zum GitHub Project.
- [ ] README erklaert kurz die Struktur von Milestones, Issues, Labels und Schaetzungen.
- [ ] README nennt den Stand zum Abgabedatum 2026-05-19.
- [ ] README ist in Moodle hochladbar oder direkt aus dem Repo verlinkbar.

## Umsetzungshinweise

Moeglicher Pfad: `docs/project-management/project-plan-submission-readme.md`.

## Testing / Verifikation

- [ ] Link zum GitHub Project funktioniert.
- [ ] Eine teamfremde Person kann anhand der README verstehen, wo der Projektplan liegt.

## Abhaengigkeiten

- Blockiert durch: GitHub Project mit Issues und Schaetzungen.

## Schaetzung

Team-Schaetzung: 1
Assignee: Lucas

## A3 - Bestehende GitHub Issues aufraeumen und einordnen

## User Story

Als Projektteam moechten wir alte und neue Issues klar einordnen, damit das GitHub Project den aktuellen Projektplan abbildet.

## Beschreibung

Bestehende Issues aus Meilenstein 1 werden gesichtet. Erledigte Issues werden geschlossen oder als erledigt markiert, Sammel-Issues werden als Epics genutzt oder gelöscht/geschlossen, und neue Umsetzungstickets werden passend verlinkt.

## Akzeptanzkriterien

- [ ] Offene M1-Issues sind entweder geschlossen oder begruendet weiter offen.
- [ ] Sammel-Issues sind als Epics/Parent-Issues erkennbar.
- [ ] Neue Umsetzungstickets sind passenden Milestones oder Epics zugeordnet.
- [ ] Das GitHub Project zeigt keine offensichtlich veralteten Aufgaben als aktuelle Arbeit.

## Umsetzungshinweise

Bestehende Issues: `#1`, `#2`, `#5`, `#7`, `#9`, `#12`, `#17`, `#18`, `#21`, `#22`, `#23`, `#24`, `#25`.

## Testing / Verifikation

- [ ] GitHub Project visuell pruefen.
- [ ] Offene Issues mit dem Team kurz gegenlesen.

## Abhaengigkeiten

- Keine.

## Schaetzung

Team-Schaetzung: 2
Assignee: Lucas

---

# Epic B: Datenmodell und Persistenz

## B1 - Prisma-Datenmodell fuer LearnHub definieren

## User Story

Als Entwickler moechte ich ein Prisma-Datenmodell fuer Nutzer, Lernplaene, Aufgaben und Termine definieren, damit die Kernobjekte persistent gespeichert werden koennen.

## Beschreibung

Das aktuell leere Prisma-Schema wird um die zentralen Modelle erweitert. Mindestens benoetigt werden Nutzer, Lernplan, Aufgabe und Kalendertermin. Beziehungen und Loeschverhalten werden fachlich sinnvoll festgelegt.

## Akzeptanzkriterien

- [ ] `User` enthaelt mindestens E-Mail, Anzeigename, Passwort-Hash und Zeitstempel.
- [ ] `StudyPlan` enthaelt Titel, Veranstaltung/Fach, Beschreibung, Zieltyp, Zieldatum, Owner-Bezug und Zeitstempel.
- [ ] `Task` enthaelt Titel, Beschreibung optional, Aufwand, Schwierigkeit, Faelligkeit, Status und Bezug zum Lernplan.
- [ ] `CalendarEvent` enthaelt Titel, Start/Ende, Typ, Owner-Bezug und optionalen Task-/StudyPlan-Bezug.
- [ ] Beziehungen verhindern Cross-User-Datenzugriff auf Modellebene sinnvoll.
- [ ] Prisma-Generierung laeuft erfolgreich.

## Umsetzungshinweise

Relevant: `prisma/schema.prisma`, `docs/prd.md`.

## Testing / Verifikation

- [ ] `npm run prisma:generate` erfolgreich.
- [ ] Schema im Team kurz fachlich geprueft.

## Abhaengigkeiten

- Blockiert: API-Routen fuer Lernplaene, Aufgaben und Termine.

## Schaetzung

Team-Schaetzung: 5
Assignee: Yannik / Fabi

## B2 - Lokale Datenbankkonfiguration dokumentieren

## User Story

Als Entwickler moechte ich die lokale Datenbankkonfiguration dokumentieren, damit jedes Teammitglied die Anwendung mit Persistenz starten kann.

## Beschreibung

Die benoetigten Umgebungsvariablen und der lokale PostgreSQL-Start werden dokumentiert. Falls Docker genutzt wird, wird ein minimaler Ablauf beschrieben.

## Akzeptanzkriterien

- [ ] Benoetigte `.env.local`-Variablen sind dokumentiert.
- [ ] Lokaler Datenbankstart ist nachvollziehbar beschrieben.
- [ ] Prisma-Migration und Client-Generierung sind beschrieben.
- [ ] Hinweise fuer haeufige Fehler sind enthalten.

## Umsetzungshinweise

Relevant: `README.md`, `docs/tech-stack.md`, optional `docker-compose.yml`.

## Testing / Verifikation

- [ ] Ein Teammitglied kann die Schritte auf einem frischen Checkout nachvollziehen.

## Abhaengigkeiten

- Blockiert durch: Entscheidung zu lokaler PostgreSQL-/Docker-Nutzung --> wird von am Ticket beteiligten Devs abgestimmt und festgelegt.

## Schaetzung

Team-Schaetzung: 3
Assignee: Yannik / Fabi

## B3 - Erste Prisma-Migration fuer Kernmodelle erstellen

## User Story

Als Entwickler moechte ich eine erste Datenbankmigration fuer die Kernmodelle erstellen, damit das Schema reproduzierbar im Team angewendet werden kann.

## Beschreibung

Nach Abstimmung des Datenmodells wird eine Prisma-Migration erzeugt und eingecheckt. Der Prisma Client wird aktualisiert.

## Akzeptanzkriterien

- [ ] Migration fuer Kernmodelle ist im Repository vorhanden.
- [ ] `npm run prisma:migrate` laeuft lokal gegen die Entwicklungsdatenbank.
- [ ] `npm run prisma:generate` laeuft erfolgreich.
- [ ] Keine nicht abgestimmten Beispieldaten sind Teil der Migration.

## Umsetzungshinweise

Relevant: `prisma/schema.prisma`, `prisma/migrations`.

## Testing / Verifikation

- [ ] Lokale Migration erfolgreich ausgefuehrt.
- [ ] Anwendung startet danach weiterhin.

## Abhaengigkeiten

- Blockiert durch: B1, B2.

## Schaetzung

Team-Schaetzung: offen

---

# Epic C: Authentifizierung und Nutzerkontext

## C1 - Registrierungs- und Login-Flow fachlich finalisieren

## User Story

Als Studierender moechte ich mich registrieren und anmelden koennen, damit meine Lernplaene und Termine meinem Konto zugeordnet werden.

## Beschreibung

Der aktuell vorhandene Login ist ein UI-/Routing-Stub. Dieses Ticket klaert und dokumentiert den minimalen Auth-Flow fuer das MVP, inklusive Registrierung, Login, Logout, Session und Passwort-Hashing.

## Akzeptanzkriterien

- [ ] MVP-Auth-Konzept ist dokumentiert.
- [ ] Entscheidung zu eigener Auth vs. Library ist getroffen.
- [ ] Session-Verhalten und geschuetzte Routen sind beschrieben.
- [ ] Passwort-Hashing ist als technische Anforderung festgelegt.

## Umsetzungshinweise

Relevant: `src/components/login/LoginForm.tsx`, `src/middleware.ts`, `docs/prd.md`.

## Testing / Verifikation

- [ ] Konzept im Team bestaetigt.

## Abhaengigkeiten

- Blockiert: C2, C3.

## Schaetzung

Team-Schaetzung: 3

## C2 - Registrierung implementieren

## User Story

Als Studierender moechte ich ein Konto mit E-Mail, Anzeigename und Passwort erstellen, damit ich LearnHub persoenlich nutzen kann.

## Beschreibung

Eine Registrierungsseite und passende Server-/API-Logik werden umgesetzt. Passwoerter werden gehasht gespeichert. Bereits verwendete E-Mail-Adressen werden abgefangen.

## Akzeptanzkriterien

- [ ] Registrierungsseite ist erreichbar.
- [ ] Nutzer kann E-Mail, Anzeigename und Passwort eingeben.
- [ ] Passwort wird nicht im Klartext gespeichert.
- [ ] Doppelte E-Mail-Adressen erzeugen eine verstaendliche Fehlermeldung.
- [ ] Nach erfolgreicher Registrierung wird der Nutzer sinnvoll weitergeleitet.

## Umsetzungshinweise

Moegliche Pfade: `src/app/register/page.tsx`, `src/app/api/auth/register/route.ts`, `prisma/schema.prisma`.

## Testing / Verifikation

- [ ] Manuell registrieren mit gueltigen Daten.
- [ ] Manuell registrieren mit bereits verwendeter E-Mail.
- [ ] Datenbank pruefen: kein Klartextpasswort.

## Abhaengigkeiten

- Blockiert durch: B1, B3, C1.

## Schaetzung

Team-Schaetzung: offen

## C3 - Login, Logout und geschuetzte App-Routen implementieren

## User Story

Als Studierender moechte ich mich anmelden und abmelden koennen, damit nur ich meine eigenen Daten sehe.

## Beschreibung

Der Login-Stub wird durch echte Authentifizierung ersetzt. Die Middleware schuetzt App-Routen, sobald Auth aktiviert ist. Logout entfernt die Session.

## Akzeptanzkriterien

- [ ] Login prueft E-Mail und Passwort gegen gespeicherte Nutzerdaten.
- [ ] Erfolgreicher Login setzt eine Session.
- [ ] Logout beendet die Session.
- [ ] Geschuetzte Routen leiten unangemeldete Nutzer zur Login-Seite.
- [ ] Angemeldete Nutzer werden nicht unnoetig erneut zum Login geschickt.

## Umsetzungshinweise

Relevant: `src/components/login/LoginForm.tsx`, `src/middleware.ts`, API-Routen fuer Auth.

## Testing / Verifikation

- [ ] Login mit gueltigem Konto funktioniert.
- [ ] Login mit falschem Passwort zeigt Fehler.
- [ ] Direktaufruf `/dashboard` ohne Session fuehrt zu `/login`.
- [ ] Logout verhindert erneuten Zugriff ohne Login.

## Abhaengigkeiten

- Blockiert durch: B1, B3, C1, C2.

## Schaetzung

Team-Schaetzung: offen

---

# Epic D: Lernplaene und Aufgaben

## D1 - Lernplan-Uebersicht erstellen

## User Story

Als Studierender moechte ich alle meine Lernplaene in einer Uebersicht sehen, damit ich schnell zwischen Veranstaltungen, Faechern und Lernzielen wechseln kann.

## Beschreibung

Eine Lernplan-Seite zeigt alle aktiven Lernplaene des angemeldeten Nutzers mit Titel, Veranstaltung/Fach, Zieltyp, Zieldatum, Fortschritt und naechster Aufgabe.

## Akzeptanzkriterien

- [ ] Lernplan-Seite ist ueber die Navigation erreichbar.
- [ ] Bestehende Lernplaene werden als Liste oder Karten angezeigt.
- [ ] Jeder Lernplan zeigt mindestens Titel, Veranstaltung/Fach, Zieltyp und Zieldatum.
- [ ] Leerer Zustand bietet Aktion zum Anlegen eines Lernplans.
- [ ] Klick auf einen Lernplan fuehrt zur Detailansicht.

## Umsetzungshinweise

Moegliche Pfade: `src/app/(app)/study-plan/page.tsx`, `src/components/study-plan`.

## Testing / Verifikation

- [ ] Mit mehreren Lernplaenen wird die Uebersicht korrekt angezeigt.
- [ ] Ohne Lernplaene erscheint ein sinnvoller leerer Zustand.

## Abhaengigkeiten

- Blockiert durch: B1, B3, C3.

## Schaetzung

Team-Schaetzung: offen  
Vorschlag: `3`

## D2 - Lernplan anlegen, bearbeiten und loeschen

## User Story

Als Studierender moechte ich Lernplaene anlegen, bearbeiten und loeschen, damit ich meine Vorbereitungen fuer Veranstaltungen, Fristen und Lernziele verwalten kann.

## Beschreibung

Formulare und API-Logik fuer CRUD-Operationen auf Lernplaenen werden umgesetzt. Jeder Lernplan gehoert zum angemeldeten Nutzer.

## Akzeptanzkriterien

- [ ] Lernplan kann mit Titel, Veranstaltung/Fach, Beschreibung, Zieltyp und Zieldatum angelegt werden.
- [ ] Lernplan kann bearbeitet werden.
- [ ] Lernplan kann geloescht werden.
- [ ] Eingaben werden validiert.
- [ ] Nutzer koennen nur eigene Lernplaene sehen und veraendern.

## Umsetzungshinweise

Moegliche API: `src/app/api/study-plan/route.ts`, `src/app/api/study-plan/[id]/route.ts`.

## Testing / Verifikation

- [ ] Lernplan anlegen, Seite neu laden, Lernplan bleibt sichtbar.
- [ ] Lernplan bearbeiten, geaenderte Daten bleiben erhalten.
- [ ] Lernplan loeschen entfernt ihn aus der Uebersicht.

## Abhaengigkeiten

- Blockiert durch: B1, B3, C3.
- Blockiert: D3, E3, F3.

## Schaetzung

Team-Schaetzung: offen

## D3 - Aufgaben innerhalb eines Lernplans verwalten

## User Story

Als Studierender moechte ich Aufgaben in einem Lernplan anlegen und bearbeiten, damit mein Lernstoff in konkrete Schritte zerlegt ist.

## Beschreibung

In der Lernplan-Detailansicht koennen Aufgaben erstellt, bearbeitet, abgehakt und geloescht werden. Aufgaben haben Titel, Aufwand, Schwierigkeit, Faelligkeit und Status.

## Akzeptanzkriterien

- [ ] Aufgabenliste ist in der Lernplan-Detailansicht sichtbar.
- [ ] Aufgabe kann mit Titel, Aufwand, Schwierigkeit und Faelligkeit angelegt werden.
- [ ] Aufgabe kann bearbeitet werden.
- [ ] Aufgabe kann als erledigt markiert werden.
- [ ] Aufgabe kann geloescht werden.
- [ ] Fortschritt des Lernplans wird aus erledigten Aufgaben abgeleitet.

## Umsetzungshinweise

Moegliche API: `src/app/api/activity/route.ts` oder konsistent umbenennen/pruefen, ob `tasks` fachlich klarer waere.

## Testing / Verifikation

- [ ] Aufgabe anlegen und nach Reload wiedersehen.
- [ ] Aufgabe abhaken und Dashboard/Detailansicht aktualisieren.
- [ ] Aufgabe loeschen entfernt sie dauerhaft.

## Abhaengigkeiten

- Blockiert durch: D2.
- Blockiert: F1, F2, E3.

## Schaetzung

Team-Schaetzung: offen

---

# Epic E: Kalender

## E1 - Kalenderdatenmodell mit UI abgleichen

## User Story

Als Entwickler moechte ich das Kalenderdatenmodell mit der bestehenden Kalender-UI abgleichen, damit Dummy-Daten durch echte Termine ersetzt werden koennen.

## Beschreibung

Die vorhandenen Kalender-Komponenten arbeiten aktuell mit Dummy-Events. Das Event-Interface wird mit dem Prisma-Modell und den API-Anforderungen abgeglichen.

## Akzeptanzkriterien

- [ ] Bestehendes `CalEvent`-Format ist dokumentiert oder angepasst.
- [ ] Event-Typen fuer Vorlesung, Zieltermin, Lerneinheit und Sonstiges sind definiert.
- [ ] Farbzuordnung je Termintyp ist festgelegt.
- [ ] Start-/Endzeit, Datum und Zeitzonenannahmen sind geklaert.

## Umsetzungshinweise

Relevant: `src/components/calendar/events.ts`, `src/components/calendar/Calendar.tsx`, `prisma/schema.prisma`.

## Testing / Verifikation

- [ ] Bestehende Kalenderansichten funktionieren nach Typanpassungen weiter.

## Abhaengigkeiten

- Blockiert durch: B1.
- Blockiert: E2.

## Schaetzung

Team-Schaetzung: 2

## E2 - Kalendertermine persistent laden und speichern

## User Story

Als Studierender moechte ich Kalendertermine dauerhaft speichern, damit meine Planung nach einem Neustart erhalten bleibt.

## Beschreibung

Die Kalenderseite wird von Dummy-Daten auf echte, nutzerspezifische Termine umgestellt. API-Routen fuer Termine werden implementiert.

## Akzeptanzkriterien

- [ ] Kalender laedt Termine des angemeldeten Nutzers aus der Datenbank.
- [ ] Termine koennen angelegt werden.
- [ ] Termine koennen bearbeitet oder verschoben werden.
- [ ] Termine koennen geloescht werden.
- [ ] Termine anderer Nutzer sind nicht sichtbar.

## Umsetzungshinweise

Relevant: `src/app/api/events`, `src/components/calendar`.

## Testing / Verifikation

- [ ] Termin anlegen, Seite neu laden, Termin bleibt sichtbar.
- [ ] Termin verschieben und Reload pruefen.
- [ ] Termin loeschen und Reload pruefen.

## Abhaengigkeiten

- Blockiert durch: B3, C3, E1.

## Schaetzung

Team-Schaetzung: offen

## E3 - Lernaufgaben und Zieltermine im Kalender anzeigen

## User Story

Als Studierender moechte ich Lernaufgaben und Zieltermine im Kalender sehen, damit mein Lernplan zeitlich sichtbar wird.

## Beschreibung

Faelligkeiten aus Lernplaenen und Aufgaben werden in der Kalenderansicht dargestellt. Zieltermine erscheinen als eigener Termintyp, z. B. fuer Klausuren, Abgaben, Praesentationen oder selbst gesetzte Fristen.

## Akzeptanzkriterien

- [ ] Zieldatum eines Lernplans erscheint im Kalender.
- [ ] Faellige Lernaufgaben erscheinen im Kalender.
- [ ] Kalender unterscheidet Zieltermine, Lerneinheiten und manuelle Termine visuell.
- [ ] Klick auf eine Lernaufgabe fuehrt zur passenden Detailansicht oder zeigt relevante Details.

## Umsetzungshinweise

Kann zunaechst lesend umgesetzt werden; vollstaendige bidirektionale Verknuepfung ist Should-Have.

## Testing / Verifikation

- [ ] Lernplan mit Zieldatum anlegen und Kalender pruefen.
- [ ] Aufgabe mit Faelligkeit anlegen und Kalender pruefen.

## Abhaengigkeiten

- Blockiert durch: D2, D3, E2.

## Schaetzung

Team-Schaetzung: offen

---

# Epic F: Dashboard

## F1 - Dashboard mit echten Aufgaben und Terminen befuellen

## User Story

Als Studierender moechte ich auf dem Dashboard meine naechsten Aufgaben und Termine sehen, damit ich sofort weiss, was aktuell wichtig ist.

## Beschreibung

Der Dashboard-Platzhalter wird durch eine echte Uebersicht ersetzt. Angezeigt werden naechste Aufgaben, heutige/morgige Termine und aktive Lernplaene.

## Akzeptanzkriterien

- [ ] Dashboard zeigt naechste offene Aufgaben ueber alle Lernplaene.
- [ ] Dashboard zeigt heutige und morgige Kalendertermine.
- [ ] Dashboard zeigt aktive Lernplaene mit Schnellzugriff.
- [ ] Leere Zustaende sind sinnvoll formuliert.
- [ ] Daten gehoeren nur zum angemeldeten Nutzer.

## Umsetzungshinweise

Relevant: `src/app/(app)/dashboard/page.tsx`, `src/components/dashboard`.

## Testing / Verifikation

- [ ] Mit Demodaten sind alle Dashboardbereiche befuellt.
- [ ] Ohne Daten erscheinen leere Zustaende.

## Abhaengigkeiten

- Blockiert durch: C3, D2, D3, E2.

## Schaetzung

Team-Schaetzung: offen

## F2 - Ueberfaellige Aufgaben visuell hervorheben

## User Story

Als Studierender moechte ich ueberfaellige Aufgaben erkennen, damit ich meinen Lernplan rechtzeitig anpassen kann.

## Beschreibung

Offene Aufgaben mit Faelligkeitsdatum in der Vergangenheit werden im Dashboard und in Lernplan-Detailansichten hervorgehoben.

## Akzeptanzkriterien

- [ ] Ueberfaellige offene Aufgaben sind visuell erkennbar.
- [ ] Erledigte Aufgaben werden nicht als ueberfaellig markiert.
- [ ] Hervorhebung ist konsistent in Dashboard und Lernplanansicht.

## Umsetzungshinweise

Should-Have gemaess PRD, aber klein und fuer Demo nuetzlich.

## Testing / Verifikation

- [ ] Aufgabe mit gestrigem Datum offen: wird markiert.
- [ ] Dieselbe Aufgabe erledigt: Markierung verschwindet.

## Abhaengigkeiten

- Blockiert durch: D3, F1.

## Schaetzung

Team-Schaetzung: offen

---

# Epic G: Algorithmische Lernplanung

## G1 - MVP-Regeln fuer Lernplan-Algorithmus definieren

## User Story

Als Projektteam moechten wir einfache Regeln fuer die Lernplanberechnung definieren, damit die Umsetzung deterministisch und nachvollziehbar bleibt.

## Beschreibung

Der Algorithmus wird fachlich beschrieben, bevor er implementiert wird. Ziel ist ein MVP-Algorithmus, der Aufwand, Schwierigkeit, Frist und verfuegbare Lernzeit beruecksichtigt, ohne zu komplex zu werden.

## Akzeptanzkriterien

- [ ] Eingabeparameter sind definiert.
- [ ] Ausgabeformat ist definiert.
- [ ] Regeln fuer Priorisierung und Verteilung sind beschrieben.
- [ ] Umgang mit unmoeglichen Plaenen ist beschrieben.
- [ ] Beispieleingabe und erwartete Beispielausgabe sind dokumentiert.

## Umsetzungshinweise

Moeglicher Pfad: `docs/algorithm/learning-plan-algorithm.md`.

## Testing / Verifikation

- [ ] Team kann anhand der Doku erklaeren, warum ein Beispielplan entsteht.

## Abhaengigkeiten

- Blockiert durch: A1.
- Blockiert: G2, G3.

## Schaetzung

Team-Schaetzung: 5
Assignee: Yannik + Lenni

## G2 - Algorithmus als reine TypeScript-Funktion implementieren

## User Story

Als Entwickler moechte ich die Lernplanberechnung als reine Funktion implementieren, damit sie testbar, wiederverwendbar und unabhaengig von UI/API ist.

## Beschreibung

Die definierte Planungslogik wird in einer separaten Library-Datei umgesetzt. Die Funktion nimmt strukturierte Eingaben entgegen und gibt geplante Aufgaben oder Lerneinheiten zurueck.

## Akzeptanzkriterien

- [ ] Algorithmus liegt getrennt von UI-Komponenten.
- [ ] Funktion hat typisierte Eingaben und Ausgaben.
- [ ] Gleiche Eingaben erzeugen gleiche Ausgaben.
- [ ] Unmoegliche oder unvollstaendige Eingaben werden kontrolliert behandelt.
- [ ] Mindestens zentrale Beispiel- oder Unit-Tests existieren.

## Umsetzungshinweise

Moeglicher Pfad: `src/lib/calculations/learningPlan.ts`.

## Testing / Verifikation

- [ ] Testfall: normaler Plan ueber mehrere Wochen.
- [ ] Testfall: sehr wenig verfuegbare Zeit.
- [ ] Testfall: erledigte Aufgaben bleiben bei Umplanung unveraendert.

## Abhaengigkeiten

- Blockiert durch: G1.
- Blockiert: G3, G4.

## Schaetzung

Team-Schaetzung: 3

## G3 - Automatische Lernplan-Erstellung in Lernplan-Flow integrieren

## User Story

Als Studierender moechte ich beim Anlegen eines Lernplans einen Plan automatisch berechnen lassen, damit ich nicht alle Faelligkeiten manuell setzen muss.

## Beschreibung

Der Lernplan-Anlageflow bekommt die Option "Plan automatisch berechnen". Nutzer geben Themen/Aufgaben, Aufwand, Schwierigkeit und verfuegbare Lernzeit ein. Der berechnete Plan wird gespeichert und angezeigt.

## Akzeptanzkriterien

- [ ] Nutzer kann zwischen leerem Plan und automatisch berechnetem Plan waehlen.
- [ ] Eingaben fuer Themen, Aufwand, Schwierigkeit und Lernzeit sind moeglich.
- [ ] Algorithmus erzeugt Aufgaben oder Lerneinheiten mit Faelligkeiten.
- [ ] Ergebnis wird vor oder nach Speicherung nachvollziehbar angezeigt.
- [ ] Nutzer kann berechnete Aufgaben danach bearbeiten.

## Umsetzungshinweise

Kann zunaechst mit einem einfachen mehrstufigen Formular umgesetzt werden.

## Testing / Verifikation

- [ ] Beispielplan anlegen und Ergebnis pruefen.
- [ ] Seite neu laden und gespeicherte Aufgaben pruefen.

## Abhaengigkeiten

- Blockiert durch: D2, D3, G2.

## Schaetzung

Team-Schaetzung: offen

## G4 - Algorithmische Umplanung offener Aufgaben integrieren

## User Story

Als Studierender moechte ich offene Aufgaben neu verteilen lassen, wenn ich hinter dem Plan liege, damit mein Lernplan realistisch bleibt.

## Beschreibung

In der Lernplan-Detailansicht kann eine Neuplanung ausgeloest werden. Nur offene Aufgaben werden neu verteilt; erledigte Aufgaben bleiben unveraendert.

## Akzeptanzkriterien

- [ ] Button/Aktion "Plan neu verteilen" ist in der Lernplanansicht vorhanden.
- [ ] Nur offene Aufgaben erhalten neue Faelligkeiten.
- [ ] Erledigte Aufgaben bleiben unveraendert.
- [ ] Neue Verteilung beruecksichtigt verbleibende Zeit bis zum Zieldatum.
- [ ] Nutzer sieht das Ergebnis und kann Aufgaben weiter manuell bearbeiten.

## Umsetzungshinweise

Kann dieselbe Kernfunktion wie G2 nutzen, aber mit bestehendem Aufgabenstatus.

## Testing / Verifikation

- [ ] Lernplan mit erledigten und offenen Aufgaben neu planen.
- [ ] Erledigte Aufgaben behalten Datum und Status.
- [ ] Offene Aufgaben werden plausibel verteilt.

## Abhaengigkeiten

- Blockiert durch: D3, G2.

## Schaetzung

Team-Schaetzung: offen

---

# Epic H: Demo, Tests und Stabilisierung

## H1 - Demonstrationsdaten fuer Praesentation vorbereiten

## User Story

Als Projektteam moechten wir verlaessliche Demodaten haben, damit die zentrale Live-Demo ohne langes manuelles Setup funktioniert.

## Beschreibung

Es werden Beispieldaten fuer Nutzer, Lernplaene, Aufgaben und Termine vorbereitet. Diese koennen lokal eingespielt oder per Seed erzeugt werden.

## Akzeptanzkriterien

- [ ] Demo-Nutzer ist definiert.
- [ ] Mindestens zwei Lernplaene mit Aufgaben existieren.
- [ ] Kalender enthaelt Vorlesung, Zieltermin, Lerneinheit und sonstigen Termin.
- [ ] Mindestens ein Beispiel zeigt algorithmische Planung.
- [ ] Seed/Setup ist dokumentiert.

## Umsetzungshinweise

Moeglicher Pfad: `prisma/seed.ts` oder separates Demo-Skript.

## Testing / Verifikation

- [ ] Frischer lokaler Stand kann mit Demodaten befuellt werden.
- [ ] Dashboard, Kalender und Lernplaene zeigen sinnvolle Inhalte.

## Abhaengigkeiten

- Blockiert durch: B3, D2, D3, E2.

## Schaetzung

Team-Schaetzung: offen  
Vorschlag: `3`

## H2 - Manuellen Abnahmetest fuer MVP-Flows dokumentieren

## User Story

Als Projektteam moechten wir die wichtigsten MVP-Flows manuell testen, damit wir vor der Abgabe wissen, ob die Demo stabil ist.

## Beschreibung

Eine kurze Testcheckliste wird erstellt und vor wichtigen Meilensteinen ausgefuehrt. Sie deckt Login, Lernplan, Aufgaben, Kalender, Dashboard und algorithmische Planung ab.

## Akzeptanzkriterien

- [ ] Testcheckliste liegt im Repository.
- [ ] UC1 bis UC6 aus dem PRD sind abgedeckt.
- [ ] Testergebnis kann pro Durchlauf dokumentiert werden.
- [ ] Kritische Fehler werden als Issues erfasst.

## Umsetzungshinweise

Moeglicher Pfad: `docs/testing/manual-acceptance-test.md`.

## Testing / Verifikation

- [ ] Checkliste einmal mit Demodaten durchlaufen.

## Abhaengigkeiten

- Blockiert durch: zentrale MVP-Funktionen.

## Schaetzung

Team-Schaetzung: 2

## H3 - Setup-Dokumentation fuer finalen Stand aktualisieren

## User Story

Als externer Betrachter moechte ich LearnHub anhand der README lokal starten koennen, damit der Projektstand nachvollziehbar ist.

## Beschreibung

Die Setup-Anleitung wird auf den finalen Entwicklungsstand gebracht, inklusive Installation, Umgebungsvariablen, Datenbank, Migration, Seed und Start der App.

## Akzeptanzkriterien

- [ ] README beschreibt Installation und Start.
- [ ] Datenbank-Setup ist enthalten.
- [ ] Migration und Seed sind enthalten, falls genutzt.
- [ ] Bekannte Einschraenkungen des MVP sind genannt.
- [ ] Anleitung wurde auf einem zweiten Rechner oder frischen Checkout geprueft.

## Umsetzungshinweise

Relevant: `README.md`, `docs/tech-stack.md`.

## Testing / Verifikation

- [ ] Frischer Checkout startet anhand der Anleitung.

## Abhaengigkeiten

- Blockiert durch: B2, B3, H1.

## Schaetzung

Team-Schaetzung: offen

---

# Epic I: Optional / Could-Have

## I1 - KI-Check fuer bestehende Lernplaene konzipieren

## User Story

Als Studierender moechte ich optional Feedback zu meinem berechneten Lernplan erhalten, damit ich Engstellen oder unplausible Verteilungen erkenne.

## Beschreibung

Dieses Ticket klaert nur das Konzept der optionalen KI-Erweiterung. Die KI erstellt nicht den Kernplan, sondern prueft einen bereits algorithmisch erzeugten Plan und gibt Hinweise.

## Akzeptanzkriterien

- [ ] Eingaben an die KI sind definiert.
- [ ] Erwartete Rueckgabe ist definiert.
- [ ] Datenschutz- und API-Key-Annahmen sind dokumentiert.
- [ ] Feature ist eindeutig als Could-Have markiert.

## Umsetzungshinweise

Nur bearbeiten, wenn Must-Haves stabil sind.

## Testing / Verifikation

- [ ] Konzept im Team abgestimmt.

## Abhaengigkeiten

- Blockiert durch: G2, G3.

## Schaetzung

Team-Schaetzung: offen

## I2 - KI-Check prototypisch implementieren

## User Story

Als Studierender moechte ich einen bestehenden Lernplan optional pruefen lassen, damit ich Verbesserungsvorschlaege bekomme.

## Beschreibung

Ein bestehender Lernplan wird an eine optionale KI-Schnittstelle gegeben. Die Antwort wird als unverbindliche Empfehlung angezeigt und veraendert den Plan nicht automatisch.

## Akzeptanzkriterien

- [ ] KI-Check ist nur sichtbar oder nutzbar, wenn Konfiguration vorhanden ist.
- [ ] Bestehender Plan wird nicht automatisch veraendert.
- [ ] Nutzer sieht Hinweise oder Fehlermeldung verstaendlich.
- [ ] Kernfluss funktioniert weiterhin ohne KI-Konfiguration.

## Umsetzungshinweise

Optional. Nicht fuer den MVP-Projektplan fest einplanen, solange Must-Haves offen sind.

## Testing / Verifikation

- [ ] Ohne API-Key bleibt App nutzbar.
- [ ] Mit API-Key wird Beispielplan geprueft.

## Abhaengigkeiten

- Blockiert durch: I1, G3.

## Schaetzung

Team-Schaetzung: offen

## I3 - KI-gestuetzte Aufgabenextraktion aus Lernmaterialien konzipieren

## User Story

Als Studierender moechte ich optional aus hochgeladenen Arbeitsblaettern oder Lernmaterialien moegliche Aufgaben vorschlagen lassen, damit ich Lerninhalte schneller in einen Lernplan uebertragen kann.

## Beschreibung

Dieses Ticket klaert nur das Konzept einer optionalen KI-Erweiterung. Die KI liest keine verbindliche Planung aus, sondern schlaegt moegliche Tasks/ToDos vor, die der Nutzer pruefen und einem Lernplan hinzufuegen kann.

## Akzeptanzkriterien

- [ ] Unterstuetzte Materialtypen sind grob definiert, z. B. PDF oder Bild.
- [ ] Erwartete KI-Ausgabe ist definiert, z. B. Aufgaben mit Titel, Aufwandsvorschlag und optionaler Beschreibung.
- [ ] Nutzer muss vorgeschlagene Aufgaben pruefen und aktiv uebernehmen.
- [ ] Datenschutz- und API-Key-Annahmen sind dokumentiert.
- [ ] Feature ist eindeutig als Could-Have markiert.

## Umsetzungshinweise

Nur bearbeiten, wenn Must-Haves stabil sind. Dieses Ticket ist eine alternative oder ergaenzende KI-Idee zu I1/I2.

## Testing / Verifikation

- [ ] Konzept im Team abgestimmt.
- [ ] Beispielmaterial und beispielhafte erwartete Aufgaben sind dokumentiert.

## Abhaengigkeiten

- Blockiert durch: D3, G3.

## Schaetzung

Team-Schaetzung: offen

---
