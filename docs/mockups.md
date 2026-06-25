# Mockups & nicht implementierte Bereiche — LearnHub

| Feld      | Inhalt                                                                |
| --------- | --------------------------------------------------------------------- |
| **Zweck** | Transparente Übersicht, welche Bereiche echt funktionieren, welche als Mockup/Vorschau gezeigt werden und welche bewusst zurückgestellt sind |
| **Stand** | 25.06.2026 (Meilenstein 3)                                            |
| **Bezug** | Meilenstein 3 — „fehlende Teile sind als Mockups dokumentiert"        |

---

## 1. Einordnung

Der funktionale Kern von LearnHub (Must-Haves M1–M8 laut [PRD §6.1](./prd.md)) ist
als lauffähige Anwendung umgesetzt, nicht als Klickprototyp. Die unten genannten
Punkte sind die bewusst als Mockup gezeigten bzw. (noch) nicht implementierten
Bereiche. Der vollständige Feature-Status mit Häkchen steht in [PRD §17](./prd.md).

---

## 2. Als Mockup / Vorschau im Produkt sichtbar

| Bereich                     | Wo                       | Charakter                                                                 |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| Passwort zurücksetzen       | `/forgot-password`       | Funktionierende Seite, die transparent auf die künftige DHBW-SSO-Anbindung hinweist. Kein echter Reset-Flow. |
| E-Mail-Adresse ändern       | Einstellungen → Profil   | Feld wird angezeigt, ist aber nicht editierbar (künftig über DHBW-SSO).    |

Diese Stellen sind im UI als „noch nicht verfügbar" bzw. „in Vorbereitung"
gekennzeichnet, damit in der Demo kein falscher Eindruck entsteht.

---

## 3. Bewusst zurückgestellt (Could-Have / Ausblick)

Diese Funktionen sind laut [PRD §6.3 und §16](./prd.md) ausdrücklich **nicht** Teil
des verbindlichen Lieferumfangs und werden in der Demo als Konzept/Ausblick
erläutert:

- KI-Check eines bestehenden Lernplans mit Verbesserungsvorschlägen (UC7).
- KI-gestützte alternative Planvarianten.
- KI-gestützte Aufgabenextraktion aus Lernmaterialien.
- Statistikansicht (gelernte Stunden pro Fach) und Wochenrückblick.
- Single-Sign-On mit DHBW-Login.
- Versand von E-Mails (Erinnerung/Bestätigung/Passwort-Reset).
- Browser-Push-Benachrichtigungen.
- Mobile-App / PWA.

---

## 4. Geplant, aber noch offen (Should-Have)

- **S2 — Termintyp-Filter im Kalender:** Ein Fächer-Filter ist vorhanden; ein
  reiner Filter nach Termintyp ist noch nicht umgesetzt.
- **S4 — Demonstrationsdaten/Seed:** Es gibt noch kein Skript zum reproduzierbaren
  Befüllen für die Präsentation.
- **S5 — Transparenzanzeige der Planungslogik:** Eine UI-Begründung „warum liegt
  diese Aufgabe an diesem Tag" ist noch nicht umgesetzt.

---

## 5. Frühe Konzept-Prototypen

Aus der Konzeptionsphase existiert ein statischer HTML-Klickprototyp unter
[docs/design/prototypes/prototype_1/](./design/prototypes/prototype_1/) sowie
Wireframes unter [docs/design/wireframes/](./design/wireframes/). Diese
dokumentieren die frühe Designidee. **Maßgeblich für den aktuellen Stand ist die
implementierte Webanwendung**, nicht der frühe Prototyp.

---

## 6. Hinweis für die Vorführung

Empfohlener Umgang in der Demo:
- Must-Have-Flows (UC1–UC6) **live** zeigen.
- Mockup-Stellen (Abschnitt 2) kurz als „bewusst noch nicht angebunden" benennen.
- Could-Have (Abschnitt 3) nur als Ausblick erwähnen, nicht als vorhandene Funktion.
