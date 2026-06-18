#!/usr/bin/env node
// Automatisiert das lokale Setup: .env anlegen, Docker-DB hochfahren,
// Bereits eingecheckte Prisma-Migrationen anwenden und Client generieren.
//
// Aufruf: npm run setup
//
// Was bewusst NICHT passiert:
//   - npm install (muss vorher gelaufen sein, sonst gaebe es dieses Skript nicht)
//   - npm run dev (long-running, soll der User selbst starten)
//   - .env ueberschreiben (Custom-Werte sollen nicht verloren gehen)

import { existsSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const step = (msg) => console.log(`\n→ ${msg}`);
const done = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const run = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch {
    fail(`Befehl fehlgeschlagen: ${cmd}`);
  }
};

// 1. .env anlegen, falls nicht vorhanden
step(".env pruefen");
if (existsSync(".env")) {
  done(".env existiert bereits — uebersprungen");
} else {
  if (!existsSync(".env.example")) {
    fail(".env.example nicht gefunden — bist du im Projekt-Root?");
  }
  copyFileSync(".env.example", ".env");
  done(".env aus .env.example angelegt");
}

// 2. Docker-DB hochfahren (--wait blockiert bis Healthcheck gruen ist)
step("Docker-Datenbank starten");
run("docker compose up -d --wait");
done("Datenbank laeuft");

// 3. Bereits eingecheckte Prisma-Migrationen anwenden.
// `migrate deploy` ist fuer das Setup reproduzierbarer als `migrate dev`,
// weil dabei niemals versehentlich eine neue Migration erzeugt wird.
step("Prisma-Migrationen anwenden");
run("npm run prisma:deploy");
done("Schema synchronisiert");

// 4. Prisma-Client generieren
step("Prisma-Client generieren");
run("npm run prisma:generate");
done("Client generiert");

console.log("\nFertig. Jetzt: npm run dev");
