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
cp .env.example .env.local

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

---

## Datenbank und Prisma

Die lokale PostgreSQL laeuft als Docker-Container, beschrieben in [docker-compose.yml](./docker-compose.yml). Die Verbindungs-URL steht in `.env.local`. Beide Werte muessen zusammenpassen — wenn du das eine aenderst, das andere mitziehen.

| Befehl | Was passiert |
| --- | --- |
| `npm run prisma:migrate` | Vergleicht das Prisma-Schema mit der Datenbank, erzeugt bei Bedarf eine neue Migration unter `prisma/migrations/` und wendet sie an |
| `npm run prisma:generate` | Erzeugt den typisierten Prisma-Client unter `node_modules/@prisma/client` auf Basis des aktuellen Schemas |

Nach Aenderungen am Schema (`prisma/schema.prisma`) immer beide Befehle ausfuehren.

---

## Troubleshooting

### Docker-Befehle schlagen mit „Cannot connect to the Docker daemon" fehl

Docker Desktop laeuft nicht. Oeffne die Docker-Desktop-App, warte bis das Wal-Symbol in der Menueleiste ruhig wird (kein Lade-Animation mehr), dann den Befehl wiederholen.

### Port 5432 ist bereits belegt

Wahrscheinlich laeuft schon eine andere PostgreSQL auf deinem Rechner (native Installation, oder ein anderer Container). Pruefen mit:

```bash
lsof -i :5432
```

Loesung: die andere Instanz stoppen oder in `docker-compose.yml` das Port-Mapping aendern (z.B. `"5433:5432"`) und in `.env.local` die DATABASE_URL anpassen.

### `npm run prisma:migrate` faellt mit „Can't reach database server"

Der Container laeuft nicht oder die DATABASE_URL stimmt nicht. Pruefen:

```bash
docker compose ps         # Status: db sollte "running" / "healthy" sein
docker compose logs db    # Auf Fehler in den Logs achten
```

Falls der Container nicht laeuft: `docker compose up -d`. Falls die URL nicht stimmt: `.env.local` mit `docker-compose.yml` abgleichen.

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
