# Authentifizierungs- und Berechtigungskonzept

> **Status:** Implementiert
> **Zuletzt mit dem Code abgeglichen:** 18.06.2026

## 1. Zweck und Umfang

LearnHub verwendet eine eigene, schlanke E-Mail-/Passwort-Authentifizierung über Next.js Route Handler. Das Konzept deckt Registrierung, Login, Logout, Sitzungen sowie die Rollen `USER`, `DEV` und `ADMIN` ab.

Bewusst nicht Bestandteil des MVP sind:

- E-Mail-Verifikation
- Passwort-Reset
- Single Sign-on oder DHBW-Login
- Zwei-Faktor-Authentifizierung
- Rate-Limiting und Account-Sperren

Für das Passwort-Hashing wird keine eigene Kryptografie implementiert, sondern `bcryptjs` verwendet.

## 2. Datenmodell

Die maßgeblichen Modelle stehen in [`prisma/schema.prisma`](../prisma/schema.prisma):

- `User` speichert E-Mail, Anzeigename, Passwort-Hash, Rolle und optionale Profildaten.
- `Session` speichert einen opaken Sitzungstoken, die zugehörige User-ID und den Ablaufzeitpunkt.
- Beim Löschen eines Users werden dessen Sessions über `onDelete: Cascade` entfernt.

Die E-Mail ist eindeutig und wird bei Registrierung und Login normalisiert in Kleinschreibung verarbeitet.

## 3. Passwörter

- Passwörter werden mit bcrypt und Cost-Faktor 12 gehasht.
- Bei der Registrierung sind mindestens acht Zeichen erforderlich.
- Klartextpasswörter werden weder gespeichert noch protokolliert oder über eine API zurückgegeben.
- Beim Login wird auch für unbekannte E-Mail-Adressen ein bcrypt-Vergleich gegen einen Dummy-Hash ausgeführt. Dadurch lässt sich die Existenz eines Accounts nicht einfach aus der Antwortzeit ableiten.
- Eine fehlgeschlagene Anmeldung liefert unabhängig von der Ursache die generische Meldung „E-Mail oder Passwort ist falsch.“

Die Implementierung befindet sich in [`src/lib/auth/password.ts`](../src/lib/auth/password.ts) sowie den Auth-Route-Handlern unter [`src/app/api/auth`](../src/app/api/auth).

## 4. Sitzungen und Cookies

Bei erfolgreicher Registrierung oder Anmeldung erzeugt der Server mit `crypto.randomBytes(32)` einen zufälligen Session-Token. Der Token wird als ID der `Session` gespeichert und im Cookie `lh_session` gesetzt.

| Cookie | Zweck |
|---|---|
| `lh_session` | Opaker Token zur serverseitigen Session-Prüfung |
| `lh_role` | Rollenhinweis für die frühe Weiterleitung in der Middleware |

Beide Cookies verwenden:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` in Produktionsumgebungen
- `Path=/`

Die Laufzeit beträgt ohne „Eingeloggt bleiben“ 24 Stunden, mit aktivierter Option 30 Tage. Eine Sliding-Renewal findet nicht statt.

`getSession()` und `getCurrentUser()` in [`src/lib/auth/session.ts`](../src/lib/auth/session.ts) prüfen den Token gegen die Datenbank und verwerfen abgelaufene Sessions. Beim Logout wird die aktuelle Session gelöscht und beide Cookies werden entwertet.

## 5. Auth-Endpunkte

| Methode | Pfad | Verhalten |
|---|---|---|
| `POST` | `/api/auth/register` | Eingaben validieren, User und Session erstellen |
| `POST` | `/api/auth/login` | Zugangsdaten prüfen und Session erstellen |
| `POST` | `/api/auth/logout` | Session löschen und Cookies entwerten |

Die Request-Bodies werden mit Zod validiert. Eine doppelte Registrierung liefert Status `409`, ungültige Eingaben Status `400` und falsche Zugangsdaten Status `401`.

## 6. Schutz von Seiten und APIs

[`src/middleware.ts`](../src/middleware.ts) schützt alle nicht öffentlichen Seiten und APIs:

- Ohne Session-Cookie werden Seiten auf `/login?redirect=<pfad>` weitergeleitet.
- Geschützte APIs antworten ohne Session-Cookie mit `401`.
- Die Middleware prüft nur die Existenz der Cookies, da sie keinen Prisma-Zugriff verwendet.
- Die tatsächliche Gültigkeit der Session wird anschließend serverseitig über `getSession()` oder `getCurrentUser()` geprüft.
- Das Layout der geschützten `(app)`-Route-Group leitet bei ungültiger oder abgelaufener Session auf `/login` um.

Öffentlich sind insbesondere `/login`, `/register` und `/api/auth/*`. Nach einem erfolgreichen Login wird ein lokaler `redirect`-Pfad berücksichtigt; externe oder mit `//` beginnende Ziele werden abgelehnt.

## 7. Rollen und Admin-Zugriff

Das Datenmodell kennt die Rollen:

- `USER`: reguläre Nutzung
- `DEV`: Zugriff auf die Feedback-Verwaltung
- `ADMIN`: Benutzer- und Feedback-Verwaltung

Die Middleware verwendet `lh_role` nur für eine frühe Navigation beziehungsweise Ablehnung. Autoritative Berechtigungsprüfungen laden den aktuellen User aus der Datenbank und prüfen dessen Rolle serverseitig über [`src/lib/auth/admin.ts`](../src/lib/auth/admin.ts).

Ein fester Admin-Account wird über `ADMIN_EMAIL`, `ADMIN_PASSWORD` und `ADMIN_DISPLAY_NAME` konfiguriert. Die lokalen Beispielwerte stehen in [`.env.example`](../.env.example) und sind nicht für einen produktiven Betrieb geeignet. Die reservierte Admin-E-Mail kann nicht über die normale Registrierung angelegt werden.

## 8. Nutzerbezogene Daten

Alle fachlichen API-Routen ermitteln den eingeloggten Nutzer serverseitig und begrenzen Datenbankabfragen auf dessen User-ID. Dadurch sind Lernpläne, Aufgaben, Kalenderdaten, Benachrichtigungen, Einstellungen und Feedback nutzerbezogen.

Anzeigename, E-Mail, Rolle und Profilbild werden über `getCurrentUser()` in den geschützten App-Bereich gereicht. Der Upload eines Profilbilds ist implementiert; das Bearbeiten von Name, E-Mail und Passwort in den Einstellungen ist derzeit noch nicht funktional angebunden.

## 9. Sicherheitsgrenzen des MVP

Die aktuelle Lösung ist für den lokalen Hochschul-MVP ausgelegt. Für einen öffentlichen Produktivbetrieb wären insbesondere Rate-Limiting, sichere produktive Admin-Credentials, Passwort-Reset, E-Mail-Verifikation, Audit-Logging und zusätzliche CSRF-Schutzmaßnahmen zu ergänzen.
