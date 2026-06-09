# Feature: User Profile Display (`feat/user-profile-display`)

## Ziel

Wenn sich ein Nutzer registriert oder anmeldet, sollen seine echten Daten (Name, E-Mail) überall in der App angezeigt werden, wo aktuell noch Dummy-Daten (`Max Mustermann`, `demo@learnhub.de`, `MM`) stehen.

---

## Betroffene Stellen

### 1. Sidebar — User Card (unten links)

**Datei:** `src/components/layout/Sidebar.tsx`

**Aktuell (Dummy):**
```tsx
<div ...>MM</div>
<span>Max Mustermann</span>
<span>demo@learnhub.de</span>
```

**Soll:**
- Initialen aus `displayName` berechnen (z.B. `Yannik Roeder` → `YR`, `Yannik` → `Y`)
- Vollständiger Anzeigename aus der Session
- E-Mail aus der Session

**Ansatz:** `Sidebar` bekommt `user: { displayName: string; email: string }` als Prop. Die Daten kommen vom Server-Layout (`src/app/(app)/layout.tsx`) via `getSession()` + Prisma-User-Lookup.

---

### 2. Settings — Profil-Tab

**Datei:** `src/components/settings/SettingsPage.tsx` → `ProfileSettings`

**Aktuell (Dummy):**
```tsx
<Input defaultValue="Max" />          // Vorname
<Input defaultValue="Mustermann" />   // Nachname
<Input defaultValue="demo@learnhub.de" />  // E-Mail
```

**Soll:**
- `displayName` aus der Session als `defaultValue` im Namensfeld vorbelegen
- E-Mail aus der Session vorbelegen
- Nachname-Feld: Da das Schema nur `displayName` (kein getrenntes `firstName`/`lastName`) kennt, wird `displayName` ins Vorname-Feld geladen; Nachname bleibt leer oder wird aus dem zweiten Wort des `displayName` abgeleitet

**Ansatz:** `ProfileSettings` bekommt `user: { displayName: string; email: string }` als Prop. `SettingsPage` bekommt dieselbe Prop vom Server-Parent.

---

## Datenfluss

```
src/app/(app)/layout.tsx  (Server Component)
  └─ getSession()  →  prisma.user.findUnique()
  └─ user = { displayName, email }
  └─ <DashboardShell user={user} ...>

src/components/layout/DashboardShell.tsx  (Client Component)
  └─ <Sidebar user={user} ...>

src/components/layout/Sidebar.tsx
  └─ user.displayName, user.email, initials(user.displayName)

src/app/(app)/settings/page.tsx  (Server Component)
  └─ getSession()  →  prisma.user.findUnique()
  └─ <SettingsPage user={user} />

src/components/settings/SettingsPage.tsx
  └─ user als Prop an ProfileSettings weitergeben
```

---

## API-Route (optional, für späteres Speichern)

`PATCH /api/profile` — aktualisiert `displayName` des eingeloggten Users.  
Wird in diesem Feature **noch nicht** implementiert (Speichern-Button bleibt vorerst Stub).  
Das ist ein separates Follow-up-Ticket.

---

## Prisma-Schema (kein Änderungsbedarf)

Das `User`-Modell hat bereits alle benötigten Felder:
```prisma
model User {
  id          String  @id @default(cuid())
  email       String  @unique
  displayName String   // wird als "Vorname (+ Nachname)" genutzt
  ...
}
```

---

## Implementierungsschritte

1. **`src/app/(app)/layout.tsx`** — User aus DB laden und als Prop weitergeben
2. **`src/components/layout/DashboardShell.tsx`** — `user`-Prop annehmen und an Sidebar weiterreichen
3. **`src/components/layout/Sidebar.tsx`** — `user`-Prop einbauen, Dummy-Daten ersetzen, Initialen berechnen
4. **`src/app/(app)/settings/page.tsx`** — User aus DB laden, an SettingsPage übergeben
5. **`src/components/settings/SettingsPage.tsx`** — `user`-Prop annehmen, Dummy-`defaultValue`s ersetzen

---

## Fallback (nicht eingeloggt / AUTH_ENABLED = false)

Solange `AUTH_ENABLED = false` in der Middleware:
- `getSession()` gibt `null` zurück
- Fallback-Objekt verwenden: `{ displayName: "Gast", email: "" }`
- So funktioniert die App weiterhin ohne Login

---

## Abgrenzung

- **Nicht** Teil dieses Features: Profilbild speichern, Passwort ändern, E-Mail ändern
- **Nicht** Teil dieses Features: Echtes Speichern von Namensänderungen (Follow-up)
- **Abhängigkeit zu C3:** Wenn C3 (Login) fertig ist, funktioniert der echte Session-Flow automatisch. Bis dahin greift der Fallback.
