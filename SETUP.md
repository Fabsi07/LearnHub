# LearnHub — Setup-Anleitung

Komplette Schritt-fuer-Schritt-Anleitung, um LearnHub auf einem frischen Rechner zum Laufen zu bekommen — auch ohne Vorwissen zu Node, Docker oder Datenbanken.

> **Ziel der Datei:** Alles, was du brauchst, an einer Stelle. Keine Verweise auf andere Dokumente noetig, um anzufangen.

---

## Inhaltsverzeichnis

1. [Was du installiert haben musst](#1-was-du-installiert-haben-musst)
2. [Setup in 6 Schritten](#2-setup-in-6-schritten)
3. [Erster Start im Browser](#3-erster-start-im-browser)
4. [Cheatsheet: Befehle fuer den Alltag](#4-cheatsheet-befehle-fuer-den-alltag)
5. [Troubleshooting (wenn was nicht klappt)](#5-troubleshooting-wenn-was-nicht-klappt)
6. [Glossar (Begriffe einfach erklaert)](#6-glossar-begriffe-einfach-erklaert)
7. [Bekannte Einschraenkungen](#7-bekannte-einschraenkungen)

---

## 1. Was du installiert haben musst

Drei Tools, einmalig zu installieren. Wenn du eines schon hast, ueberspring den Punkt.

### Node.js (LTS-Version)

Pruefen ob bereits installiert:

```bash
node --version
```

- Empfohlen ist eine von Node.js aktuell unterstuetzte **LTS-Version**, mindestens Node 20.
- Fuer das Team sollte moeglichst dieselbe LTS-Hauptversion verwendet werden. Das vermeidet Unterschiede zwischen Entwicklungsrechnern und CI.
- Ausgabe `command not found` (macOS/Linux) bzw. „is not recognized" (Windows) oder Version unter 20 → von [nodejs.org](https://nodejs.org/) die **LTS-Variante** installieren.

Danach auch npm pruefen:

```bash
npm --version
```

Wenn `node --version` funktioniert, aber `npm --version` fehlschlaegt, ist die
Node-Installation unvollstaendig oder eine alte globale npm-Installation stoert.
Siehe [Node funktioniert, aber npm ist kaputt](#node-funktioniert-aber-npm-ist-kaputt-windows).

### Docker Desktop

Brauchen wir, damit PostgreSQL lokal in einem Container laeuft — du musst PostgreSQL also nicht selbst installieren.

Pruefen:

```bash
docker --version
docker compose version
docker info
```

- `docker --version` und `docker compose version` pruefen nur die Installation.
- Erst wenn `docker info` Serverinformationen ausgibt, laeuft Docker Desktop wirklich.
- Meldet `docker info`, dass keine Verbindung zur Docker API moeglich ist, Docker Desktop starten und warten, bis es bereit ist.
- Nicht gefunden → von [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) installieren.

#### Nach der Installation: macOS / Linux

1. Docker Desktop oeffnen (Programme-Ordner oder Spotlight).
2. „Use recommended settings" → „Finish".
3. macOS fragt nach dem Login-Passwort, das ist normal.
4. Sign-In-Screen mit „Skip" / „Continue without sign in" ueberspringen — ein Account ist nicht noetig.
5. In der macOS-Menueleiste **oben rechts** erscheint ein **Wal-Symbol**.
   - Animiertes Wal-Symbol = startet noch, warten.
   - Ruhiges Wal-Symbol = Docker ist bereit.

#### Nach der Installation: Windows

Auf Windows nutzt Docker Desktop intern **WSL 2** (Windows Subsystem for Linux). Das wird beim Installer abgefragt — Haken bei „Use WSL 2 instead of Hyper-V" lassen.

1. Beim ersten Start fragt Docker evtl. nach Installation von WSL-Updates und Neustart. Mitmachen.
2. Nach dem Neustart Docker Desktop erneut starten.
3. „Use recommended settings" → „Finish", Sign-In skippen.
4. Im **System-Tray unten rechts** (kleiner Pfeil neben der Uhr) erscheint das **Wal-Symbol**.
   - Symbol mit Bewegung = startet.
   - Ruhiges Symbol = Docker ist bereit.

> **Hinweis:** Erste Installation auf Windows kann 10-15 Minuten dauern (WSL-Setup, Neustart). Spaetere Starts dann nur Sekunden. Falls Docker beim Start haengt, siehe [Troubleshooting](#docker-startet-nicht-windows).

### Git

Pruefen:

```bash
git --version
```

- Ausgabe `git version 2.x.x` o. ae. → passt.
- Nicht gefunden:
  - **macOS:** im Terminal `xcode-select --install` ausfuehren.
  - **Linux:** `sudo apt install git` (Ubuntu/Debian) bzw. ueber den Paketmanager der Distro.
  - **Windows:** von [git-scm.com](https://git-scm.com/) installieren. Mit dem Installer wird automatisch **Git Bash** mitinstalliert — ein Terminal, das sich wie macOS/Linux verhaelt (siehe Hinweis unten).

> **Empfehlung fuer Windows-User:** Fuehre die Befehle in dieser Anleitung in **Git Bash** aus (Rechtsklick im Projektordner → „Git Bash here"). Dort funktionieren `cp`, `rm`, `ls` etc. identisch zu macOS/Linux. Wenn du PowerShell oder cmd lieber moechtest, sind die Windows-spezifischen Befehle in jedem Schritt mit aufgefuehrt.

---

## 2. Setup in 6 Schritten

Alle Befehle in dieser Reihenfolge im Terminal ausfuehren.

### Schritt 1: Repository klonen

```bash
git clone https://github.com/Fabsi07/LearnHub.git
cd LearnHub
```

**Was passiert:** Lokale Kopie des Repos wird heruntergeladen, anschliessend wechselst du in den Ordner. Identisch auf allen Systemen.

### Schritt 2: Node-Pakete installieren

```bash
npm ci
```

**Was passiert:** Alle Bibliotheken werden exakt nach `package-lock.json` in
`node_modules/` installiert. Das ist fuer einen frischen Checkout reproduzierbarer
als `npm install` und dauert beim ersten Mal typischerweise 1-2 Minuten.

`npm install` wird verwendet, wenn Abhaengigkeiten bewusst hinzugefuegt oder
aktualisiert werden sollen und sich dadurch das Lockfile aendern darf.

> **Shortcut fuer Eilige:** Die Schritte 3-5 (`.env` anlegen, DB starten, Prisma) gibt's auch als einzelnen Befehl: `npm run setup`. Schritt 6 (`npm run dev`) startest du danach selbst. Die ausfuehrliche Anleitung unten bleibt hilfreich, falls beim Skript etwas nicht klappt.

### Schritt 3: Umgebungsvariablen vorbereiten

**Was passiert:** Eine Vorlage wird in eine echte Konfigurationsdatei kopiert. In `.env` steht z. B. die Verbindungs-URL zur Datenbank. Die Datei ist absichtlich in `.gitignore` und landet nicht in GitHub.

**macOS / Linux / Git Bash:**

```bash
cp .env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Windows (cmd):**

```cmd
copy .env.example .env
```

> Du musst die Datei normalerweise **nicht** anpassen — die Vorgaben passen zum Docker-Setup unten.

### Schritt 4: Datenbank starten

```bash
docker compose up -d
```

**Was passiert:** Docker startet einen PostgreSQL-Container im Hintergrund (`-d` steht fuer „detached", also unsichtbar).

Pruefen ob alles laeuft:

```bash
docker compose ps
```

Erwartete Ausgabe: in der Spalte „STATUS" steht bei `learnhub-db` etwas wie `Up X seconds (healthy)`. Identisch auf allen Systemen.

### Schritt 5: Datenbank-Schema anwenden

```bash
npm run prisma:deploy
npm run prisma:generate
```

**Was passiert:**

- `prisma:deploy` wendet die bereits im Repository eingecheckten Migrationen an und legt damit alle Tabellen an.
- `prisma:generate` erzeugt den typisierten Datenbank-Client, mit dem der Code spaeter die DB abfragt.

Der Setup-Ablauf erzeugt bewusst **keine neue Migration**. Nur wenn du selbst
`prisma/schema.prisma` aenderst, verwendest du als Entwickler
`npm run prisma:migrate`, um eine neue Migration anzulegen.

### Schritt 6: Entwicklungs-Server starten

```bash
npm run dev
```

**Was passiert:** Next.js startet die App lokal. Im Terminal erscheinen Logs, am Ende eine Zeile wie:

```
- Local:        http://localhost:3000
```

Das Fenster bleibt offen, solange du arbeitest. Beenden mit `Ctrl + C` (auf allen Systemen, auch macOS — im Terminal ist es `Ctrl`, nicht `Cmd`).

---

## 3. Erster Start im Browser

1. Browser oeffnen, [http://localhost:3000](http://localhost:3000) aufrufen.
2. Du landest auf der Login-Seite — das ist Absicht: ohne Account siehst du nichts.
3. Auf „Jetzt registrieren" klicken, ein Konto anlegen (irgendeine E-Mail + Passwort, alles laeuft lokal).
4. Nach dem Registrieren landest du im Dashboard. Setup geschafft.

---

## 4. Cheatsheet: Befehle fuer den Alltag

Plattformunabhaengig, in jedem Terminal nutzbar (macOS Terminal, Linux Shell, Git Bash, PowerShell, cmd).

| Was du willst | Befehl |
| --- | --- |
| Dev-Server starten | `npm run dev` |
| Datenbank starten (Container im Hintergrund) | `docker compose up -d` |
| Datenbank stoppen (Daten bleiben erhalten) | `docker compose down` |
| Datenbank **komplett** zuruecksetzen (Daten weg!) | `docker compose down -v` |
| Status der DB pruefen | `docker compose ps` |
| Logs der DB anschauen | `docker compose logs -f db` |
| Build-Check (so wie die CI ihn macht) | `npm run build` |
| Code-Stil pruefen (Linter) | `npm run lint` |
| Eingecheckte Migrationen nach `git pull` anwenden | `npm run prisma:deploy` |
| Eigene Schema-Aenderung als neue Migration entwickeln | `npm run prisma:migrate` |
| Prisma-Client nach Schema-Aenderung neu generieren | `npm run prisma:generate` |

> **Faustregel:** Wenn nach `git pull` neue Dateien unter `prisma/migrations/`
> vorhanden sind, `npm run prisma:deploy` und danach
> `npm run prisma:generate` ausfuehren.

---

## 5. Troubleshooting (wenn was nicht klappt)

### „Cannot connect to the Docker daemon"

Docker Desktop laeuft nicht. Oeffne Docker Desktop, warte bis das Wal-Symbol ruhig ist (macOS oben rechts, Windows im System-Tray unten rechts), dann den Befehl wiederholen.

Pruefen:

```bash
docker info
```

`docker --version` allein reicht nicht, weil dieser Befehl auch bei beendetem
Docker Desktop funktioniert.

### Node funktioniert, aber npm ist kaputt (Windows)

Typisches Fehlerbild:

```text
Cannot find module '...\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js'
```

Vorgehen:

1. Alle VS-Code-Terminals schliessen.
2. Unter **Installierte Apps** die bestehende Node.js-Installation deinstallieren.
3. Die aktuelle **Node.js-LTS-Version** von [nodejs.org](https://nodejs.org/) installieren.
4. VS Code komplett neu starten, damit der aktualisierte `PATH` geladen wird.
5. In einem neuen PowerShell-Terminal pruefen:

```powershell
where.exe node
where.exe npm
node --version
npm --version
```

`node` und `npm` sollten beide aus `C:\Program Files\nodejs\` kommen. Falls unter
`%APPDATA%\npm` noch alte globale Startdateien liegen, diesen Ordner nicht
ungeprueft loeschen: Dort koennen auch andere global installierte Werkzeuge liegen.
Eine saubere Node-LTS-Neuinstallation ist in diesem Fall der robusteste Weg.

### Docker startet nicht (Windows)

Auf Windows haengt das fast immer an WSL 2. Pruefen:

```bash
wsl --status
```

- „Standardversion: 2" → ok.
- „WSL ist nicht installiert" → in PowerShell als Administrator: `wsl --install`, danach Neustart.
- Andere Fehler: Docker Desktop einmal komplett schliessen (auch im System-Tray Rechtsklick → „Quit Docker Desktop"), dann neu starten.

Wenn dein Rechner Virtualisierung im BIOS deaktiviert hat, muss die einmalig aktiviert werden — Suchbegriff „Enable virtualization in BIOS \[Mainboard-Hersteller\]".

### Port 5432 ist bereits belegt

Auf deinem Rechner laeuft schon eine andere PostgreSQL.

**macOS / Linux / Git Bash:**

```bash
lsof -i :5432
```

**Windows (PowerShell oder cmd):**

```powershell
netstat -ano | findstr :5432
```

Loesung: die andere PostgreSQL stoppen — oder nur in der lokalen `.env`
den Host-Port konfigurieren:

```env
POSTGRES_PORT="5433"
DATABASE_URL="postgresql://learnhub:learnhub_dev@localhost:5433/learnhub"
```

Danach den Container mit `docker compose up -d --force-recreate --wait`
neu erstellen. `docker-compose.yml` muss fuer einen lokalen Portkonflikt
nicht veraendert werden.

### `npm run prisma:migrate` schlaegt fehl mit „Can't reach database server"

Der Container laeuft nicht oder die DATABASE_URL stimmt nicht. Pruefen:

```bash
docker compose ps         # db sollte "Up" und "healthy" sein
docker compose logs db    # Auf Fehlermeldungen achten
```

- Container nicht laeuft → `docker compose up -d`.
- URL stimmt nicht → `.env` mit `docker-compose.yml` vergleichen (Port, Benutzername, Passwort, DB-Name muessen zusammenpassen).

### Build schlaegt mit „Module not found: Can't resolve …" fehl

Dependencies fehlen oder sind veraltet. Loesung:

```bash
npm ci
```

### TypeScript-Fehler nach Schema-Aenderung

Der Prisma-Client wurde nach der Aenderung nicht neu generiert.

```bash
npm run prisma:generate
```

Dann den Dev-Server neu starten (`Ctrl + C` → `npm run dev`).

### Build laeuft lokal, aber CI auf GitHub ist rot

Lokal hast du evtl. andere Node-Module installiert als die CI. Versuch:

**macOS / Linux / Git Bash:**

```bash
rm -rf .next node_modules
npm install
npm run prisma:generate
npm run build
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force .next, node_modules
npm ci
npm run prisma:generate
npm run build
```

**Windows (cmd):**

```cmd
rmdir /s /q .next
rmdir /s /q node_modules
npm ci
npm run prisma:generate
npm run build
```

Wenn das auch knallt: gleiches Verhalten wie in der CI, der Fehler ist echt.

### Holzhammer: ich will alles auf Anfang setzen

Erst die DB platt machen und Build-Cache loeschen, dann alles neu aufbauen.

**macOS / Linux / Git Bash:**

```bash
docker compose down -v
rm -rf .next node_modules
npm ci
docker compose up -d
npm run prisma:deploy
npm run prisma:generate
npm run dev
```

**Windows (PowerShell):**

```powershell
docker compose down -v
Remove-Item -Recurse -Force .next, node_modules
npm ci
docker compose up -d
npm run prisma:deploy
npm run prisma:generate
npm run dev
```

Das geht etwa 3 Minuten und ist die Variante fuer „irgendwas ist kaputt, ich weiss nicht was".

---

## 6. Glossar (Begriffe einfach erklaert)

| Begriff | Was es ist |
| --- | --- |
| **Node.js** | Laufzeit, die JavaScript-/TypeScript-Code ausserhalb vom Browser ausfuehrt. Das Backend von Next.js laeuft auf Node. |
| **npm** | Der Paket-Manager fuer Node — installiert Bibliotheken und fuehrt Skripte aus `package.json` aus. |
| **Docker** | Tool, um Software in „Containern" zu starten. Du brauchst PostgreSQL nicht selbst zu installieren — Docker startet eine vorgefertigte Version isoliert auf deinem Rechner. |
| **Container** | Isolierte Mini-Umgebung mit einer Software drin. Bei uns laeuft PostgreSQL als Container. |
| **PostgreSQL** | Die Datenbank, in der LearnHub seine Daten speichert. |
| **WSL 2** | Windows Subsystem for Linux — eine eingebaute Mini-Linux-Umgebung in Windows. Docker Desktop nutzt sie als Unterbau. |
| **Prisma** | Bibliothek, mit der wir aus dem TypeScript-Code Datenbank-Abfragen machen. Die Datei `prisma/schema.prisma` beschreibt das Datenmodell. |
| **Migration** | Datei, die eine Aenderung am Datenbank-Schema beschreibt (z. B. „neue Spalte hinzufuegen"). Liegt unter `prisma/migrations/`. |
| **Prisma-Client** | Generierter TypeScript-Code, der die DB-Abfragen typisiert. Wird von `npm run prisma:generate` erzeugt. |
| **Next.js** | Framework, mit dem Frontend und Backend von LearnHub gebaut sind. |
| **App Router** | Das Routing-System in Next.js 13+, basiert auf Ordnerstruktur unter `src/app/`. |
| **Dev-Server** | Lokaler Server fuer die Entwicklung. Aenderungen am Code werden beim Speichern sofort sichtbar (Hot Reload). |
| **Hot Reload** | Code-Aenderung im Editor → Browser aktualisiert sich automatisch. Funktioniert nur bei `npm run dev`. |
| **CI** | Continuous Integration — automatischer Build- und Lint-Check, der bei jedem Pull Request laeuft (GitHub Actions). |
| **`.env`** | Datei mit Umgebungsvariablen (z. B. Datenbank-URL). Wird nie in Git eingecheckt, damit Secrets nicht ins Repo gelangen. |
| **`.env.example`** | Vorlage fuer `.env`, die im Repo liegt. Beim Setup einmal kopieren. |
| **Git Bash** | Terminal-Programm fuer Windows, das wie macOS/Linux funktioniert. Wird mit Git for Windows mitinstalliert. |
| **PowerShell / cmd** | Die Standard-Terminals von Windows. Andere Syntax als Bash. |

---

## 7. Bekannte Einschraenkungen

Stand des MVP (Mai/Juni 2026), wichtig zu wissen:

- **Keine Email-Verifizierung beim Registrieren** — jede E-Mail wird akzeptiert, Hauptsache eindeutig.
- **Keine Passwort-Wiederherstellung** — wer das Passwort vergisst, muss neu registrieren oder direkt in die DB schreiben.
- **DHBW-Kalender:** Vorlesungen werden ueber den DHBW-ICS-Feed geladen. Der externe Server ist gelegentlich instabil; bei Fehlern erscheint eine Hinweismeldung, die App bleibt nutzbar.
- **Avatar-Bilder** werden aktuell direkt als Binaerdaten in PostgreSQL gespeichert. Fuer das lokale MVP ist das ausreichend; fuer einen Produktivbetrieb waere ein Objektspeicher sinnvoller.
- **Profil- und Benachrichtigungseinstellungen** sind teilweise noch Mock-Oberflaechen. Unter anderem sind Namens-/E-Mail-Aenderung, Passwort-Reset und allgemeine Deadline-Erinnerungen noch nicht vollstaendig angebunden.
- **Lernplaene, Aufgaben, algorithmische Planung und Kalenderuebernahme** sind implementiert. Die Berechnungsfaktoren sind ein transparenter Projektansatz, aber noch nicht lernwissenschaftlich validiert.
- **Performance auf Windows** ist durch die WSL-Schicht etwas langsamer als auf macOS oder Linux. Fuer die Entwicklung kein Problem.

---

## Hilfe und weiterfuehrende Doku

- **Technische Architektur und Stack:** [docs/tech-stack.md](./docs/tech-stack.md)
- **Funktionsumfang und Anforderungen:** [docs/prd.md](./docs/prd.md)
- **Auth-Konzept:** [docs/auth-concept.md](./docs/auth-concept.md)
- **AI-Coding-Hinweise:** [CLAUDE.md](./CLAUDE.md) und [AGENTS.md](./AGENTS.md)

Wenn etwas fehlt oder unklar ist, einfach im Team Bescheid sagen — diese Anleitung wird mit dem Projekt aktuell gehalten.
