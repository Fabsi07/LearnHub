# KI-Integration – Entscheidung gegen Umsetzung

## Warum wurde KI nicht implementiert?

Im Rahmen des 3. Prototyps waren drei KI-bezogene Issues geplant:

- **[I1] KI-Check für bestehende Lernpläne konzipieren** (#55)
- **[I2] KI-Check prototypisch implementieren** (#56)
- **[I3] KI-gestützte Aufgabenextraktion aus Lernmaterialien konzipieren** (#57)

### Gründe für den Verzicht

**1. Technische Inkompatibilität mit dem Lernplan-Modell**

Der Lernplan in LearnHub basiert auf einem eigens entwickelten Algorithmus (siehe `docs/Algorithmus/`), der Eingabeparameter wie Schwierigkeitsgrad, Vorwissen, ECTS-Punkte und verfügbare Tage zu einem strukturierten Tagesplan verrechnet. Dieses Datenmodell und die zugehörige Planstruktur lassen sich nicht sinnvoll als Prompt an ein LLM wie ChatGPT übergeben – die Ausgabe wäre nicht deterministisch, nicht strukturiert genug und nicht direkt in das bestehende Datenmodell (`StudyPlan`, `Task`, `CalendarEvent`) integrierbar.

**2. Zeitknappheit**

Gegen Ende des Projekts stand nicht mehr ausreichend Zeit zur Verfügung, um eine KI-Integration sauber zu konzipieren, zu testen und in den bestehenden Stack zu integrieren. Der Fokus wurde bewusst auf die Kernfunktionalitäten (Lernplan, Kalender, Auth) gelegt.

## Fazit

Die Issues I1–I3 werden im aktuellen MVP nicht umgesetzt. Eine spätere Integration wäre denkbar, würde jedoch eine grundlegende Anpassung des Lernplan-Datenmodells oder einen separaten KI-seitigen Verarbeitungsschritt erfordern.
