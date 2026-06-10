# Ausgabeformat

Der Algorithmus gibt als Ergebnis einen Lernplan aus. Die Ausgabe soll so aufgebaut sein, dass das Projektteam nachvollziehen kann, warum ein bestimmter Plan entsteht, und dass die App daraus später eine klare Tagesansicht erzeugen kann.

Die Ausgabe besteht aus drei Bereichen:

- Zusammenfassung der Berechnung
- Phasenverteilung
- Tagesplan mit konkreten Lernaufgaben

## 1. Zusammenfassung der Berechnung

Die Zusammenfassung enthält die wichtigsten berechneten Werte.

Ausgegeben werden:

- Fach oder Klausurname
- Deadline der Klausur
- Tage bis zur Deadline
- berechnete Gesamtstunden
- berechnete Stunden pro Tag
- gewählter Plantyp
- kurze Begründung für die Planwahl

Der Plantyp kann zwei Werte annehmen:

- normal
- kritisch

Ein normaler Lernplan wird gewählt, wenn die berechneten Stunden pro Tag kleiner oder gleich 2 sind.

Ein kritischer Lernplan wird gewählt, wenn die berechneten Stunden pro Tag größer als 2 sind.

Beispiel:

```text
Fach: Mathematik
Deadline: 20.06.2026
Tage bis zur Deadline: 14
Gesamtstunden: 28
Stunden pro Tag: 2
Plantyp: normal
Begründung: Der berechnete Tagesaufwand liegt bei höchstens 2 Stunden. Deshalb wird ein normaler Lernplan erstellt.
```

## 2. Phasenverteilung

Je nach Plantyp werden unterschiedliche Phasen ausgegeben.

Bei einem normalen Lernplan werden folgende Phasen verwendet:

- Grundlagen: 40 %
- Vertiefung: 35 %
- Anwendung: 15 %
- Wiederholung: 10 %

Bei einem kritischen Lernplan werden folgende Phasen verwendet:

- Priorisierung: 10 %
- Kernstoff erarbeiten: 50 %
- Aufgaben und Anwendung: 30 %
- Wiederholung: 10 %

Die Prozentwerte beschreiben, wie die berechnete Gesamtlernzeit auf die einzelnen Phasen verteilt wird.

Beispiel für einen normalen Lernplan mit 28 Gesamtstunden:

- Grundlagen: 11,2 Stunden
- Vertiefung: 9,8 Stunden
- Anwendung: 4,2 Stunden
- Wiederholung: 2,8 Stunden

## 3. Tagesplan

Der Tagesplan verteilt die Lernzeit auf die verbleibenden Tage bis zur Klausur.

Jeder Lerntag enthält:

- Datum
- geplante Lernzeit
- aktuelle Phase
- konkrete Aufgaben
- Wiederholungseinheit
- optionaler Hinweis

Beispiel:

```text
Tag 1 - 08.06.2026
Geplante Lernzeit: 2 Stunden
Phase: Grundlagen
```

Aufgaben:

- Kapitel 1 lesen
- wichtige Begriffe notieren
- kurze Zusammenfassung erstellen
- 5 Verständnisfragen beantworten

Wiederholung:

- 10 Minuten Wiederholung der bisherigen Notizen

Hinweis:

- Der Fokus liegt auf Verständnis, nicht auf Klausurtraining.

## Beispielausgabe als Struktur

Die Ausgabe kann später technisch als strukturierte Daten dargestellt werden.

Beispiel:

```json
{
  "subject": "Mathematik",
  "deadline": "2026-06-20",
  "daysUntilDeadline": 14,
  "totalHours": 28,
  "hoursPerDay": 2,
  "planType": "normal",
  "reason": "Der berechnete Tagesaufwand liegt bei höchstens 2 Stunden. Deshalb wird ein normaler Lernplan erstellt.",
  "phases": [
    {
      "name": "Grundlagen",
      "percentage": 40,
      "hours": 11.2
    },
    {
      "name": "Vertiefung",
      "percentage": 35,
      "hours": 9.8
    },
    {
      "name": "Anwendung",
      "percentage": 15,
      "hours": 4.2
    },
    {
      "name": "Wiederholung",
      "percentage": 10,
      "hours": 2.8
    }
  ],
  "days": [
    {
      "date": "2026-06-08",
      "plannedHours": 2,
      "phase": "Grundlagen",
      "tasks": [
        "Kapitel 1 lesen",
        "wichtige Begriffe notieren",
        "kurze Zusammenfassung erstellen",
        "5 Verständnisfragen beantworten"
      ],
      "review": "10 Minuten Wiederholung der bisherigen Notizen",
      "note": "Der Fokus liegt auf Verständnis, nicht auf Klausurtraining."
    }
  ],
  "warnings": []
}
```

## Ausgabe bei kritischem Lernplan

Bei einem kritischen Lernplan bleibt die Struktur gleich. Es ändern sich nur Plantyp, Phasen und Aufgabenlogik.

Beispiel:

```json
{
  "subject": "Mathematik",
  "deadline": "2026-06-15",
  "daysUntilDeadline": 7,
  "totalHours": 35,
  "hoursPerDay": 5,
  "planType": "kritisch",
  "reason": "Der berechnete Tagesaufwand liegt über 2 Stunden. Deshalb wird ein kritischer Lernplan erstellt.",
  "phases": [
    {
      "name": "Priorisierung",
      "percentage": 10,
      "hours": 3.5
    },
    {
      "name": "Kernstoff erarbeiten",
      "percentage": 50,
      "hours": 17.5
    },
    {
      "name": "Aufgaben und Anwendung",
      "percentage": 30,
      "hours": 10.5
    },
    {
      "name": "Wiederholung",
      "percentage": 10,
      "hours": 3.5
    }
  ],
  "days": [
    {
      "date": "2026-06-08",
      "plannedHours": 2,
      "phase": "Priorisierung und Kernstoff",
      "tasks": [
        "Themen in A-, B- und C-Themen einteilen",
        "wichtigstes A-Thema lernen",
        "2 typische Klausuraufgaben lösen"
      ],
      "review": "Fehler aus den Aufgaben notieren",
      "note": "Im kritischen Plan werden maximal 2 Stunden pro Tag angezeigt. Weniger wichtige Themen können entfallen."
    }
  ],
  "warnings": [
    "Der berechnete Lernaufwand ist höher als die empfohlene maximale Tageslernzeit."
  ]
}
```

## Regeln für die Ausgabe

Die Ausgabe soll deterministisch sein. Gleiche Eingabewerte führen deshalb zur gleichen Planstruktur.

Die berechneten Gesamtstunden werden auf die Phasen verteilt. Anschließend werden die Phasen auf die verfügbaren Lerntage aufgeteilt.

Bei einem normalen Lernplan liegt der Fokus auf Verständnis, Vertiefung, Anwendung und Wiederholung.

Bei einem kritischen Lernplan liegt der Fokus auf Priorisierung, Kernstoff, typischen Aufgaben und kurzer Wiederholung.

Wenn ein kritischer Lernplan erstellt wird, darf die App trotzdem maximal 2 Stunden Lernzeit pro Tag anzeigen, damit der Nutzer nicht überfordert wird. Zusätzlich wird eine Warnung ausgegeben.
