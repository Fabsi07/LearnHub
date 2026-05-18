# Product Requirements Document — LearnHub

| Feld                    | Inhalt                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Projekt**             | LearnHub — Lernmanagement-App für Studierende                                                                                                                           |
| **Auftraggeber**        | Prof. Dr. Erik Behrends                                                                                                                                                 |
| **Team**                | Lucas Sedelmayr (Projektleitung), Lennard Wiek (Design), Yannik Roeder (Design / Entwicklung), Finn Pfleghaar (Design / Entwicklung), Fabian Winterhalter (Entwicklung) |
| **Datum**               | 2026-05-17                                                                                                                                                              |
| **Version**             | 1.1 — abgestimmter Entwurf mit algorithmischer Lernplanung                                                                                                              |
| **Status**              | Arbeitsgrundlage für Meilenstein 2                                                                                                                                      |
| **Präsentationstermin** | 2026-05-21                                                                                                                                                              |

---

## 1. Management Summary

LearnHub ist eine webbasierte Lernmanagement-Anwendung für Studierende. Sie bündelt drei Aufgaben, die Studierende heute auf mehrere Tools verteilen — die Übersicht über anstehende Aufgaben, die Planung von Lernstoff für Veranstaltungen und Fristen sowie die Verwaltung von Vorlesungs- und Prüfungsterminen — in einer einzigen Oberfläche. Kern der Anwendung ist eine nachvollziehbare, deterministische Planungslogik, die aus Veranstaltung/Fach, Zieldatum, Lernstoff, geschätztem Aufwand, Schwierigkeit und verfügbarer Lernzeit einen konkreten Lernplan berechnet und bei Änderungen neu verteilt.

Optional kann eine KI-Funktion als Erweiterung genutzt werden, um bereits erstellte Lernpläne zu prüfen, Verbesserungsvorschläge zu geben oder aus hochgeladenen Materialien mögliche Aufgaben vorzuschlagen. Die eigentliche Lernplan-Erstellung bleibt jedoch bewusst algorithmisch, damit Ergebnisse reproduzierbar, erklärbar und unabhängig von externen KI-Diensten sind.

Dieses Dokument beschreibt den vollständigen Funktionsumfang, den das Team im Rahmen des Projekts liefert, sowie die Funktionen, die ausdrücklich nicht Teil des verbindlichen Lieferumfangs sind. Es dient als Arbeitsgrundlage für die Abstimmung im Team und mit dem Auftraggeber.

---

## 2. Ausgangslage und Problemstellung

Studierende organisieren ihren Lernalltag heute typischerweise mit einer Kombination aus generischen Tools: Papierkalendern, allgemeinen Aufgaben-Apps, Notizprogrammen und den jeweiligen Lernplattformen ihrer Hochschule. Keines dieser Werkzeuge ist auf die Besonderheiten studentischer Lernplanung zugeschnitten:

- Generische Kalender kennen weder Zieltermine noch Lernstoff und können daher keine sinnvolle Verteilung von Lernzeit vorschlagen.
- Aufgaben-Apps gewichten Tasks nicht nach Terminnähe, Aufwand oder Schwierigkeit und unterstützen keine zeitliche Verteilung über mehrere Wochen.
- Bei Verzögerungen — etwa weil ein Lernabschnitt länger gedauert hat — muss der gesamte Plan manuell umgestellt werden.

Daraus entsteht in der Praxis eine fehleranfällige Planung, häufiges manuelles Umorganisieren und das Risiko, Themen vor einem wichtigen Zieltermin unzureichend abzudecken.

LearnHub adressiert diese Lücke mit einem studienspezifischen Werkzeug, das Veranstaltungen, Zieltermine, Lernstoff, Vorlesungen und ToDos in einem gemeinsamen Modell führt und daraus anhand transparenter Regeln eine realistische Lernplanung ableitet.

---

## 3. Zielgruppe

**Primäre Nutzergruppe:** Studierende an Hochschulen und Universitäten, die regelmäßig für Veranstaltungen, Prüfungen, Abgaben oder selbst gesetzte Lernziele planen und mehrere Fächer parallel im Blick behalten müssen. Annahmen:

- Wechseln zwischen Lehrveranstaltungen, Selbstlernzeit und Prüfungsphasen.
- Nutzen die Anwendung im Browser am Laptop oder Desktop-PC.
- Sind bereit, Veranstaltung/Fach, Zieldatum, Themen, geschätzten Aufwand, Schwierigkeit und verfügbare Lernzeit einzugeben, wenn daraus ein strukturierter Lernplan entsteht.
- Erwarten ein modernes, übersichtliches Interface ohne Einarbeitungszeit.

**Sekundäre Überlegung:** Im Rahmen des Hochschulprojekts ist die Anwendung für ein einzelnes Studierenden-Setup ausgelegt. Sie ist nicht für den Einsatz in Lerngruppen, durch Dozierende oder als institutionelles Werkzeug konzipiert.

---

## 4. Produktvision

LearnHub soll für Studierende der zentrale Ort werden, an dem ihre Lernorganisation passiert. Wenn ein Studierender LearnHub öffnet, sieht er auf einen Blick, was heute und in den nächsten Tagen ansteht, welche Zieltermine näher rücken und wo es Handlungsbedarf gibt. Beim Anlegen eines Lernplans gibt der Studierende Veranstaltung/Fach, Zieldatum, Zieltyp, Lernaufgaben, Aufwand, Schwierigkeit und verfügbare Lernzeiten ein. LearnHub berechnet daraus einen nachvollziehbaren Plan, den der Studierende übernehmen, bearbeiten oder später neu verteilen lassen kann.

Die Anwendung versteht sich nicht als Notizprogramm und nicht als Lernplattform, sondern als **Planungs- und Übersichtswerkzeug**: Sie ersetzt das händische Verwalten von Lernplänen, nicht die Lerninhalte selbst.

---

## 5. Ziele und Erfolgsmessung

### Projektziele

1. Bereitstellung einer lauffähigen Webanwendung bis zum Präsentationstermin, die alle in §6 als „Must-Have" gekennzeichneten Funktionen abdeckt.
2. Demonstration eines durchgängigen Nutzungsflusses — von der Anmeldung über das Anlegen eines algorithmisch berechneten Lernplans bis zur Anzeige der zugehörigen Lerneinheiten im Kalender — in einer Live-Vorführung.
3. Lieferung einer technisch dokumentierten Codebasis, die nach Projektabschluss weiterentwickelt werden könnte.

### Erfolgskriterien für die Abnahme

| Kriterium                       | Erfolgsmaß                                                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| End-to-End-Fluss demonstrierbar | Anmeldung, Lernplan-Erstellung, algorithmische Planung, Kalenderansicht und Aufgaben-Abhaken funktionieren in einer ununterbrochenen Live-Vorführung. |
| Funktionsabdeckung Must-Have    | Alle in §6.1 gelisteten Funktionen sind implementiert und manuell verifiziert.                                                                        |
| Bedienbarkeit                   | Ein Studierender ohne Vorerfahrung kann mit der Anwendung ohne Anleitung einen Lernplan anlegen.                                                      |
| Nachvollziehbarkeit             | Die automatische Planung basiert auf klar beschriebenen Regeln und liefert bei gleichen Eingaben reproduzierbare Ergebnisse.                          |
| Stabilität                      | Die Anwendung läuft während der Präsentation reproduzierbar ohne Fehlerabbrüche.                                                                      |
| Dokumentation                   | Setup-Anleitung, dieses PRD, Designdokumentation und ein kurzer Architekturüberblick liegen im Repository vor.                                        |

---

## 6. Funktionsumfang

Der Funktionsumfang ist nach dem MoSCoW-Prinzip priorisiert. **Must-Have**-Funktionen sind verbindlicher Lieferumfang. **Should-Have**-Funktionen werden umgesetzt, wenn die Must-Haves stabil und zeitlich Raum vorhanden ist. **Could-Have**-Funktionen werden bewusst zurückgestellt und sind in §9 (Nicht-Ziele) oder §16 (Ausblick) verortet.

### 6.1 Must-Have (verbindlicher Lieferumfang)

**M1 — Nutzerkonto und Anmeldung**
Studierende können sich mit E-Mail und Passwort registrieren und anmelden. Jeder Nutzer sieht ausschließlich seine eigenen Daten. Die Anmeldung bleibt optional über eine Sitzung erhalten („eingeloggt bleiben"). Es gibt eine Abmeldung. Der konkrete Auth-Flow für das MVP ist in [docs/auth-concept.md](./auth-concept.md) beschrieben.

**M2 — Dashboard als Startseite**
Nach der Anmeldung landet der Nutzer auf einem Dashboard. Es zeigt:

- die nächsten anstehenden Aufgaben über alle Lernpläne hinweg,
- die heutigen und morgigen Kalendertermine,
- einen Schnellzugriff auf alle aktiven Lernpläne.

**M3 — Lernpläne anlegen und verwalten**
Ein Lernplan bündelt das Lernen für eine konkrete Veranstaltung, ein Fach oder ein Lernziel. Er hat einen Titel, eine Veranstaltung/ein Fach, eine Beschreibung, einen Zieltyp und ein Zieldatum. Der Zieltyp kann zum Beispiel Klausur, Abgabe, Präsentation, Selbstlernziel oder Sonstiges sein. Ein Nutzer kann beliebig viele Lernpläne anlegen, bearbeiten und löschen.

**M4 — Aufgaben innerhalb eines Lernplans**
Jeder Lernplan enthält Aufgaben (zum Beispiel „Kapitel 3 durcharbeiten" oder „Übungsblatt 2 rechnen"). Aufgaben haben einen Titel, einen geschätzten Zeitaufwand, eine subjektive Schwierigkeit, ein Fälligkeitsdatum und einen Erledigungsstatus. Aufgaben können manuell hinzugefügt, bearbeitet, abgehakt und gelöscht werden.

**M5 — Kalenderansicht**
Eine eigene Kalenderseite zeigt Termine wahlweise als Tages-, Wochen- oder Monatsansicht. Termine umfassen:

- Vorlesungen und Lehrveranstaltungen,
- Zieltermine wie Klausuren, Abgaben oder Präsentationen,
- vom Nutzer eingetragene Lerneinheiten,
- sonstige Termine.

Termine können manuell angelegt, bearbeitet, verschoben und gelöscht werden. Termine sind farblich nach Typ unterscheidbar.

**M6 — Algorithmische Lernplan-Erstellung**
Beim Anlegen eines Lernplans kann der Nutzer wählen, ob er den Plan leer beginnt oder automatisch berechnen lässt. Für die automatische Berechnung gibt er an:

- die Veranstaltung / das Fach,
- das Zieldatum,
- den Zieltyp,
- die Liste der zu lernenden Themen oder Aufgaben,
- den geschätzten Zeitaufwand je Thema oder Aufgabe,
- die subjektive Schwierigkeit je Thema oder Aufgabe,
- die ungefähr verfügbare Lernzeit pro Woche oder pro Tag,
- optionale Sperrzeiten oder bevorzugte Lerntage.
  Anmerkung: diese Eingabeparameter sind noch nicht final und werden bei der Konzipierung des Algorithmus besprochen und festgelegt.

Die Anwendung berechnet daraus eine Liste konkreter Aufgaben oder Lerneinheiten mit Fälligkeitsdaten und geschätzten Bearbeitungszeiten. Die Berechnung erfolgt deterministisch anhand festgelegter Regeln, zum Beispiel nach verbleibender Zeit bis zum Zieldatum, Aufwand, Schwierigkeit und gleichmäßiger Verteilung. Der Nutzer kann den berechneten Plan anschließend frei bearbeiten.

**M7 — Algorithmische Umplanung**
Wenn ein Nutzer hinter seinem Plan zurückfällt oder sich Termine verschieben, kann er für einen Lernplan eine Neuplanung auslösen. LearnHub verteilt alle noch offenen Aufgaben über den verbleibenden Zeitraum bis zum Zieldatum neu, unter Berücksichtigung der verfügbaren Lernzeit, des geschätzten Aufwands und der Schwierigkeit. Bereits erledigte Aufgaben bleiben unverändert.

**M8 — Lokaler Betrieb**
Die Anwendung ist auf einem lokalen Entwicklungsrechner über einen dokumentierten Setup-Vorgang startbar. Ein Hosting im Internet ist im MVP nicht vorgesehen.

### 6.2 Should-Have (sofern Zeit verbleibt)

**S1 — Verknüpfung von Aufgaben und Kalendereinträgen**
Aus einer Aufgabe heraus lässt sich direkt ein Kalender-Lernslot anlegen, der mit der Aufgabe verknüpft bleibt. Wird die Aufgabe abgehakt, ist die Verknüpfung sichtbar.

**S2 — Filter und Suche im Kalender**
Filterung der Kalenderansicht nach Termintyp (z. B. nur Zieltermine, nur Lerneinheiten).

**S3 — Erinnerung an überfällige Aufgaben**
Visuelle Hervorhebung überfälliger Aufgaben auf dem Dashboard.

**S4 — Demonstrationsdaten**
Eine Funktion zum Befüllen der Anwendung mit Beispieldaten für die Präsentation.

**S5 — Transparenz der Planungslogik**
Die Anwendung zeigt in einfacher Form an, warum Aufgaben an bestimmten Tagen liegen, zum Beispiel wegen hoher Schwierigkeit, nahem Zieldatum oder verfügbarer Lernzeit.

### 6.3 Could-Have (bewusst zurückgestellt)

Diese Funktionen sind im Sinne der Vollständigkeit erwähnt, aber **nicht** Teil des verbindlichen Lieferumfangs:

- KI-gestützte Prüfung eines bereits berechneten Lernplans mit Verbesserungsvorschlägen,
- KI-gestützte alternative Planvarianten,
- KI-gestützte Extraktion möglicher Aufgaben aus hochgeladenen Arbeitsblättern oder Lernmaterialien,
- Statistikansicht über gelernte Stunden pro Fach,
- Wochenrückblick,
- Single-Sign-On mit DHBW-Login-Daten,
- Import von Stundenplänen aus externen Quellen (vor allem DHBW-Stundenplan),
- Lerngruppen-Funktion mit geteilten Lernplänen,
- Versand von Erinnerungs-Mails, Bestätigungs-Mails oder Passwort-Reset-Mails,
- allgemeiner Upload und Verwaltung von PDFs, Bildern oder anderen Materialien,
- Push-Benachrichtigungen im Browser.

---

## 7. Nutzungsabläufe (Use Cases)

Die folgenden Abläufe beschreiben den Lieferumfang aus Nutzersicht. Jeder Use Case ist Teil der Must-Have-Abdeckung.

### UC1 — Erstanmeldung

Eine Studierende öffnet LearnHub zum ersten Mal. Sie registriert sich mit ihrer Hochschul-E-Mail und einem Passwort, vergibt einen Anzeigenamen und wird im Anschluss direkt auf das Dashboard geleitet. Das Dashboard ist zu diesem Zeitpunkt leer und zeigt einen Hinweis, einen ersten Lernplan anzulegen.

### UC2 — Vorbereitung auf einen Zieltermin mit berechnetem Lernplan

Die Studierende möchte sich auf einen Zieltermin in ihrer Statistik-Veranstaltung in zehn Wochen vorbereiten. Sie legt einen neuen Lernplan an, wählt „Plan automatisch berechnen", trägt Veranstaltung/Fach, Zieldatum, Zieltyp, acht Themen, geschätzte Bearbeitungszeiten, subjektive Schwierigkeiten und sechs verfügbare Wochenstunden ein. Die Anwendung berechnet daraus einen Plan mit konkreten Aufgaben, die über die zehn Wochen verteilt sind, und speichert den Plan. Die Studierende öffnet den Plan, prüft die Verteilung und schiebt zwei Aufgaben manuell um eine Woche nach hinten.

### UC3 — Tägliche Übersicht

Am Folgetag öffnet die Studierende das Dashboard und sieht direkt die zwei für heute geplanten Lernaufgaben sowie die heutige Vorlesung. Sie öffnet die Kalenderansicht in der Wochendarstellung und prüft, an welchen Nachmittagen freie Zeitfenster für zusätzliche Lerneinheiten verbleiben.

### UC4 — Verzug und Umplanung

Nach zwei Wochen erkennt die Studierende, dass sie hinter ihrem Plan zurückliegt. Sie öffnet den betroffenen Lernplan und klickt auf „Plan neu verteilen". LearnHub verteilt die offenen Aufgaben über die verbleibenden acht Wochen bis zum Zieldatum neu, ohne bereits erledigte Aufgaben zu verschieben. Die neuen Fälligkeitsdaten sind anschließend im Plan und im Kalender sichtbar.

### UC5 — Termin manuell pflegen

Die Studierende erhält eine zusätzliche Sprechstunde beim Professor. Sie öffnet die Kalenderansicht, legt einen neuen Termin mit Titel, Uhrzeit und Termintyp „Sonstiges" an. Der Termin erscheint sofort in der Wochenansicht.

### UC6 — Abschluss einer Aufgabe

Nach Erledigung einer Lernaufgabe öffnet die Studierende das Dashboard oder den Lernplan und hakt die Aufgabe ab. Die Aufgabe wird als erledigt markiert und verschwindet aus der „Anstehend"-Liste auf dem Dashboard.

### UC7 — Optionaler KI-Check eines Lernplans

Falls die optionale KI-Erweiterung umgesetzt wird, kann die Studierende einen bereits berechneten Lernplan prüfen lassen. Die KI bewertet den Plan qualitativ, weist zum Beispiel auf zu eng geplante Wochen oder ungleich verteilte schwierige Themen hin und schlägt Anpassungen vor. Der ursprüngliche Plan wird nur geändert, wenn die Studierende die Vorschläge übernimmt.

---

## 8. Anforderungen

### 8.1 Funktionale Anforderungen

Die funktionalen Anforderungen ergeben sich aus dem Funktionsumfang in §6 und den Nutzungsabläufen in §7. Zentrale Anforderungen im Überblick:

- Jeder Nutzer sieht ausschließlich seine eigenen Lernpläne, Aufgaben und Termine.
- Lernpläne, Aufgaben und Termine sind persistent gespeichert und nach Abmeldung und erneutem Login unverändert verfügbar.
- Die automatische Lernplanung basiert auf reproduzierbaren Regeln und erzeugt bei gleichen Eingaben gleiche Ergebnisse.
- Die Planungslogik berücksichtigt mindestens Zieldatum, geschätzten Aufwand, Schwierigkeit, Erledigungsstatus und verfügbare Lernzeit.
- Die Umplanung verschiebt nur offene Aufgaben; erledigte Aufgaben bleiben unverändert.
- Die Kalenderansicht stellt Termine korrekt in Tages-, Wochen- und Monatsansicht dar.
- Beim Löschen eines Lernplans werden zugehörige Aufgaben mit gelöscht. Verknüpfte Kalendereinträge bleiben erhalten, verlieren aber ihre Verknüpfung zur Aufgabe.
- Optionale KI-Funktionen dürfen den Kernfluss nicht blockieren. Wenn keine KI-Konfiguration vorhanden ist, bleibt die algorithmische Planung vollständig nutzbar.

### 8.2 Nicht-funktionale Anforderungen

| Bereich                   | Anforderung                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Benutzbarkeit**         | Klare, intuitive Oberfläche im Stil moderner Webanwendungen. Hauptfunktionen über maximal zwei Klicks vom Dashboard erreichbar.                       |
| **Nachvollziehbarkeit**   | Die automatische Planung ist deterministisch und in der Dokumentation verständlich beschrieben.                                                       |
| **Reaktionszeit**         | Seitenwechsel, Datenoperationen und algorithmische Planberechnung antworten unter einer Sekunde auf einem normalen Entwicklungsrechner.               |
| **Sicherheit**            | Passwörter werden ausschließlich gehasht gespeichert. Sitzungen laufen über HTTP-Only-Cookies. Cross-User-Zugriff ist konsequent verhindert.          |
| **Datenschutz**           | Es werden ausschließlich für die Funktion notwendige Daten erhoben (E-Mail, Anzeigename, Lerninhalte). Keine externen Analyse- oder Tracking-Dienste. |
| **Zugänglichkeit**        | Tastaturbedienung für alle Kernfunktionen. Ausreichende Farbkontraste.                                                                                |
| **Browser-Unterstützung** | Aktuelle Versionen von Chrome, Firefox und Safari auf Desktop-Auflösungen.                                                                            |
| **Sprache**               | Benutzeroberfläche durchgängig auf Deutsch.                                                                                                           |

---

## 9. Nicht-Ziele

Die folgenden Funktionen und Eigenschaften sind ausdrücklich **kein** Bestandteil dieses Projekts. Sie werden hier aufgeführt, um Erwartungen klar zu setzen.

- **Kein Produktivbetrieb im Internet.** LearnHub läuft im Rahmen dieses Projekts ausschließlich lokal. Es gibt keinen Online-Zugang, kein Hosting und keine produktionsreife Infrastruktur.
- **Keine Mobile-Apps.** Die Anwendung ist webbasiert und für Desktop-Browser optimiert. Eine mobile Optimierung wird nicht zugesichert.
- **Keine Mehrnutzer- oder Gruppenfunktionen.** Es gibt keine geteilten Lernpläne, keine Lerngruppen, keinen Austausch zwischen Konten.
- **Keine Anbindung an Hochschul-Lernplattformen.** Es findet keine Synchronisation mit Moodle, Ilias oder vergleichbaren Systemen statt.
- **Kein Anwesenheits- oder Notenverwaltungs-Modul.** LearnHub bildet weder Anwesenheiten noch Noten ab.
- **Keine KI als verbindlicher Kernmechanismus.** Die Lernplan-Erstellung und Umplanung müssen ohne externe KI-Dienste funktionieren.

Funktionen, die hier nicht erwähnt sind, sollten im Zweifel als „nicht im Lieferumfang" verstanden und vor Bearbeitung mit dem Auftraggeber abgestimmt werden.

---

## 10. UX- und Design-Konzept

Die visuelle Konzeption ist in einem eigenen Dokument festgehalten: [docs/design/design.md](./design/design.md). Wireframes und Mockups werden iterativ über das Excalidraw-Board des Teams entwickelt und in den Wireframe-Ordner des Repositorys exportiert.

Leitlinien des Designs:

- **Klarheit vor Funktionsfülle.** Jede Ansicht beantwortet eine konkrete Frage des Nutzers („Was steht heute an?", „Wann ist mein nächster Zieltermin?", „Was muss ich für Statistik noch lernen?").
- **Konsistente Komponenten.** Buttons, Eingabefelder, Karten und Dialoge folgen einem einheitlichen Stil.
- **Wenig Farbe, gezielt eingesetzt.** Akzentfarben markieren Status (z. B. Zieltermine, überfällige Aufgaben), nicht Dekoration.
- **Lesbarkeit auf Hochschul-Laptops.** Schriftgrößen und Kontraste sind für Desktop-Auflösungen optimiert.
- **Vertrauen durch Transparenz.** Automatisch berechnete Pläne sollen so dargestellt werden, dass Nutzer sie prüfen und bei Bedarf manuell anpassen können.

---

## 11. Technologische Grundlagen

Eine ausführliche Begründung steht in [docs/tech-stack.md](./tech-stack.md). Zusammenfassung der gewählten Bausteine:

| Bereich                  | Technologie                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend-Framework       | Next.js 15 mit React 18 und TypeScript                                                                                                         |
| UI-Bibliothek            | Base UI in Verbindung mit Tailwind CSS                                                                                                         |
| Datenbank                | PostgreSQL, lokal über Docker                                                                                                                  |
| Datenzugriff             | Prisma ORM                                                                                                                                     |
| Planungslogik            | Eigener deterministischer Algorithmus in TypeScript                                                                                            |
| Optionale KI-Integration | OpenAI-API als mögliche Erweiterung zur Prüfung oder Verbesserung bestehender Pläne oder zur Extraktion möglicher Aufgaben aus Lernmaterialien |
| Authentifizierung        | Eigene minimale E-Mail/Passwort-Auth mit bcrypt-Hashing und DB-Sessions per HTTP-Only-Cookie — siehe [docs/auth-concept.md](./auth-concept.md) |
| Versionsverwaltung       | Git, Repository auf GitHub, Aufgabensteuerung über GitHub Projects                                                                             |

Die Auswahl wurde getroffen, um eine schnelle prototypische Entwicklung zu ermöglichen, einen modernen Stack abzubilden und gleichzeitig die Komplexität für ein Studierenden-Team handhabbar zu halten.

---

## 12. Projektorganisation

Die detaillierte Rollenverteilung liegt in [docs/roles.md](./roles.md). Verantwortlichkeiten im Überblick:

| Rolle                | Verantwortung                                                     | Personen                       |
| -------------------- | ----------------------------------------------------------------- | ------------------------------ |
| Projektleitung       | Koordination, Kommunikation mit dem Auftraggeber, Terminsteuerung | Lucas                          |
| Design / UX          | Wireframes, Mockups, Designsystem                                 | Lennard, Lucas (unterstützend) |
| Entwicklung Frontend | Umsetzung der Oberfläche und Datenanbindung                       | Yannik, Finn                   |
| Entwicklung Backend  | Datenmodell, API-Schnittstellen, Authentifizierung, Planungslogik | Fabi, Finn                     |
| Querschnitt          | Code-Reviews, Tests, Dokumentation                                | Gesamtes Team                  |

Die Zusammenarbeit erfolgt über regelmäßige Team-Treffen, ein Kanban-Board auf GitHub Projects und Pull-Request-basierte Entwicklung im Hauptrepository.

---

## 13. Zeitplan und Meilensteine

Der genaue Zeitplan wird laufend in GitHub Projects gepflegt. Die Meilensteine auf Projektebene:

| Meilenstein                              | Inhalt                                                                                                          | Status        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------- |
| **M1 — Projektstart**                    | Teamfindung, Rollenverteilung, erste Wireframes, technische Grundsatzentscheidungen, Repository-Setup           | abgeschlossen |
| **M2 — Frontend-Gerüst**                 | Lauffähiges Next.js-Projekt, Login-Maske, Dashboard-Shell, Kalenderansicht mit Beispieldaten                    | in Arbeit     |
| **M3 — Datenmodell und API**             | Datenbankschema, persistente Speicherung, Anbindung des bestehenden Frontends an reale Daten, Authentifizierung | in Arbeit     |
| **M4 — Planungslogik**                   | Algorithmische Lernplan-Erstellung und Umplanung im Lernplan- und Kalenderfluss verfügbar                       | offen         |
| **M5 — Optionale KI-Prüfung**            | Falls zeitlich möglich: KI-gestützte Prüfung oder Verbesserungsvorschläge für bestehende Lernpläne              | offen         |
| **M6 — Stabilisierung und Präsentation** | Fehlerbehebung, manuelle Abnahmetests, Demonstrationsdaten, Setup-Dokumentation, finale Präsentation            | offen         |

---

## 14. Abnahmekriterien

Die Anwendung gilt als abgenommen, wenn:

1. Alle in §6.1 als Must-Have gekennzeichneten Funktionen demonstrierbar sind.
2. Die in §7 beschriebenen Nutzungsabläufe UC1 bis UC6 in einer Live-Vorführung ohne Fehler durchlaufen werden.
3. Die algorithmische Lernplan-Erstellung und Umplanung anhand eines Beispiels nachvollziehbar demonstriert werden kann.
4. Die Anwendung auf einem unbeteiligten Rechner anhand der Setup-Anleitung im [README](../README.md) startbar ist.
5. Quellcode, Dokumentation und dieses PRD im Repository vorliegen.
6. Das Team eine Abschlusspräsentation hält, die Vorgehen, Architekturentscheidungen und Funktionsumfang erläutert.

---

## 15. Risiken und Annahmen

| #   | Risiko / Annahme                                                               | Auswirkung                                                                         | Umgang                                                                                                       |
| --- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | Der Funktionsumfang ist für die verfügbare Projektzeit zu groß.                | Verschiebung von Should-Have-Funktionen oder Reduktion einzelner Must-Haves nötig. | Wöchentliche Bewertung des Fortschritts; klare MoSCoW-Priorisierung bereits in §6.                           |
| 2   | Die algorithmische Planungslogik wird zu komplex.                              | Mehraufwand und schwer verständliches Verhalten für Nutzer.                        | Regeln bewusst einfach halten, zuerst MVP-Algorithmus definieren, danach nur gezielt verfeinern.             |
| 3   | Datenmodell-Detailentscheidungen ändern sich während der Umsetzung.            | Mehraufwand für Refactoring.                                                       | Frühzeitige Festlegung des Datenmodells im ersten Meilenstein der Umsetzungsphase.                           |
| 4   | Die automatisch berechneten Pläne wirken nicht realistisch genug.              | Wahrnehmung des Mehrwerts der Anwendung leidet.                                    | Manuelle Nachbearbeitung ermöglichen, Demodaten mit plausiblen Beispielen vorbereiten, Regeln dokumentieren. |
| 5   | Optionale KI-Funktionen können nicht rechtzeitig oder stabil umgesetzt werden. | Could-Have-Funktion entfällt.                                                      | KI nicht als Must-Have planen; Kernfluss bleibt vollständig ohne KI demonstrierbar.                          |
| 6   | Die Anwendung läuft nur auf den Geräten des Teams stabil.                      | Abnahmehürde.                                                                      | Setup-Dokumentation testweise auf einem teamfremden Rechner durchlaufen.                                     |

**Zentrale Annahmen, die dieses PRD trägt:**

- Der Auftraggeber stellt keine zusätzlichen technischen Vorgaben über das in §11 Beschriebene hinaus.
- Es wird kein Produktivbetrieb erwartet.
- Die Lernplan-Erstellung soll reproduzierbar und erklärbar sein.
- KI-Unterstützung ist optional und nur dann Teil der Demo, wenn der Kernumfang stabil umgesetzt ist.

---

## 16. Ausblick (außerhalb des Lieferumfangs)

Sollte LearnHub nach Projektabschluss weiterentwickelt werden, sind folgende Erweiterungen sinnvoll:

- Hosting der Anwendung im Internet mit Mehrnutzerbetrieb.
- Statistikansicht über gelernte Stunden, Themenabdeckung und Streaks.
- Integration externer Kalender (Google, iCal) und Hochschul-Lernplattformen.
- KI-gestützte Prüfung, Optimierung oder Erklärung bestehender Lernpläne.
- KI-gestützte Extraktion möglicher Aufgaben aus hochgeladenen Arbeitsblättern oder Lernmaterialien.
- KI-gestützte Übungsaufgaben aus eigenen Lernmaterialien.
- Wochenrückblick mit Coaching-Funktion durch die KI.
- Erinnerungen per E-Mail oder Browser-Benachrichtigung.
- Optionale Lerngruppenfunktion mit geteilten Plänen.
- Native Mobile-App oder Progressive Web App mit Offline-Fähigkeit.

Diese Punkte sind ausdrücklich **nicht** Teil des aktuellen verbindlichen Projekts und werden hier nur zur Einordnung der Produktvision genannt.

---

## 17. Glossar

| Begriff                                  | Bedeutung im Kontext von LearnHub                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lernplan**                             | Eine zusammenhängende Sammlung von Aufgaben für eine Veranstaltung, ein Fach oder ein Lernziel mit einem verbindlichen Zieldatum.                                              |
| **Aufgabe**                              | Eine einzelne, abhakbare Lerntätigkeit innerhalb eines Lernplans (z. B. „Kapitel 3 durcharbeiten").                                                                            |
| **Termin**                               | Ein Eintrag im Kalender — Vorlesung, Klausur, Lerneinheit oder Sonstiges.                                                                                                      |
| **Zieldatum**                            | Datum, bis zu dem ein Lernplan abgeschlossen sein soll, z. B. Klausur, Abgabe, Präsentation oder selbst gesetzte Frist.                                                        |
| **Lernplan-Generator**                   | Algorithmische Funktion, die aus Eingaben wie Zieldatum, Aufgaben, Aufwand, Schwierigkeit und verfügbarer Lernzeit eine Liste geplanter Aufgaben oder Lerneinheiten berechnet. |
| **Umplanung / Reschedule**               | Algorithmische Funktion, die offene Aufgaben eines Lernplans über den verbleibenden Zeitraum bis zum Zieldatum neu verteilt.                                                   |
| **KI-Check**                             | Optionale Erweiterung, die einen bereits erstellten Lernplan qualitativ prüft und Verbesserungsvorschläge macht.                                                               |
| **Dashboard**                            | Startseite nach der Anmeldung mit Überblick über anstehende Aufgaben und Termine.                                                                                              |
| **MVP**                                  | Minimum Viable Product — der hier beschriebene, abnahmefähige Funktionsumfang.                                                                                                 |
| **Must-Have / Should-Have / Could-Have** | Priorisierungsstufen nach dem MoSCoW-Verfahren.                                                                                                                                |

---

_Dieses Dokument ist die Arbeitsgrundlage für die Umsetzung von LearnHub mit algorithmischer Lernplanung als Kernmechanismus. Änderungen am Funktionsumfang oder den Nicht-Zielen erfolgen nach Abstimmung im Team und mit dem Auftraggeber._
