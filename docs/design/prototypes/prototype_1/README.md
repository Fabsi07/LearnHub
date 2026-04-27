# 🎓 LearnHub — Lernmanagement Mockup

Ein professionelles, vollständiges HTML-Mockup für eine moderne Lernmanagement-App.

## ✨ Features

- 🗂️ **Einklappbare Sidebar** (Cmd/Ctrl + B oder Button)
- 🌗 **Dark Mode** als Standard, mit Light/Dark/System Toggle
- 📅 **Voller Kalender** (FullCalendar) mit Drag & Drop, mehreren Views, Filtern
- 📚 **Fächerverwaltung** mit Farben, Icons, Fortschritt
- 🎯 **Lernziele** im Kanban-Board (Geplant / In Arbeit / Erreicht)
- ⏱️ **Pomodoro-Timer** mit Heatmap und Sessionverlauf
- 🎴 **Karteikarten** mit Flip-Animation und Spaced-Repetition-Bewertung
- 📝 **Markdown-Notizen** mit Live-Preview
- 📊 **Statistiken** mit Line-/Donut-/Bar-/Radar-Charts und Jahresheatmap
- ⚙️ **Einstellungen** für Profil, Theme, Pomodoro, Benachrichtigungen
- 🧊 **Glasmorphism-Topbar**, Mikro-Animationen, Toast-Notifications
- 📱 **Responsive** bis Mobile (Sidebar als Drawer)

## 🚀 Starten

Einfach `index.html` im Browser öffnen — alle Libraries laden via CDN.

```bash
open index.html
# oder
python3 -m http.server 8000
```

## 📁 Struktur

```
.
├── index.html          → Dashboard
├── calendar.html       → Großer Kalender
├── subjects.html       → Fächer-Verwaltung
├── goals.html          → Lernziele (Kanban)
├── sessions.html       → Pomodoro
├── flashcards.html     → Karteikarten
├── notes.html          → Markdown-Notizen
├── stats.html          → Statistiken
├── settings.html       → Einstellungen
└── assets/
    ├── css/styles.css  → Custom Styling
    └── js/
        ├── app.js          → Layout, Sidebar, Theme, Toast
        └── mock-data.js    → Demo-Daten
```

## 🎨 Tech

- **Tailwind CSS** (CDN)
- **Lucide Icons**
- **FullCalendar** für Kalender
- **Chart.js** für Statistiken
- **Marked.js** für Markdown
- **Inter** + **JetBrains Mono** Fonts

## ⌨️ Tastenkürzel

- `Cmd/Ctrl + B` — Sidebar einklappen/ausklappen

---

Made with 💜 for effizientes Lernen.
