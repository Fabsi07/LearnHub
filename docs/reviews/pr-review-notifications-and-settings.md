# Code Review – PR #27 & PR #28

**Reviewer:** GitHub Copilot
**Datum:** 12.05.2026
**Repository:** Fabsi07/LearnHub

Diese Review-Datei listet alle Findings für die beiden offenen Pull Requests:

- **PR [#28 – Added Notification-Page and Refactor](https://github.com/Fabsi07/LearnHub/pull/28)** (Branch: `nachrichten-page`)
- **PR [#27 – Added Settings page with profile, notifications, and calendar as options](https://github.com/Fabsi07/LearnHub/pull/27)** (Branch: `settigs-page`)

Findings sind nach **Severity** gegliedert:

| Stufe | Bedeutung |
|---|---|
| 🔴 **Blocker** | Muss vor Merge gefixt werden (Bug, Security, Build-Bruch) |
| 🟠 **Major** | Sollte vor Merge gefixt werden (UX-/Logik-Problem, Konsistenz) |
| 🟡 **Minor** | Nice-to-have / Code-Qualität |
| 🔵 **Info** | Hinweis, keine Aktion zwingend nötig |

---

## Übergreifende Findings (beide PRs)

### 🔴 B-1 · Branch-Konflikt zwischen den beiden PRs
Beide PRs ändern dieselbe Datei `src/components/layout/Sidebar.tsx`, jedoch unterschiedlich (PR #28 ändert den Nav-Eintrag „Nachrichten" → „Benachrichtigungen", PR #27 wandelt die User-Karte in einen `<Link>` zur Settings-Seite um). Der zweite zu mergende PR wird einen Merge-Konflikt produzieren.
- **Aktion:** Reihenfolge festlegen, zweiten PR vorher rebasen.

### 🟠 Ü-1 · Branch-Name-Typo `settigs-page`
Branch heißt `settigs-page` statt `settings-page`. Beeinträchtigt Auffindbarkeit/Doku.
- **Aktion:** Branch nach Merge löschen; künftig auf Tippfehler achten.

### 🟡 Ü-2 · Sidebar-User-Card existiert in beiden PRs unterschiedlich
PR #27 macht die User-Karte zu einem Link, PR #28 nicht. Nach Merge prüfen, dass beide Änderungen gemeinsam Bestand haben.

---

## PR #28 – Notifications Page & Refactor

**Geänderte Dateien:**
- `src/app/dashboard/notifications/page.tsx` (neu)
- `src/components/notifications/NotificationsPage.tsx` (neu, ~250 Zeilen)
- `src/components/layout/Sidebar.tsx` (geändert)
- `tsconfig.tsbuildinfo` (versehentlich committed)

### 🔴 N-1 · Build-Artefakt `tsconfig.tsbuildinfo` ist committed
Die Datei ist ein TypeScript-Inkrementalbuild-Cache und gehört **nicht** ins Repository. Sie ist auch nicht in `.gitignore` enthalten.
- **Risiko:** Permanente Merge-Konflikte, aufgeblähte Repo-Historie, falsche Cache-States bei anderen Devs.
- **Aktion:**
  1. `tsconfig.tsbuildinfo` aus dem Branch entfernen (`git rm --cached tsconfig.tsbuildinfo`).
  2. `.gitignore` ergänzen: `*.tsbuildinfo` und `next-env.d.ts` prüfen.

### 🔴 N-2 · Suchfeld ist nur eine Attrappe
Im Header gibt es ein Such-UI (`Search`-Icon + Text „Benachrichtigungen suchen"), aber **kein `<input>`** und keine Filter-Logik. Sieht funktional aus, ist es aber nicht.
- **Aktion:** Entweder Funktionalität implementieren oder Element entfernen / als „bald verfügbar" kennzeichnen, um User nicht zu täuschen.

### 🔴 N-3 · Statische Mock-Daten ohne Persistenz / API-Anbindung
`notifications` ist ein hartkodiertes Array auf Modulebene. `isDone`, `isUrgent` etc. lassen sich nicht ändern, „Archivieren"-/„Mehr"-Buttons machen nichts.
- **Risiko:** Kein State-Management, keine Anbindung an die geplanten `api/`-Routen.
- **Aktion:** Entweder als bewussten Mock dokumentieren (Kommentar im Code) oder mindestens lokalen `useState` für `notifications` einführen, damit Aktionen sichtbar wirken.

### 🟠 N-4 · Ungenutzte Imports
In `NotificationsPage.tsx` werden importiert, aber nie verwendet:
- `Bell` (Zeile 6)
- `Clock` (Zeile 9)
- **Aktion:** Entfernen – `npm run lint` würde dies anzeigen.

### 🟠 N-5 · `selectedId` kann auf gefiltertes Set verweisen, das es nicht enthält
Wenn der User eine Nachricht auswählt und danach den Filter wechselt, fällt sie evtl. raus. Der Fallback (`?? filteredNotifications[0]`) zeigt zwar etwas an, aber `selectedId` bleibt stale → Klick auf den vorher selektierten Eintrag ist nicht mehr möglich.
- **Aktion:** Beim Filterwechsel `selectedId` auf erstes Element des neuen Filtersets setzen, oder `selectedNotification` als „source of truth" behandeln.

### 🟠 N-6 · Sprachmischung „Benachrichtigungen" Filter heißt „Ungelesen" filtert aber `!isDone`
Filter-Label „Ungelesen" suggeriert Lese-Status, intern wird aber `isDone` (erledigt-Status) verwendet. Semantisch falsch.
- **Aktion:** Entweder Label auf „Offen" / „Nicht erledigt" ändern oder ein echtes `isRead`-Feld einführen.

### 🟠 N-7 · Route-Inkonsistenz Sidebar ↔ neues Routing
- Die Datei `src/app/dashboard/messages/page.tsx` (alte Route) wird **nicht** entfernt – nur der Sidebar-Link wandert auf `/dashboard/notifications`. Tote Route bleibt erreichbar.
- **Aktion:** Alte `messages`-Route prüfen und ggf. entfernen oder per Redirect umleiten.

### 🟠 N-8 · Komponenten-Funktionsname `DashboardMessagesPage` passt nicht zur Route
In `src/app/dashboard/notifications/page.tsx` heißt die Default-Export-Komponente `DashboardMessagesPage`. Verwirrend und macht spätere Suche schwer.
- **Aktion:** Umbenennen in `DashboardNotificationsPage`.

### 🟡 N-9 · Hardcoded Hex-Farben statt Tailwind/Theme-Tokens
`bg-[#ef233c]`, `bg-[#5f6a70]`, `bg-[#f8f8f8]` sind in der Komponente verteilt. Das Projekt nutzt CSS-Variablen / Tailwind-Theme.
- **Aktion:** Auf Theme-Tokens (`bg-primary`, `bg-muted`, etc.) umstellen, sonst bricht der Dark-Mode-Switch.

### 🟡 N-10 · Buttons ohne `type="button"`
`<button>`-Elemente in Filter-Tabs, Listenitems und Toolbar haben kein `type`-Attribut → in einem Form-Kontext würde ein Default-Submit ausgelöst.
- **Aktion:** Konsistent `type="button"` setzen.

### 🟡 N-11 · Fehlende Accessibility / Keyboard-Hints
- Listenitems sind `<button>`s in einer Liste ohne `aria-current="true"` für selektierten Eintrag.
- Filter-Tabs sollten als `role="tablist"` mit `aria-selected` ausgezeichnet werden.

### 🟡 N-12 · Kaputte Einrückung / fehlender Zeilenumbruch
In Zeile ~205 `<div className="min-h-0 flex-1 overflow-auto space-y-6 px-6 py-6">                <div ...>` (mehrere Leerzeichen statt Zeilenumbruch). Auch Sidebar-Diff zeigt fehlenden Newline am Ende der geänderten Zeile.
- **Aktion:** Datei mit Prettier formatieren.

### 🔵 N-13 · Datumsangaben als Strings
`dueDate: "09. Mai 2026"` statt `Date`/ISO-String. Sortierung und Status („Dringend") nicht ableitbar – `isUrgent` ist manuell gepflegt.
- **Aktion (später):** Auf `Date`/ISO umstellen, `isUrgent` aus Restzeit berechnen.

### 🔵 N-14 · Komponente ist sehr lang (~250 Zeilen)
Sinnvoll wäre eine Aufteilung in `NotificationList`, `NotificationDetail`, `NotificationItem`.

---

## PR #27 – Settings Page (Profile / Notifications / Calendar)

**Geänderte Dateien:**
- `src/app/dashboard/settings/page.tsx` (neu)
- `src/components/settings/SettingsPage.tsx` (neu, ~330 Zeilen)
- `src/components/layout/Sidebar.tsx` (User-Card → Link)

### 🔴 S-1 · Sektion „Calendar" mit englischem Label – Inkonsistenz zur Sprache
Das Projekt ist deutschsprachig (Header „Einstellungen", „Profil", „Benachrichtigungen"). Der dritte Tab heißt jedoch `Calendar` und die `<h2>`-Überschrift ebenfalls.
- **Aktion:** Auf „Kalender" umstellen (Label und `<h2>`).

### 🔴 S-2 · Default-Tab ist `notifications`, nicht `profile`
```ts
const activeCategory =
  settingsCategories.find((c) => c.id === tabParam)?.id ?? "notifications";
```
Beim direkten Aufruf von `/dashboard/settings` (z.B. via Sidebar-Link „Einstellungen") landet der User auf der Benachrichtigungs-Tab statt Profil.
- **Aktion:** Default auf `"profile"` setzen oder bewusste Entscheidung dokumentieren.

### 🔴 S-3 · Avatar-Upload erzeugt Memory-Leak
```ts
setAvatarPreview(URL.createObjectURL(file));
```
Es wird nie `URL.revokeObjectURL(...)` aufgerufen. Bei mehrfachem Upload akkumulieren Object-URLs im Speicher.
- **Aktion:** Vorherigen URL in einem `useEffect`-Cleanup oder vor `setAvatarPreview` revoken.

### 🔴 S-4 · Keine Validierung des Avatar-Files (Security/UX)
- Kein Größenlimit, kein MIME-Check über `accept` hinaus.
- `<img src={avatarPreview}>` ohne Größenbegrenzung der Quelldatei → User kann 50-MB-Bild laden.
- **Aktion:** Größencheck (z.B. ≤ 5 MB) und MIME-Whitelist (`image/png`, `image/jpeg`, `image/webp`).

### 🔴 S-5 · Forms haben kein `onSubmit`-Handler / kein State
- Profil-Form: `<form className="...">` ohne `onSubmit` → Submit-Button (`type="submit"`) lädt die Seite neu (Browser-Default GET).
- Notification-Settings-Speichern-Button macht **gar nichts** (kein Handler).
- Inputs nutzen `defaultValue` ohne `onChange` → Werte sind nicht abrufbar.
- **Aktion:** Mindestens `onSubmit={(e) => e.preventDefault()}` ergänzen, idealerweise State + API-Call (auch nur Mock).

### 🟠 S-6 · `React.RefObject<HTMLInputElement>` ist mit React 19 strenger typisiert
`useRef<HTMLInputElement>(null)` ergibt in React 19 `RefObject<HTMLInputElement | null>`. Die Prop-Typisierung
```ts
fileInputRef: React.RefObject<HTMLInputElement>;
```
kann je nach React-Version einen TS-Fehler werfen.
- **Aktion:** `React.RefObject<HTMLInputElement | null>` verwenden oder `React.MutableRefObject`.

### 🟠 S-7 · `router.replace` mit Query in `useSearchParams`-Komponente erfordert Suspense ✅
Die Route nutzt `<Suspense fallback={null}>` korrekt, aber `fallback={null}` führt zu Layout-Sprung. Besser ein Skeleton.
- **Aktion:** Skeleton-Fallback liefern.

### 🟠 S-8 · Sidebar-Link-Targets divergieren
- Sidebar-Hauptnav: `/dashboard/settings` (führt auf Default-Tab `notifications`, siehe S-2).
- Sidebar-User-Card: `/dashboard/settings?tab=profile`.
- **Aktion:** Konsistent auf `?tab=profile` zeigen oder Default ändern (S-2).

### 🟠 S-9 · `<select>`-Elemente sind native, nicht Base UI
Das Projekt nutzt sonst Base UI Primitives. Native `<select>`-Stylings sehen auf Windows/Safari sehr unterschiedlich aus.
- **Aktion:** Optional auf Base UI / shadcn `Select` umstellen, mindestens dokumentieren.

### 🟠 S-10 · Kalender-Import ist Fake-Spinner ohne echten Import
```ts
window.setTimeout(() => setIsImporting(false), 1600);
```
Der „Stundenplan importieren"-Button simuliert nur einen Import. Risiko: User glaubt, Daten seien gespeichert.
- **Aktion:** Klar als Mock kennzeichnen oder Endpoint anbinden.

### 🟠 S-11 · Hardcoded Personendaten („Finn Pfleghaar", „finn.pfleghaar@dhbw.de") als `defaultValue`
Personenbezogene Daten in einer öffentlichen Repo-History. Auch zu Prototyp-Zeiten ungünstig.
- **Aktion:** Auf generische Demo-Daten („Max Mustermann", „demo@learnhub.de") wechseln oder aus Mock-User-Objekt laden.

### 🟡 S-12 · `useMemo` für `activeTitle` ist überdimensioniert
Eine simple `find()`-Operation auf einem 3-Element-Array braucht kein `useMemo`.
- **Aktion:** Direkt berechnen.

### 🟡 S-13 · Mehrere `<div>` mit fehlenden Newlines
Zeilen wie `<div className="...">        <h2 ...>` zeigen Formatierungs-Schluckauf (kein Linebreak nach Tag-Ende).
- **Aktion:** Prettier laufen lassen.

### 🟡 S-14 · Inputs ohne `name`-Attribute
Ohne `name` taucht das Feld bei nativem Form-Submit nicht in `FormData` auf.
- **Aktion:** `name`-Attribute setzen, sobald Forms verarbeitet werden.

### 🟡 S-15 · Doppelte Styling-Strings für `<select>`
Beide `<select>`-Elemente nutzen denselben langen Tailwind-String. In gemeinsame Konstante / Komponente extrahieren.

### 🟡 S-16 · Default-Wert in `<select>` als String, der mit Optionen verglichen wird
`defaultValue="1 Tag vorher"` muss exakt mit einem `option`-Wert übereinstimmen. Bei Tippfehler stiller Bug. Besser einen Konstanten-Index oder `value`-Attribut nutzen.

### 🔵 S-17 · `Suspense fallback={null}` versteckt potentielle Fehler
Bei längerer Hydration sieht User leere Seite.

---

## Empfohlene Abarbeitungs-Reihenfolge

1. **PR #28 – Blocker fixen** (N-1 Build-Artefakt, N-2 Fake-Suche, N-3 Mock klarmachen)
2. **PR #28 – Major fixen** (N-4 bis N-8)
3. **PR #28 mergen**
4. **PR #27 rebasen** (wegen Sidebar-Konflikt – B-1)
5. **PR #27 – Blocker fixen** (S-1 bis S-5)
6. **PR #27 – Major fixen** (S-6 bis S-11)
7. **PR #27 mergen**
8. **Aufräum-Tickets** für 🟡 Minor / 🔵 Info als Follow-up-Issues anlegen

---

## Checkliste vor Merge (für beide PRs)

- [ ] `npm run lint` läuft sauber
- [ ] `npm run build` läuft sauber
- [ ] Keine Build-Artefakte committed
- [ ] Sidebar-Konflikt aufgelöst
- [ ] Sprache konsistent deutsch
- [ ] Alle interaktiven Elemente haben echte Funktion **oder** sind klar als Mock markiert
- [ ] Personenbezogene Daten anonymisiert
