# LearnHub Projektplan

Stand: 2026-05-18  
Abgabe: Projektmanagement, Projektplan bis 2026-05-19

## GitHub Project

Der Projektplan wird im GitHub Project des Repositories gepflegt:

[LearnHub GitHub Project](https://github.com/users/Fabsi07/projects/3)

Das Project bildet den aktuellen Projektplan ueber GitHub Issues ab. Die Issues enthalten User Story, Beschreibung, Akzeptanzkriterien, Umsetzungshinweise, Verifikation, Abhaengigkeiten und eine Schaetzung, sofern diese bereits final im Team abgestimmt wurde.

Da wir in Github keine Klarnamen verwenden, hier die Aufschlüsselung der Github-Usernames:

| Github-Username | Klarname            |
| --------------- | ------------------- |
| Brati10         | Lucas Sedelmayr     |
| Fabsi07         | Fabian Winterhalter |
| Finnbimb        | Finn Pfleghaar      |
| Lennard79       | Lennard Wiek        |
| Lostthetige     | Yannik Roeder       |

## Planungsstand

Die Projektplanung ist issue-basiert aufgebaut. Bereits vollstaendig besprochene und geschaetzte Tickets sind als normale Issues angelegt. Noch nicht final besprochene Tickets sind im Titel mit `[DRAFT]` markiert und koennen sich in Umfang, Zustaendigkeit oder Schaetzung noch aendern.

Die alten Planungs- und Meilenstein-1-Issues wurden bereinigt oder geschlossen. Das GitHub Project soll dadurch den aktuellen Arbeitsstand zeigen und nicht mehr alte Sammelaufgaben aus der Startphase als aktive Umsetzung darstellen.

## Schaetzskala

Wir verwenden eine Story-Point-Skala, die sich an der erwarteten Bearbeitungszeit orientiert:

| Punkte | Bedeutung                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------- |
| 1      | In einer kurzen Session bis maximal 2 Stunden machbar.                                         |
| 2      | In einer langen Session bis maximal 4 Stunden machbar.                                         |
| 3      | In maximal 2 langen Sessions machbar.                                                          |
| 5      | Mehr als 2 lange Sessions, aber ungefaehr innerhalb einer Woche mit mehreren Sessions machbar. |
| 8      | Nicht mehr sinnvoll innerhalb einer Woche machbar; sollte aufgeteilt werden.                   |

## Rollen im Team

| Rolle                                                         | Personen                      |
| ------------------------------------------------------------- | ----------------------------- |
| Projektleitung und Koordination                               | Lucas                         |
| Design / UX                                                   | Lennard, Lucas unterstuetzend |
| Frontend-Entwicklung                                          | Finn, Yannik                  |
| Backend-Entwicklung, Datenmodell, API, Auth und Planungslogik | Fabi, Yannik                  |
| Code-Reviews, Tests und Dokumentation                         | Gesamtes Team                 |

Die Rollen sind bewusst flexibel gehalten, damit Aufgaben je nach Projektphase und Verfuegbarkeit sinnvoll verteilt werden koennen.

## Struktur des Plans

Die Issues sind fachlich in groessere Themenbereiche gegliedert:

- Anforderungen, Planung und Projektmanagement
- Datenmodell und Persistenz
- Authentifizierung und Nutzerkontext
- Lernplaene und Aufgaben
- Kalender
- Dashboard
- Algorithmische Lernplanung
- Demo, Tests und Stabilisierung
- Optionale Could-Have-Erweiterungen

Die Priorisierung orientiert sich am PRD in `docs/prd.md`. Must-Have-Funktionen bilden den verbindlichen MVP-Umfang. Should-Have-Funktionen werden umgesetzt, wenn der Kernumfang stabil ist. Could-Have-Funktionen, insbesondere KI-Funktionen, sind nicht Teil des verbindlichen MVP-Kerns.

## Anmerkungen

Der aktuelle Projektplan ist ein lebendes Planungsartefakt. Aenderungen und neue Erkenntnisse werden weiterhin ueber GitHub Issues und das GitHub Project dokumentiert. Ein Teil der Umsetzungstickets ist bereits final geschaetzt und bearbeitungsbereit; weitere Tickets sind bewusst als Draft markiert, bis sie im Team fachlich und zeitlich final abgestimmt wurden.
