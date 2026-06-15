# LearnHub

LearnHub ist eine webbasierte Lernmanagement-Anwendung fuer Studierende. Sie buendelt Lernplaene, Aufgaben und Kalendertermine in einer Oberflaeche und berechnet aus Zieldatum, Aufwand und verfuegbarer Lernzeit einen nachvollziehbaren Lernplan.

Ausfuehrliche Beschreibung im [Product Requirements Document](./docs/prd.md). Architektur- und Stack-Entscheidungen in [docs/tech-stack.md](./docs/tech-stack.md).

---

## Voraussetzungen

Bevor du startest, brauchst du auf deinem Rechner:

- **Node.js 20** oder neuer — [nodejs.org](https://nodejs.org/) oder `nvm`
- **Docker Desktop** (fuer die lokale PostgreSQL-Datenbank) — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- **Git** — vorinstalliert auf macOS und Linux, auf Windows ueber [git-scm.com](https://git-scm.com/)

Docker Desktop muss nach der Installation einmal manuell gestartet werden und im Hintergrund laufen, damit `docker compose`-Befehle funktionieren.

### Erster Start von Docker Desktop

Beim allerersten Start fragt Docker einmalig nach Setup-Entscheidungen. Empfohlener Ablauf:

1. Docker Desktop aus dem Programme-Ordner (oder via Spotlight) starten.
2. Dialog „Finish setting up Docker Desktop" → **„Use recommended settings"** ausgewaehlt lassen, auf **„Finish"** klicken.
3. macOS fordert das Login-Passwort an — wird einmalig fuer die Installation der Privileged-Helper-Tools gebraucht.
4. Sign-In-Screen / Onboarding-Tutorial → **„Skip"** / „Continue without sign in" waehlen. Ein Docker-Account ist fuer LearnHub nicht erforderlich.
5. In der macOS-Menueleiste oben rechts erscheint ein **Wal-Symbol**. Solange es animiert ist, startet Docker. Sobald das Symbol still steht, ist Docker bereit und `docker`-Befehle funktionieren.

Der erste Start kann 1–3 Minuten dauern. Spaetere Starts brauchen nur wenige Sekunden.

---

## Erstes Setup

Aus dem Stand „frischer Checkout" zum laufenden Dev-Server:

```bash
# 1. Repository klonen
git clone https://github.com/Fabsi07/LearnHub.git
cd LearnHub

# 2. Node-Pakete installieren
npm install

# 3. Umgebungsvariablen vorbereiten
cp .env.example .env

# 4. Lokale PostgreSQL via Docker starten
docker compose up -d

# 5. Datenbank-Schema anwenden und Prisma-Client generieren
npm run prisma:migrate
npm run prisma:generate

# 6. Entwicklungs-Server starten
npm run dev
```

Anschliessend ist die App unter [http://localhost:3000](http://localhost:3000) erreichbar.

---

## Taegliche Befehle

| Was | Befehl |
| --- | --- |
| Dev-Server starten | `npm run dev` |
| Datenbank starten (Container im Hintergrund) | `docker compose up -d` |
| Datenbank stoppen (Daten bleiben erhalten) | `docker compose down` |
| Datenbank vollstaendig zuruecksetzen (Daten loeschen!) | `docker compose down -v` |
| Status der DB pruefen | `docker compose ps` |
| DB-Logs anschauen | `docker compose logs -f db` |
| Build pruefen | `npm run build` |
| Linter | `npm run lint` |
| TypeScript pruefen | `npm run typecheck` |

### Admin-Zugang

Der feste Admin-Account wird beim ersten Login automatisch angelegt. Die Defaults stehen in `.env.example` und koennen lokal ueber `ADMIN_EMAIL`, `ADMIN_PASSWORD` und `ADMIN_DISPLAY_NAME` ueberschrieben werden.

| Feld | Default |
| --- | --- |
| E-Mail | `0000@learnhub.admin` |
| Passwort | `0000admin` |

### Nach jedem `git pull`

Wenn sich `prisma/migrations/` veraendert hat (neue Migrationsdateien im Diff), muss die lokale Datenbank einmalig aktualisiert werden:

```bash
npm run prisma:migrate
```

**Woran erkennst du, dass Migrationen fehlen?** API-Routen antworten mit HTTP 500 und im Terminal erscheint ein Fehler wie:

```text
PrismaClientKnownRequestError: The column `User.xyz` does not exist in the current database. (code: P2022)
```

In diesem Fall einfach `npm run prisma:migrate` ausfuehren und den Dev-Server neu starten.

---

## Datenbank und Prisma

Die lokale PostgreSQL laeuft als Docker-Container, beschrieben in [docker-compose.yml](./docker-compose.yml). Die Verbindungs-URL steht in `.env`. Beide Werte muessen zusammenpassen — wenn du das eine aenderst, das andere mitziehen.

| Befehl | Was passiert |
| --- | --- |
| `npm run prisma:migrate` | Vergleicht das Prisma-Schema mit der Datenbank, erzeugt bei Bedarf eine neue Migration unter `prisma/migrations/` und wendet sie an |
| `npm run prisma:generate` | Erzeugt den typisierten Prisma-Client unter `node_modules/@prisma/client` auf Basis des aktuellen Schemas |

Nach Aenderungen am Schema (`prisma/schema.prisma`) immer beide Befehle ausfuehren.

---

## Troubleshooting

### API antwortet mit HTTP 500 und „column does not exist" (P2022)

Neue Migrationen wurden ins Repository gepusht, aber noch nicht auf der lokalen Datenbank angewendet. Loesung:

```bash
npm run prisma:migrate
```

Danach den Dev-Server neu starten. Dies passiert typischerweise nach einem `git pull`, wenn sich der Ordner `prisma/migrations/` veraendert hat.

### Docker-Befehle schlagen mit „Cannot connect to the Docker daemon" fehl

Docker Desktop laeuft nicht. Oeffne die Docker-Desktop-App, warte bis das Wal-Symbol in der Menueleiste ruhig wird (kein Lade-Animation mehr), dann den Befehl wiederholen.

### Port 5432 ist bereits belegt

Wahrscheinlich laeuft schon eine andere PostgreSQL auf deinem Rechner (native Installation, oder ein anderer Container). Pruefen mit:

```bash
lsof -i :5432
```

Loesung: die andere Instanz stoppen oder in `docker-compose.yml` das Port-Mapping aendern (z.B. `"5433:5432"`) und in `.env` die DATABASE_URL anpassen.

### `npm run prisma:migrate` faellt mit „Can't reach database server"

Der Container laeuft nicht oder die DATABASE_URL stimmt nicht. Pruefen:

```bash
docker compose ps         # Status: db sollte "running" / "healthy" sein
docker compose logs db    # Auf Fehler in den Logs achten
```

Falls der Container nicht laeuft: `docker compose up -d`. Falls die URL nicht stimmt: `.env` mit `docker-compose.yml` abgleichen.

### `npm run prisma:generate` zeigt eine Major-Version-Warnung

Aktuell laeuft das Projekt bewusst auf Prisma 6 (Team-Abstimmung, siehe Issue B1). Die Warnung auf eine spaetere Version kann ignoriert werden.

### Aenderungen am Schema werden nicht uebernommen

Pruefe ob `npm run prisma:generate` nach der Schema-Aenderung gelaufen ist. TypeScript-Typen sind erst nach `generate` aktuell. Bei hartnaeckigen Problemen: `node_modules/.prisma` loeschen und `npm install` neu laufen lassen.

### Datenbank-Daten loswerden und frisch starten

```bash
docker compose down -v    # Container + Volume entfernen
docker compose up -d      # Container neu erstellen
npm run prisma:migrate    # Schema neu anwenden
```

---

## Projekt-Dokumentation

- [Product Requirements Document](./docs/prd.md) — fachlicher Funktionsumfang
- [Tech-Stack](./docs/tech-stack.md) — eingesetzte Technologien und Begruendung
- [Auth-Konzept](./docs/auth-concept.md) — Login, Sessions, Schutzlogik
- [Manueller Abnahmetest](./docs/testing/manual-acceptance-test.md) — Test-Checkliste fuer UC1–UC6
- [Algorithmus-Konzept](./docs/Algorithmus/) — Entwurf fuer den Lernplan-Algorithmus
