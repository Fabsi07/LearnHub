# Projektstands- und Konsistenzanalyse

Stand: 2026-05-18  
Fokus: Abgleich zwischen aktuellem Repository-Zustand, `docs/prd.md`, GitHub Issues und Projektmanagement-Dokumentation.

Update nach Aufraeumen am 2026-05-18:

- `docs/tech-stack.md` wurde auf den tatsaechlichen Stack aktualisiert.
- `AGENTS.md` und `CLAUDE.md` wurden an den aktuellen Codezustand angeglichen.
- GitHub Issue E1 wurde aktualisiert, sodass der bestehende DHBW-ICS-Abruf beruecksichtigt ist.
- Die fehlenden PRD-Should-Haves S1, S2 und S5 wurden als Draft-Issues #59, #60 und #61 angelegt.

## Kurzfazit

Das PRD und die neu angelegten GitHub Issues sind inhaltlich weitgehend konsistent. Die zentrale Produktentscheidung aus dem Teammeeting ist sauber abgebildet: algorithmische Lernplanung ist Kernumfang, KI ist nur Could-Have. Die groessten Abweichungen liegen nicht zwischen PRD und Issues, sondern zwischen aktueller Implementierung und Dokumentation: einige Dokumente beschreiben noch einen frueheren Scaffold-Zustand oder einen noch unentschiedenen Tech-Stack, waehrend der Code bereits Kalender, Settings, Notifications und eine `(app)`-Route-Group enthaelt.

## Aktueller Implementierungsstand

Vorhanden:

- Next.js 15 App-Router-Struktur mit `(app)`-Layout und `DashboardShell`.
- Login-Seite als UI-Stub; Submit leitet ohne echte Authentifizierung auf `/dashboard`.
- Dashboard-Route, aktuell nur leerer Platzhalter.
- Kalenderseite mit Tages-, Wochen- und Monatsansicht.
- Externer DHBW-ICS-Abruf ueber `/api/calendar/external` mit Retry, Timeout und In-Memory-Cache.
- Read-only externe Kalendertermine werden in Kalenderansichten angezeigt.
- Settings-Seite mit Profil-, Benachrichtigungs- und Kalender-Tab als UI/Mock.
- Notifications-Seite mit Mock-Daten, Filter, Suche und lokalem UI-State.

Noch nicht vorhanden:

- Echtes Nutzerkonto, Registrierung, Login, Logout und Session-Schutz.
- Prisma-Modelle, Migrationen und persistente Speicherung.
- Lernplan-Uebersicht, Lernplan-CRUD und Aufgabenverwaltung.
- Algorithmische Lernplan-Erstellung und Umplanung.
- Dashboard mit echten Aufgaben, Terminen und Lernplaenen.
- Setup-Dokumentation fuer Datenbank, Migrationen und finalen Betrieb.
- Tests oder dokumentierte manuelle Abnahmetests.

## PRD vs. Umsetzung

| PRD-Punkt | Status im Code | Einordnung |
| --- | --- | --- |
| M1 Nutzerkonto und Anmeldung | UI-Stub vorhanden, Auth deaktiviert | Offen; passend durch Issues C1-C3 abgedeckt. |
| M2 Dashboard als Startseite | Route und Shell vorhanden, Inhalt leer | Offen; passend durch Issue F1 abgedeckt. |
| M3 Lernplaene anlegen und verwalten | Nicht implementiert | Offen; passend durch D1-D2 abgedeckt. |
| M4 Aufgaben innerhalb eines Lernplans | Nicht implementiert | Offen; passend durch D3 abgedeckt. |
| M5 Kalenderansicht | Ansicht vorhanden, externe Termine read-only; keine persistente manuelle Terminpflege | Teilweise umgesetzt; E1-E3 decken den fehlenden Daten-/Persistenzteil ab. |
| M6 Algorithmische Lernplan-Erstellung | Nicht implementiert | Offen; passend durch G1-G3 abgedeckt. |
| M7 Algorithmische Umplanung | Nicht implementiert | Offen; passend durch G4 abgedeckt. |
| M8 Lokaler Betrieb | Minimal-README vorhanden; Datenbank-Setup fehlt | Teilweise; B2/H3 decken Dokumentationsluecken ab. |

## PRD vs. GitHub Issues

Gut konsistent:

- KI ist im PRD als Could-Have markiert und in den Issues I1-I3 ebenfalls als Draft/Could-Have gekennzeichnet.
- Algorithmische Planung ist im PRD Must-Have und in G1-G4 als eigener Kernblock angelegt.
- Auth, Datenmodell, Lernplaene, Aufgaben, Dashboard und Kalenderpersistenz sind als Must-Have-nahe Umsetzungstickets vorhanden.
- A3 wurde geschlossen; alte M1-/Sammel-Issues sind nicht mehr als aktuelle Arbeit sichtbar.

Auffaelligkeiten vor dem Aufraeumen:

- PRD S1 "Verknuepfung von Aufgaben und Kalendereintraegen" hatte kein eigenes Issue. Erledigt durch #59.
- PRD S2 "Filter und Suche im Kalender" hatte kein klares eigenes Issue. Erledigt durch #60.
- PRD S5 "Transparenz der Planungslogik" war teilweise durch G1 vorbereitet, hatte aber kein eigenes UI-/Integrationsissue. Erledigt durch #61.
- Notifications und Settings sind bereits als Mock-Oberflaechen implementiert, stehen aber nicht als eigener Kernumfang im PRD. Das ist nicht zwingend falsch, sollte aber als Prototyp-/Nebenfunktion verstanden werden.
- Die Settings-Seite enthaelt einen "Stundenplan importieren"-Mock. Externer Stundenplanimport ist im PRD als Could-Have bzw. Ausblick eingeordnet; der aktuelle ICS-Abruf sollte daher als technische Kalenderintegration/Prototyp gekennzeichnet werden, nicht als erledigtes MVP-Feature.

## Dokumentationsabweichungen

| Datei | Abweichung | Empfehlung |
| --- | --- | --- |
| `README.md` | Nur zwei Setup-Zeilen; reicht nicht fuer PRD-Abnahme und H3. | Spaeter mit Datenbank-, Migration-, Seed- und Startanleitung ersetzen. |
| `docs/tech-stack.md` | Beschrieb Next.js nur als optional und Backend/Datenhaltung als offen. | Erledigt: Datei ist auf den aktuellen Stack aktualisiert. |
| `AGENTS.md` | Sagte "early-stage scaffold" und listete teils alte Routen ohne `(app)`-Route-Group. | Erledigt: Status, Routenstruktur und API-Hinweise aktualisiert. |
| `CLAUDE.md` | Nannte Prisma 7 pauschal; `@prisma/client` ist aktuell 5.22.0, Prisma CLI 7.8.0. | Erledigt: Versionen praezisiert. |
| `docs/project-management/issue-backlog-draft.md` | Entwurf ist durch GitHub Issues teilweise ueberholt; manche Issues dort offen, in GitHub bereits geschlossen oder anders formuliert. | Als Entwurf belassen, aber nicht als fuehrende Quelle verwenden. |

## Issue-spezifische Hinweise

- Issue E1 sagte, die Kalenderkomponenten arbeiten aktuell mit Dummy-Events. Erledigt: Issue wurde auf externen DHBW-ICS-Abruf plus fehlende persistente lokale Termine aktualisiert.
- Issue B1 ist weiterhin korrekt, weil `prisma/schema.prisma` noch keine Modelle enthaelt.
- Issue C1 ist weiterhin korrekt, weil `src/middleware.ts` Auth explizit deaktiviert und `LoginForm` nur weiterleitet.
- Issues I1-I3 sind sauber als Draft/Could-Have markiert und kollidieren nicht mit dem PRD.
- Viele Issues ab B3/C2 sind noch Draft und ungeschaetzt. Das passt zum dokumentierten Zwischenstand, sollte fuer den Projektplan aber klar erklaert werden.

## Technische Verifikation

- `npm run lint` konnte wegen einer kaputten lokalen npm-Installation nicht starten: `npm-cli.js` wurde im globalen npm-Pfad nicht gefunden.
- Direkter ESLint-Aufruf ueber `node_modules` startet, bricht aber wegen fehlender ESLint-Konfiguration ab.
- Der Git-Status war zu Beginn sauber auf `main...origin/main`.

## Empfohlene naechste Schritte

1. Projektplan-README fuer Moodle abgeben und darin erklaeren, dass das GitHub Project die fuehrende Planung ist.
2. Issue #32 zur Moodle-README nach finalem Check schliessen.
3. Root-`README.md` spaeter im Rahmen von H3 durch eine echte Setup-Dokumentation ersetzen.
4. ESLint-/npm-Konfiguration reparieren, damit `npm run lint` wieder als Qualitaetssignal nutzbar ist.
5. Mock-Funktionen in Settings/Notifications bei spaeterer Umsetzung entweder anbinden oder klar als Prototyp markieren.
