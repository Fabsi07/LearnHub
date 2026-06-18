# Design-Dokumentation

> **Stand:** 18.06.2026
> Die Wireframes und der HTML-Prototyp dokumentieren die frühe Konzeptionsphase. Maßgeblich für den aktuellen Stand ist die implementierte Webanwendung.

## Ziel

Dieses Dokument beschreibt die visuelle Konzeption der Lernmanagement-App.
Es dient als Grundlage für die Entwicklung der Benutzeroberfläche sowie zur
Nachvollziehbarkeit des Designs im Projektverlauf.

---

## Design-Ansatz

Die Anwendung wurde zunächst über Wireframes und einen HTML-Prototyp konzipiert.
Der Fokus liegt auf einer klaren, intuitiven Benutzeroberfläche, die Studierenden
eine einfache Planung und Übersicht über ihre Aufgaben ermöglicht.

Das Design wurde während der Implementierung iterativ weiterentwickelt.

---

## Excalidraw Board

Zentrales Design-Board (Wireframes & Mockups):
https://excalidraw.com/#room=d7ec5fab0d6f3c20f2ec,mOCHuCN_jR9zH3XFlZ8vBA

Hinweis:
Das Board dokumentiert den kollaborativen Entwurfsstand aus der Konzeptionsphase.

---

## Wireframes

Exportierte Wireframes befinden sich im Repository unter:
[`docs/design/wireframes/`](./wireframes/)

Der frühe interaktive HTML-Prototyp liegt unter
[`docs/design/prototypes/prototype_1/`](./prototypes/prototype_1/).

Diese Artefakte dienen als historische Referenz für die Designentwicklung und
nicht als vollständige Darstellung der heutigen Funktionen.

---

## Aktuelle Ansichten

### 1. Dashboard / Home

**Ziel:**
Zentrale Übersicht über alle relevanten Informationen für den Nutzer.

**Inhalte:**

- Übersicht über anstehende ToDos
- Aktive Lernpläne und deren Fortschritt
- Hinweise auf wichtige Fristen und verpasste Lernsessions

**Zweck:**
Der Nutzer erhält auf einen Blick einen Überblick über seine aktuelle
Lernsituation und die wichtigsten nächsten Schritte.

---

### 2. Kalenderansicht

**Ziel:**
Zeitliche Darstellung aller Aufgaben und Fristen.

**Inhalte:**

- Darstellung von DHBW-Terminen, Zielterminen und Lerneinheiten
- Eigene Termine erstellen, bearbeiten und verschieben
- Tages-, Wochen-, Monats- und Listenansicht

**Zweck:**
Unterstützung bei der zeitlichen Planung und Strukturierung der Aufgaben.

---

### 3. Lernplanverwaltung

Lernpläne können angelegt, bearbeitet und mit Aufgaben gepflegt werden. Aus den
Eingaben erzeugt die Anwendung konkrete Lerneinheiten, die nach einer Vorschau
in den Kalender übernommen werden können.
