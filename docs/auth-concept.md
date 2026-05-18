# Auth-Konzept — LearnHub MVP

| Feld          | Inhalt                                                              |
| ------------- | ------------------------------------------------------------------- |
| **Status**    | Entwurf zur Team-Abstimmung                                         |
| **Bezug**     | Issue #36 (C1), blockiert C2 (Registrierung) und C3 (Login/Logout)  |
| **Datum**     | 2026-05-18                                                          |
| **Geltung**   | Verbindliche Grundlage für die Auth-Implementierung im MVP          |

---

## 1. Zweck dieses Dokuments

Das PRD (§6.1 M1, §8.2) legt fest, dass Studierende sich registrieren und anmelden können, dass Passwörter gehasht gespeichert werden und dass Sitzungen über HTTP-Only-Cookies laufen. Dieses Dokument konkretisiert den minimalen Auth-Flow für das MVP, sodass die Tickets C2 und C3 ohne weitere fachliche Klärung umgesetzt werden können.

Nicht-Ziele dieses Konzepts:

- Kein Passwort-Reset per E-Mail (im PRD §6.3 explizit als Could-Have ausgeschlossen).
- Kein Single-Sign-On, kein DHBW-Login (PRD §6.3).
- Keine Mehrnutzer-Administration, keine Rollen (PRD §9).
- Keine E-Mail-Verifikation. Eine eingegebene E-Mail wird als gültig akzeptiert; doppelte Registrierung mit gleicher E-Mail wird abgelehnt.

---

## 2. Entscheidung: Eigene Implementierung statt Library

Für das MVP wird eine **eigene minimale Auth-Implementierung** in Next.js Route Handlers umgesetzt. Keine externe Auth-Library (kein NextAuth/Auth.js, kein Lucia, kein Clerk).

Begründung:

- **Erklärbarkeit für die Abnahme.** Das Team muss in der Abschlusspräsentation Architekturentscheidungen erläutern (PRD §14). Eine selbst gebaute, schlanke Auth ist vollständig durchschaubar; Library-Internals (NextAuth-Callbacks, Adapter, etc.) müssten zusätzlich erklärt werden.
- **Kleiner Funktionsumfang.** Es werden nur Registrierung, Login, Logout, Session-Prüfung und Passwort-Hashing benötigt. OAuth, Magic Links, E-Mail-Verifikation, Multi-Factor sind nicht im Lieferumfang. Der Mehrwert einer Library kommt erst bei diesen Features zum Tragen.
- **Lokaler Betrieb.** LearnHub läuft nur lokal (PRD §6.1 M8, §9). Anforderungen wie horizontale Skalierung, externe IdPs oder verteiltes Session-Management existieren nicht.
- **Lerneffekt.** Das Projekt ist ein Hochschulprojekt — das Selbstbauen entspricht dem Bildungsauftrag.

Abgrenzung: Für das Passwort-Hashing wird trotzdem eine etablierte Library (`bcryptjs`) eingesetzt. Krypto-Primitive selbst implementieren ist explizit kein Ziel.

---

## 3. Datenmodell (Prisma)

Das Auth-Konzept fügt zwei Tabellen zum geplanten Prisma-Schema hinzu. `User` wird ohnehin in [docs/tech-stack.md](./tech-stack.md) als Kernmodell genannt.

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  displayName  String
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
}

model Session {
  id        String   @id                  // zufälliger, kryptografisch starker Token, identisch zum Cookie-Wert
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}
```

Begründungen:

- **E-Mail als unique Login-Kennung.** Das Login-Formular verwendet bereits eine E-Mail (siehe [src/components/login/LoginForm.tsx](../src/components/login/LoginForm.tsx)). Großbuchstaben werden vor dem Speichern und Vergleich auf Kleinbuchstaben normalisiert.
- **`displayName`** entspricht dem in PRD §UC1 erwähnten Anzeigenamen.
- **`Session.id` als Token.** Der zufällige Session-Token wird unverändert als Primärschlüssel verwendet. Es gibt keinen separaten Identifier — das hält die Logik einfach. Der Token wird über `crypto.randomBytes(32).toString('base64url')` erzeugt (≥ 256 Bit Entropie).
- **`onDelete: Cascade`** stellt sicher, dass beim Löschen eines Nutzers alle seine Sessions verschwinden.

---

## 4. Passwort-Hashing

**Festlegung:** `bcrypt` mit Cost-Faktor 12, Implementierung über das `bcryptjs`-Paket.

Begründungen:

- Industriestandard und in Lehrbüchern verbreitet — gut erklärbar in der Abnahme.
- Reines JavaScript-Paket (`bcryptjs`), keine nativen Build-Schritte nötig — vereinfacht das lokale Setup auf den Geräten der Teammitglieder.
- Cost 12 ist gängiger Default für 2026 und liefert ≈ 200–300 ms pro Hash auf einem typischen Entwicklerrechner. Für den lokalen MVP-Betrieb ist das akzeptabel.

Regeln:

- Passwörter werden **niemals** im Klartext gespeichert, geloggt oder über die API zurückgegeben.
- Mindestlänge bei Registrierung: 8 Zeichen. Keine weiteren Komplexitätsregeln im MVP. NIST SP 800-63B empfiehlt explizit, auf Sonderzeichen-Pflicht zu verzichten.
- Beim Login wird `bcrypt.compare` benutzt; bei nicht-existierender E-Mail wird ein Dummy-`compare` gegen einen Hash mit gleicher Cost ausgeführt, um die Antwortzeit konstant zu halten und User-Enumeration zu erschweren.

---

## 5. Sessions

**Modell:** Server-Sessions in der Datenbank, opakes Token im HTTP-Only-Cookie.

### 5.1 Session-Erstellung

Bei erfolgreichem Login oder erfolgreicher Registrierung:

1. Token erzeugen (`crypto.randomBytes(32).toString('base64url')`).
2. Eintrag in `Session` schreiben (`id = token`, `userId`, `expiresAt`).
3. Cookie `lh_session` mit dem Token setzen.

### 5.2 Cookie-Attribute

| Attribut    | Wert                                                 |
| ----------- | ---------------------------------------------------- |
| `name`      | `lh_session`                                         |
| `value`     | opaker Session-Token (≥ 256 Bit Entropie)            |
| `HttpOnly`  | true                                                 |
| `SameSite`  | `Lax`                                                |
| `Secure`    | `process.env.NODE_ENV === "production"`              |
| `Path`      | `/`                                                  |
| `Max-Age`   | siehe §5.3                                           |

- **HttpOnly** verhindert Zugriff via JavaScript und schützt vor XSS-basiertem Token-Diebstahl.
- **SameSite=Lax** schützt vor CSRF bei Standard-Formularen und ist mit dem Login-Flow kompatibel.
- **Secure** bleibt im lokalen Dev-Betrieb (HTTP) aus, da der Browser sonst das Cookie verwirft.

### 5.3 Lebensdauer und „Eingeloggt bleiben"

Das Login-Formular hat bereits eine Checkbox „Eingeloggt bleiben" (siehe [src/components/login/LoginForm.tsx](../src/components/login/LoginForm.tsx)). Diese steuert die Cookie-TTL:

| Checkbox            | Cookie-`Max-Age` und `Session.expiresAt` |
| ------------------- | ---------------------------------------- |
| **nicht angehakt**  | 24 Stunden                               |
| **angehakt**        | 30 Tage                                  |

Jede authentifizierte Anfrage prüft `expiresAt`. Eine **Sliding-Renewal** findet im MVP **nicht** statt — die Session läuft hart nach `Max-Age` ab. Begründung: einfacher zu implementieren, ausreichend für den MVP-Demonstrationsfluss.

### 5.4 Session-Prüfung

Eine Hilfsfunktion `getCurrentUser()` in `src/lib/auth/session.ts` (zu erstellen in C3):

1. Cookie `lh_session` lesen.
2. `Session`-Datensatz inklusive `user` über Prisma laden.
3. Wenn nicht gefunden oder `expiresAt < now()`: Session löschen, `null` zurückgeben.
4. Sonst `user` zurückgeben.

Diese Funktion wird sowohl in Server Components als auch in Route Handlers verwendet.

### 5.5 Logout

`POST /api/auth/logout`:

1. Session-Token aus Cookie lesen.
2. `Session`-Datensatz löschen.
3. Cookie mit `Max-Age=0` überschreiben.
4. Redirect auf `/login`.

---

## 6. Geschützte Routen

Das Routing wurde in PR #29 auf eine `(app)`-Route-Group umgestellt. Diese Gruppe kapselt den eingeloggten Bereich und ist die natürliche Schutzgrenze.

### 6.1 Öffentliche Routen

- `/login`
- `/register`
- `/forgot-password` (statische Seite, im MVP ohne Funktion — Passwort-Reset ist Could-Have, PRD §6.3)
- `/api/auth/*` (Login-, Register-, Logout-Endpunkte)
- alle Next.js-Interna (`/_next/*`, `/favicon.ico`, `/icons/*`, `/images/*`)

### 6.2 Geschützte Routen

Alles in der `(app)`-Route-Group, insbesondere:

- `/dashboard`
- `/learning-plans/*`
- `/calendar`
- `/settings`
- alle weiteren App-Routen unterhalb der `(app)`-Group

Auch geschützt: alle API-Routen außer `/api/auth/*` (z.B. `/api/calendar/*`, später `/api/learning-plans/*`).

### 6.3 Schutzmechanismus

In [src/middleware.ts](../src/middleware.ts) existiert die Schutzlogik bereits, ist aber per `AUTH_ENABLED = false` deaktiviert. C3 aktiviert sie. Verhalten:

- Nicht eingeloggter Aufruf einer geschützten Route ⇒ Redirect auf `/login?redirect=<ursprünglicher Pfad>`.
- Eingeloggter Aufruf von `/login` oder `/register` ⇒ Redirect auf `/dashboard`.
- Nach erfolgreichem Login wird der `redirect`-Parameter respektiert, sofern er ein **lokaler Pfad** ist (Start mit `/`, kein `//`, keine absolute URL) — Schutz vor Open-Redirect.

Wichtig: Die Middleware prüft im MVP **nur** das Vorhandensein des Cookies, nicht dessen Gültigkeit gegen die Datenbank (Next.js Middleware läuft in der Edge-Runtime ohne Prisma-Zugang). Die echte Session-Validierung erfolgt in Server Components und Route Handlern über `getCurrentUser()`. Das ist akzeptabel, weil:

- Ein abgelaufenes oder gefälschtes Cookie führt zwar zu einem Render-Versuch, aber jede geschützte Server-Action und jede geschützte API-Route ruft `getCurrentUser()` und gibt bei `null` einen 401/Redirect zurück.
- Es gibt im MVP keinen anonymen Datenzugriff über UI-Skelette hinaus.

---

## 7. API-Endpunkte (Übersicht für C2/C3)

| Methode | Pfad                  | Zweck                                           | Ticket |
| ------- | --------------------- | ----------------------------------------------- | ------ |
| `POST`  | `/api/auth/register`  | Neuen Nutzer anlegen, Session erstellen, Cookie | C2     |
| `POST`  | `/api/auth/login`     | Credentials prüfen, Session erstellen, Cookie   | C3     |
| `POST`  | `/api/auth/logout`    | Session löschen, Cookie entwerten               | C3     |

Antworten:

- **Erfolg:** `200`/`201` mit minimalem JSON (`{ ok: true }`); Cookie wird vom Server gesetzt. Die Weiterleitung passiert im Client (`router.push`).
- **Fehler bei Login:** `401` mit generischer Fehlermeldung „E-Mail oder Passwort ist falsch." — keine Unterscheidung zwischen unbekannter E-Mail und falschem Passwort (Schutz vor User-Enumeration).
- **Fehler bei Registrierung:** `409` wenn E-Mail bereits existiert; `400` bei ungültiger Eingabe.

Validierung der Request-Bodies erfolgt mit `zod`, weil das Projekt bereits TypeScript-first arbeitet und so die Typen aus dem Schema abgeleitet werden können.

---

## 8. Sicherheits-Erwägungen im MVP

**XSS-Token-Diebstahl** — `HttpOnly`-Cookie. React rendert nur escaped Inhalte; kein `dangerouslySetInnerHTML` in Auth-relevanten Pfaden.

**CSRF** — `SameSite=Lax`. Alle State-ändernden Aktionen laufen über Same-Origin-Formulare und Fetch.

**User-Enumeration** — Generische Fehlermeldung bei Login; Dummy-Hash-Vergleich bei unbekannter E-Mail (siehe §4).

**Brute Force** — Aus dem MVP-Scope ausgeklammert. Hashing-Cost 12 macht serverseitiges Bruteforcing teuer. Rate-Limiting wird in C2/C3 nicht implementiert, da es vorerst für den lokalen Gebrauch ohne skalierte Nutzung gedacht ist.

**Session-Fixation** — Nach erfolgreichem Login oder Register wird **immer** ein frischer Token erzeugt (keine Wiederverwendung bestehender Cookies).

**Klartext-Passwort** — Nirgends gespeichert oder geloggt. Auch nicht im Browser-Storage. Das Login-Formular hält den Wert nur im React-State. 

**Open Redirect** — Der `redirect`-Parameter wird gegen lokale Pfade validiert (siehe §6.3).

Bewusst **außerhalb** des MVP-Scopes:

- 2FA / TOTP.
- E-Mail-Verifikation.  
- Passwort-Reset.
- Rate-Limiting / Account-Lockout.
- Audit-Logs.
- Refresh-Token-Rotation.

Diese Punkte sind dokumentiert, damit klar ist, dass sie bewusst weggelassen — nicht vergessen — wurden. Für eine spätere Weiterentwicklung oder bei verbleibender Restzeit im Projekt können einzelne Punkte ergänzt werden. Aus diesen Gründen sind die oben genannten Themen als optionale Erweiterungen einzuordnen (vgl. PRD §6.3 Could-Have und §16 Ausblick) und nicht Teil der MVP-Abnahmekriterien.

---

## 9. Auswirkungen auf bestehenden Code

Damit C2/C3 wissen, was zu ändern ist:

- [src/middleware.ts](../src/middleware.ts) — `AUTH_ENABLED` auf `true` setzen, Public-Paths-Liste prüfen.
- [src/components/login/LoginForm.tsx](../src/components/login/LoginForm.tsx) — `handleSubmit` ruft `POST /api/auth/login` statt `router.push("/dashboard")`. Fehleranzeige ergänzen.
- `src/components/register/RegisterForm.tsx` — analog für Registrierung anlegen (existiert noch nicht).
- `src/lib/auth/` — neu: `session.ts` (Helper), `password.ts` (Hash/Verify), `cookie.ts` (Cookie-Konstanten).
- `prisma/schema.prisma` — `User` und `Session` ergänzen (siehe §3). Migration erstellen.
- `package.json` — `bcryptjs`, `zod` ergänzen.

---

## 10. Offene Punkte für die Team-Abstimmung

Diese Punkte werden im Team-Meeting bestätigt (Akzeptanzkriterium „Konzept im Team bestätigt"):

1. Ist die Entscheidung gegen eine Auth-Library mitgetragen?
2. Sind die Session-TTLs (24 h / 30 d) angemessen?
3. Soll die E-Mail-Verifikation wirklich entfallen? Falls ja: ist dem Auftraggeber klar, dass jede E-Mail-Eingabe akzeptiert wird?
4. Wer übernimmt C2 (Registrierung) und C3 (Login/Logout/Schutz)?

Nach Bestätigung wird dieses Dokument auf Status „Verbindlich" gehoben und die Tickets C2/C3 entsprechend verfeinert.
