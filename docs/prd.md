# Product Requirements Document — LearnHub

| Feld | Inhalt |
|------|--------|
| **Projekt** | LearnHub — Lernmanagement-App für Studierende |
| **Auftraggeber** | [Dozent / Kunde — Name eintragen] |
| **Team** | Lucas (Projektleitung), Lennard (Design), Yannik (Design / Entwicklung), Finn (Design / Entwicklung), Fabi (Entwicklung) |
| **Datum** | 2026-05-12 |
| **Version** | 1.0 — Entwurf zur Abnahme |
| **Status** | Zur Freigabe durch den Auftraggeber |
| **Präsentationstermin** | [Datum eintragen] |

---

## 1. Management Summary

LearnHub ist eine webbasierte Lernmanagement-Anwendung für Studierende. Sie bündelt drei Aufgaben, die Studierende heute auf mehrere Tools verteilen — die Übersicht über anstehende Aufgaben, die Planung von Lernstoff bis zur Klausur und die Verwaltung von Vorlesungs- und Prüfungsterminen — in einer einzigen Oberfläche. Ein KI-gestützter Assistent ergänzt die Anwendung, indem er aus Klausurdatum, Lernstoff und verfügbarer Wochenzeit einen konkreten Lernplan vorschlägt und bei Verzögerungen den Rest des Plans automatisch neu verteilt.

Dieses Dokument beschreibt den vollständigen Funktionsumfang, den das Team im Rahmen des Projekts liefert, sowie die Funktionen, die ausdrücklich nicht Teil des Lieferumfangs sind. Es dient als verbindliche Grundlage für die Abnahme durch den Auftraggeber.

---

## 2. Ausgangslage und Problemstellung

Studierende organisieren ihren Lernalltag heute typischerweise mit einer Kombination aus generischen Tools: Papierkalendern, allgemeinen Aufgaben-Apps, Notizprogrammen und den jeweiligen Lernplattformen ihrer Hochschule. Keines dieser Werkzeuge ist auf die Besonderheiten studentischer Lernplanung zugeschnitten:

- Generische Kalender kennen weder Klausurtermine noch Lernstoff und können daher keine sinnvolle Verteilung von Lernzeit vorschlagen.
- Aufgaben-Apps gewichten Tasks nicht nach Klausurnähe und unterstützen keine zeitliche Verteilung über mehrere Wochen.
- Bei Verzögerungen — etwa weil ein Lernabschnitt länger gedauert hat — muss der gesamte Plan manuell umgestellt werden.

Daraus entsteht in der Praxis eine fehleranfällige Planung, häufiges manuelles Umorganisieren und das Risiko, Themen vor einer Klausur unzureichend abzudecken.

LearnHub adressiert diese Lücke mit einem studienspezifischen Werkzeug, das Klausurtermine, Lernstoff, Vorlesungen und ToDos in einem gemeinsamen Modell führt und durch KI-Unterstützung die Planung selbst weitgehend automatisiert.

---

## 3. Zielgruppe

**Primäre Nutzergruppe:** Studierende an Hochschulen und Universitäten, die regelmäßig auf Klausuren lernen und mehrere Fächer parallel im Blick behalten müssen. Annahmen:

- Wechseln zwischen Lehrveranstaltungen, Selbstlernzeit und Prüfungsphasen.
- Nutzen die Anwendung im Browser am Laptop oder Desktop-PC.
- Sind bereit, einmalig Klausurtermin, Themen und verfügbare Wochenstunden einzugeben, wenn dafür ein fertiger Lernplan entsteht.
- Erwarten ein modernes, übersichtliches Interface ohne Einarbeitungszeit.

**Sekundäre Überlegung:** Im Rahmen des Hochschulprojekts ist die Anwendung für ein einzelnes Studierenden-Setup ausgelegt. Sie ist nicht für den Einsatz in Lerngruppen, durch Dozierende oder als institutionelles Werkzeug konzipiert.

---

## 4. Produktvision

LearnHub soll für Studierende der zentrale Ort werden, an dem ihre Lernorganisation passiert. Wenn ein Studierender LearnHub öffnet, sieht er auf einen Blick, was heute und in den nächsten Tagen ansteht, welche Klausuren näher rücken und wo es Handlungsbedarf gibt. Beim Eintragen einer neuen Klausur reicht es, das Datum, das Fach und die zu lernenden Themen anzugeben — der KI-Assistent schlägt einen verteilten Lernplan vor, den der Studierende übernehmen oder anpassen kann. Verschiebt sich etwas, übernimmt LearnHub die Neuplanung.

Die Anwendung versteht sich nicht als Notizprogramm und nicht als Lernplattform, sondern als **Planungs- und Übersichtswerkzeug**: Sie ersetzt das händische Verwalten von Lernplänen, nicht die Lerninhalte selbst.

---

## 5. Ziele und Erfolgsmessung

### Projektziele

1. Bereitstellung einer lauffähigen Webanwendung bis zum Präsentationstermin, die alle in §6 als „Must-Have" gekennzeichneten Funktionen abdeckt.
2. Demonstration eines durchgängigen Nutzungsflusses — von der Anmeldung über das Anlegen eines KI-generierten Lernplans bis zur Anzeige der zugehörigen Lerneinheiten im Kalender — in einer Live-Vorführung.
3. Lieferung einer technisch dokumentierten Codebasis, die nach Projektabschluss weiterentwickelt werden könnte.

### Erfolgskriterien für die Abnahme

| Kriterium | Erfolgsmaß |
|-----------|------------|
| End-to-End-Fluss demonstrierbar | Anmeldung, Lernplan-Erstellung, KI-Generierung, Kalenderansicht und Aufgaben-Abhaken funktionieren in einer ununterbrochenen Live-Vorführung. |
| Funktionsabdeckung Must-Have | Alle in §6.1 gelisteten Funktionen sind implementiert und manuell verifiziert. |
| Bedienbarkeit | Ein Studierender ohne Vorerfahrung kann mit der Anwendung ohne Anleitung einen Lernplan anlegen. |
| Stabilität | Die Anwendung läuft während der Präsentation reproduzierbar ohne Fehlerabbrüche. |
| Dokumentation | Setup-Anleitung, dieses PRD, Designdokumentation und ein kurzer Architekturüberblick liegen im Repository vor. |

---

## 6. Funktionsumfang

Der Funktionsumfang ist nach dem MoSCoW-Prinzip priorisiert. **Must-Have**-Funktionen sind verbindlicher Lieferumfang. **Should-Have**-Funktionen werden umgesetzt, wenn die Must-Haves stabil und zeitlich Raum vorhanden ist. **Could-Have**-Funktionen werden bewusst zurückgestellt und sind in §9 (Nicht-Ziele) oder §16 (Ausblick) verortet.

### 6.1 Must-Have (verbindlicher Lieferumfang)

**M1 — Nutzerkonto und Anmeldung**
Studierende können sich mit E-Mail und Passwort registrieren und anmelden. Jeder Nutzer sieht ausschließlich seine eigenen Daten. Die Anmeldung bleibt optional über eine Sitzung erhalten („eingeloggt bleiben"). Es gibt eine Abmeldung.

**M2 — Dashboard als Startseite**
Nach der Anmeldung landet der Nutzer auf einem Dashboard. Es zeigt:
- die nächsten anstehenden Aufgaben über alle Lernpläne hinweg,
- die heutigen und morgigen Kalendertermine,
- einen Schnellzugriff auf alle aktiven Lernpläne.

**M3 — Lernpläne anlegen und verwalten**
Ein Lernplan bündelt das Lernen für eine konkrete Klausur. Er hat einen Titel, ein Fach, eine Beschreibung und ein Klausurdatum. Ein Nutzer kann beliebig viele Lernpläne anlegen, bearbeiten und löschen.

**M4 — Aufgaben innerhalb eines Lernplans**
Jeder Lernplan enthält Aufgaben (zum Beispiel „Kapitel 3 durcharbeiten" oder „Übungsblatt 2 rechnen"). Aufgaben haben einen Titel, einen geschätzten Zeitaufwand, ein Fälligkeitsdatum und einen Erledigungsstatus. Aufgaben können manuell hinzugefügt, bearbeitet, abgehakt und gelöscht werden.

**M5 — Kalenderansicht**
Eine eigene Kalenderseite zeigt Termine wahlweise als Tages-, Wochen- oder Monatsansicht. Termine umfassen:
- Vorlesungen und Lehrveranstaltungen,
- Klausurtermine,
- vom Nutzer eingetragene Lerneinheiten,
- sonstige Termine.

Termine können manuell angelegt, bearbeitet, verschoben und gelöscht werden. Termine sind farblich nach Typ unterscheidbar.

**M6 — KI-gestützte Lernplan-Erstellung**
Beim Anlegen eines Lernplans kann der Nutzer wählen, ob er den Plan leer beginnt oder ihn vom KI-Assistenten vorschlagen lässt. Im zweiten Fall gibt er an:
- das Fach,
- das Klausurdatum,
- die Liste der zu lernenden Themen,
- die ungefähr verfügbaren Wochenstunden,
- seinen aktuellen Wissensstand (Anfänger, Fortgeschritten, Geübt),
- .....

Die KI generiert daraus eine Liste konkreter Aufgaben mit Fälligkeitsdaten und geschätzten Bearbeitungszeiten, die als Teil des neuen Lernplans gespeichert werden. Der Nutzer kann den Vorschlag anschließend frei bearbeiten.

**M7 — KI-gestützte Umplanung (Smart-Reschedule)**
Wenn ein Nutzer hinter seinem Plan zurückfällt oder sich Termine verschieben, kann er für einen Lernplan eine Neuplanung auslösen. Die KI verteilt alle noch offenen Aufgaben gleichmäßig über den verbleibenden Zeitraum bis zum Klausurdatum, unter Berücksichtigung der verfügbaren Wochenstunden. Bereits erledigte Aufgaben bleiben unverändert.

**M8 — Lokaler Betrieb**
Die Anwendung ist auf einem lokalen Entwicklungsrechner über einen dokumentierten Setup-Vorgang startbar. Ein Hosting im Internet ist im MVP nicht vorgesehen.

### 6.2 Should-Have (sofern Zeit verbleibt)

**S1 — Verknüpfung von Aufgaben und Kalendereinträgen**
Aus einer Aufgabe heraus lässt sich direkt ein Kalender-Lernslot anlegen, der mit der Aufgabe verknüpft bleibt. Wird die Aufgabe abgehakt, ist die Verknüpfung sichtbar.

**S2 — Filter und Suche im Kalender**
Filterung der Kalenderansicht nach Termintyp (z. B. nur Klausuren, nur Lerneinheiten).

**S3 — Erinnerung an überfällige Aufgaben**
Visuelle Hervorhebung überfälliger Aufgaben auf dem Dashboard.

**S4 — Demonstrationsdaten**
Eine Funktion zum Befüllen der Anwendung mit Beispieldaten für die Präsentation.

### 6.3 Could-Have (bewusst zurückgestellt)

Diese Funktionen sind im Sinne der Vollständigkeit erwähnt, aber **nicht** Teil des Lieferumfangs:

- Statistikansicht über gelernte Stunden pro Fach,
- Wochenrückblick,
- Import von Stundenplänen aus externen Quellen,
- Erinnerungen per E-Mail oder Push-Benachrichtigung,
- Lerngruppen-Funktion mit geteilten Lernplänen.
- Es können Erinnerungs-Mails, Bestätigungs-Mails oder Passwort-Reset-Mails verschickt werden.
- Es können PDFs, Bilder oder andere Materialien hochgeladen werden.
- Push Benachrichtigungen im Browser
- Statistiken und Auswertungen über Lernzeit
---

## 7. Nutzungsabläufe (Use Cases)

Die folgenden Abläufe beschreiben den Lieferumfang aus Nutzersicht. Jeder Use Case ist Teil der Must-Have-Abdeckung.

### UC1 — Erstanmeldung

Eine Studierende öffnet LearnHub zum ersten Mal. Sie registriert sich mit ihrer Hochschul-E-Mail und einem Passwort, vergibt einen Anzeigenamen und wird im Anschluss direkt auf das Dashboard geleitet. Das Dashboard ist zu diesem Zeitpunkt leer und zeigt einen Hinweis, einen ersten Lernplan anzulegen.

### UC2 — Klausurvorbereitung mit KI-Plan

Die Studierende möchte sich auf ihre Statistik-Klausur in zehn Wochen vorbereiten. Sie legt einen neuen Lernplan an, wählt „Mit KI-Vorschlag erstellen", trägt Fach, Klausurdatum, die acht Klausurthemen, sechs verfügbare Wochenstunden und „Anfängerin" als Wissensstand ein. Die Anwendung erzeugt einen Vorschlag mit etwa zwanzig Aufgaben, die über die zehn Wochen verteilt sind, und speichert den Plan. Die Studierende öffnet den Plan, prüft die Vorschläge und schiebt zwei Aufgaben manuell um eine Woche nach hinten.

### UC3 — Tägliche Übersicht

Am Folgetag öffnet die Studierende das Dashboard und sieht direkt die zwei für heute geplanten Lernaufgaben sowie die heutige Vorlesung. Sie öffnet die Kalenderansicht in der Wochendarstellung und prüft, an welchen Nachmittagen freie Slots für zusätzliche Lerneinheiten verbleiben.

### UC4 — Verzug und Umplanung

Nach zwei Wochen erkennt die Studierende, dass sie hinter ihrem Plan zurückliegt. Sie öffnet den betroffenen Lernplan und klickt auf „Plan neu verteilen". Die KI verteilt die offenen Aufgaben über die verbleibenden acht Wochen neu, ohne bereits erledigte Aufgaben zu verschieben. Die neuen Fälligkeitsdaten sind anschließend im Plan und im Kalender sichtbar.

### UC5 — Termin manuell pflegen

Die Studierende erhält eine zusätzliche Sprechstunde beim Professor. Sie öffnet die Kalenderansicht, legt einen neuen Termin mit Titel, Uhrzeit und Termintyp „Sonstiges" an. Der Termin erscheint sofort in der Wochenansicht.

### UC6 — Abschluss einer Aufgabe

Nach Erledigung einer Lernaufgabe öffnet die Studierende das Dashboard oder den Lernplan und hakt die Aufgabe ab. Die Aufgabe wird als erledigt markiert und verschwindet aus der „Anstehend"-Liste auf dem Dashboard.

---

## 8. Anforderungen

### 8.1 Funktionale Anforderungen

Die funktionalen Anforderungen ergeben sich aus dem Funktionsumfang in §6 und den Nutzungsabläufen in §7. Zentrale Anforderungen im Überblick:

- Jeder Nutzer sieht ausschließlich seine eigenen Lernpläne, Aufgaben und Termine.
- Lernpläne, Aufgaben und Termine sind persistent gespeichert und nach Abmeldung und erneutem Login unverändert verfügbar.
- Die KI-Funktionen geben innerhalb angemessener Zeit (Richtwert: unter 30 Sekunden) ein Ergebnis zurück oder zeigen eine verständliche Fehlermeldung.
- Die Kalenderansicht stellt Termine korrekt in Tages-, Wochen- und Monatsansicht dar.
- Beim Löschen eines Lernplans werden zugehörige Aufgaben mit gelöscht. Verknüpfte Kalendereinträge bleiben erhalten, verlieren aber ihre Verknüpfung zur Aufgabe.

### 8.2 Nicht-funktionale Anforderungen

| Bereich | Anforderung |
|---------|-------------|
| **Benutzbarkeit** | Klare, intuitive Oberfläche im Stil moderner Webanwendungen. Hauptfunktionen über maximal zwei Klicks vom Dashboard erreichbar. |
| **Reaktionszeit** | Seitenwechsel und Datenoperationen ohne KI antworten unter einer Sekunde auf einem normalen Entwicklungsrechner. |
| **Sicherheit** | Passwörter werden ausschließlich gehasht gespeichert. Sitzungen laufen über HTTP-Only-Cookies. Cross-User-Zugriff ist konsequent verhindert. |
| **Datenschutz** | Es werden ausschließlich für die Funktion notwendige Daten erhoben (E-Mail, Anzeigename, Lerninhalte). Keine externen Analyse- oder Tracking-Dienste. |
| **Zugänglichkeit** | Tastaturbedienung für alle Kernfunktionen. Ausreichende Farbkontraste. 
| **Browser-Unterstützung** | Aktuelle Versionen von Chrome, Firefox und Safari auf Desktop-Auflösungen. |
| **Sprache** | Benutzeroberfläche durchgängig auf Deutsch. |

---

## 9. Nicht-Ziele

Die folgenden Funktionen und Eigenschaften sind ausdrücklich **kein** Bestandteil dieses Projekts. Sie werden hier aufgeführt, um Erwartungen klar zu setzen.

- **Kein Produktivbetrieb im Internet.** LearnHub läuft im Rahmen dieses Projekts ausschließlich lokal. Es gibt keinen Online-Zugang, kein Hosting und keine produktionsreife Infrastruktur.
- **Keine Mobile-Apps.** Die Anwendung ist webbasiert und für Desktop-Browser optimiert. Eine mobile Optimierung wird nicht zugesichert.
- **Keine Mehrnutzer- oder Gruppenfunktionen.** Es gibt keine geteilten Lernpläne, keine Lerngruppen, keinen Austausch zwischen Konten.
- **Keine Anbindung an externe Kalender.** Es gibt keinen Import/Export aus Google Calendar, Outlook, iCal oder ähnlichen Diensten.
- **Keine Anbindung an Hochschul-Lernplattformen.** Es findet keine Synchronisation mit Moodle, Ilias oder vergleichbaren Systemen statt.
- **Kein Anwesenheits- oder Notenverwaltungs-Modul.** LearnHub bildet weder Anwesenheiten noch Noten ab.
- **Kein Single-Sign-On.** Die Anmeldung erfolgt ausschließlich mit eigener E-Mail und eigenem Passwort.
- **Keine Statistik- und Reporting-Funktionen.** Es gibt keine Auswertungen über Lernzeit, Themenabdeckung oder Fortschritt über Wochen hinweg.

Funktionen, die hier nicht erwähnt sind, sollten im Zweifel als „nicht im Lieferumfang" verstanden und vor Bearbeitung mit dem Auftraggeber abgestimmt werden.

---

## 10. UX- und Design-Konzept

Die visuelle Konzeption ist in einem eigenen Dokument festgehalten: [docs/design/design.md](./design/design.md). Wireframes und Mockups werden iterativ über das Excalidraw-Board des Teams entwickelt und in den Wireframe-Ordner des Repositorys exportiert.

Leitlinien des Designs:

- **Klarheit vor Funktionsfülle.** Jede Ansicht beantwortet eine konkrete Frage des Nutzers („Was steht heute an?", „Wann ist meine nächste Klausur?", „Was muss ich für Statistik noch lernen?").
- **Konsistente Komponenten.** Buttons, Eingabefelder, Karten und Dialoge folgen einem einheitlichen Stil.
- **Wenig Farbe, gezielt eingesetzt.** Akzentfarben markieren Status (z. B. Klausuren, überfällige Aufgaben), nicht Dekoration.
- **Lesbarkeit auf Hochschul-Laptops.** Schriftgrößen und Kontraste sind für Desktop-Auflösungen optimiert.

---

## 11. Technologische Grundlagen

Eine ausführliche Begründung steht in [docs/tech-stack.md](./tech-stack.md). Zusammenfassung der gewählten Bausteine:

| Bereich | Technologie |
|---------|-------------|
| Frontend-Framework | Next.js 15 mit React 18 und TypeScript |
| UI-Bibliothek | Base UI in Verbindung mit Tailwind CSS |
| Datenbank | PostgreSQL, lokal über Docker |
| Datenzugriff | Prisma ORM |
| KI-Integration | Claude-API von Anthropic |
| Authentifizierung | E-Mail/Passwort mit gehashten Passwörtern und HTTP-Only-Cookies |
| Versionsverwaltung | Git, Repository auf GitHub, Aufgabensteuerung über GitHub Projects |

Die Auswahl wurde getroffen, um eine schnelle prototypische Entwicklung zu ermöglichen, einen modernen Stack abzubilden und gleichzeitig die Komplexität für ein Studierenden-Team handhabbar zu halten.

---

## 12. Projektorganisation

Die detaillierte Rollenverteilung liegt in [docs/roles.md](./roles.md). Verantwortlichkeiten im Überblick:

| Rolle | Verantwortung | Personen |
|-------|---------------|----------|
| Projektleitung | Koordination, Kommunikation mit dem Auftraggeber, Terminsteuerung | Lucas |
| Design / UX | Wireframes, Mockups, Designsystem | Lennard, Lucas (unterstützend) |
| Entwicklung Frontend | Umsetzung der Oberfläche und Datenanbindung | Yannik, Finn |
| Entwicklung Backend | Datenmodell, API-Schnittstellen, Authentifizierung, KI-Anbindung | Fabi, Finn |
| Querschnitt | Code-Reviews, Tests, Dokumentation | Gesamtes Team |

Die Zusammenarbeit erfolgt über regelmäßige Team-Treffen, ein Kanban-Board auf GitHub Projects und Pull-Request-basierte Entwicklung im Hauptrepository.

---

## 13. Zeitplan und Meilensteine

Der genaue Zeitplan wird laufend in GitHub Projects gepflegt. Die Meilensteine auf Projektebene:

| Meilenstein | Inhalt | Status |
|-------------|--------|--------|
| **M1 — Projektstart** | Teamfindung, Rollenverteilung, erste Wireframes, technische Grundsatzentscheidungen, Repository-Setup | abgeschlossen |
| **M2 — Frontend-Gerüst** | Lauffähiges Next.js-Projekt, Login-Maske, Dashboard-Shell, Kalenderansicht mit Beispieldaten | abgeschlossen |
| **M3 — Datenmodell und API** | Datenbankschema, persistente Speicherung, Anbindung des bestehenden Frontends an reale Daten, Authentifizierung | in Arbeit |
| **M4 — KI-Funktionen** | Lernplan-Generator und Smart-Reschedule produktiv im Lernplan- und Kalenderfluss verfügbar | offen |
| **M5 — Stabilisierung und Präsentation** | Fehlerbehebung, manuelle Abnahmetests, Demonstrationsdaten, Setup-Dokumentation, finale Präsentation | offen |

---

## 14. Abnahmekriterien

Die Anwendung gilt als abgenommen, wenn:

1. Alle in §6.1 als Must-Have gekennzeichneten Funktionen demonstrierbar sind.
2. Die in §7 beschriebenen Nutzungsabläufe UC1 bis UC6 in einer Live-Vorführung ohne Fehler durchlaufen werden.
3. Die Anwendung auf einem unbeteiligten Rechner anhand der Setup-Anleitung im [README](../README.md) startbar ist.
4. Quellcode, Dokumentation und dieses PRD im Repository vorliegen.
5. Das Team eine Abschlusspräsentation hält, die Vorgehen, Architekturentscheidungen und Funktionsumfang erläutert.

---

## 15. Risiken und Annahmen

| # | Risiko / Annahme | Auswirkung | Umgang |
|---|------------------|------------|--------|
| 1 | Die Claude-API steht zum Präsentationszeitpunkt nicht zur Verfügung oder antwortet zu langsam. | Live-Demonstration der KI-Funktionen nicht möglich. | Aufgezeichnete Demo-Aufnahme als Fallback bereithalten; zusätzlich vorgenerierte Beispiel-Lernpläne in den Demodaten. |
| 2 | Der Funktionsumfang ist für die verfügbare Projektzeit zu groß. | Verschiebung von Should-Have-Funktionen oder Reduktion einzelner Must-Haves nötig. | Wöchentliche Bewertung des Fortschritts; klare MoSCoW-Priorisierung bereits in §6. |
| 3 | Datenmodell-Detailentscheidungen ändern sich während der Umsetzung. | Mehraufwand für Refactoring. | Frühzeitige Festlegung des Datenmodells im ersten Meilenstein der Umsetzungsphase. |
| 4 | Die Qualität der KI-generierten Lernpläne ist nicht stabil. | Wahrnehmung des Mehrwerts der Anwendung leidet. | Strukturierte Eingaben, klare Ausgabevorgaben an die KI, manuelle Nachbearbeitung durch den Nutzer bleibt jederzeit möglich. |
| 5 | Die Anwendung läuft nur auf den Geräten des Teams stabil. | Abnahmehürde. | Setup-Dokumentation testweise auf einem teamfremden Rechner durchlaufen. |

**Zentrale Annahmen, die dieses PRD trägt:**

- Der Auftraggeber stellt keine zusätzlichen technischen Vorgaben über das in §11 Beschriebene hinaus.
- Es wird kein Produktivbetrieb erwartet.
- Die KI-API ist im Rahmen des Projektbudgets über den Projektzeitraum nutzbar.

---

## 16. Ausblick (außerhalb des Lieferumfangs)

Sollte LearnHub nach Projektabschluss weiterentwickelt werden, sind folgende Erweiterungen sinnvoll:

- Hosting der Anwendung im Internet mit Mehrnutzerbetrieb.
- Statistikansicht über gelernte Stunden, Themenabdeckung und Streaks.
- Integration externer Kalender (Google, iCal) und Hochschul-Lernplattformen.
- KI-gestützte Übungsaufgaben aus eigenen Lernmaterialien.
- Wochenrückblick mit Coaching-Funktion durch die KI.
- Erinnerungen per E-Mail oder Browser-Benachrichtigung.
- Optionale Lerngruppenfunktion mit geteilten Plänen.
- Native Mobile-App oder Progressive Web App mit Offline-Fähigkeit.

Diese Punkte sind ausdrücklich **nicht** Teil des aktuellen Projekts und werden hier nur zur Einordnung der Produktvision genannt.

---

## 17. Glossar

| Begriff | Bedeutung im Kontext von LearnHub |
|---------|-----------------------------------|
| **Lernplan** | Eine zusammenhängende Sammlung von Aufgaben mit dem Ziel, eine konkrete Klausur vorzubereiten. |
| **Aufgabe** | Eine einzelne, abhakbare Lerntätigkeit innerhalb eines Lernplans (z. B. „Kapitel 3 durcharbeiten"). |
| **Termin** | Ein Eintrag im Kalender — Vorlesung, Klausur, Lerneinheit oder Sonstiges. |
| **Lernplan-Generator** | KI-Funktion, die aus Eingaben (Fach, Klausurdatum, Themen, Wochenstunden, Wissensstand) eine Liste von Aufgaben vorschlägt. |
| **Smart-Reschedule** | KI-Funktion, die offene Aufgaben eines Lernplans über den verbleibenden Zeitraum bis zur Klausur neu verteilt. |
| **Dashboard** | Startseite nach der Anmeldung mit Überblick über anstehende Aufgaben und Termine. |
| **MVP** | Minimum Viable Product — der hier beschriebene, abnahmefähige Funktionsumfang. |
| **Must-Have / Should-Have / Could-Have** | Priorisierungsstufen nach dem MoSCoW-Verfahren. |

---

*Dieses Dokument ist die verbindliche Grundlage für die Umsetzung von LearnHub im Rahmen des Projekts. Änderungen am Funktionsumfang oder den Nicht-Zielen erfolgen ausschließlich in Abstimmung mit dem Auftraggeber und werden in einer neuen Version dieses Dokuments festgehalten.*
