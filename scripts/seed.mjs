#!/usr/bin/env node
// Befüllt die lokale Datenbank mit reproduzierbaren Demo-Daten für die
// Präsentation (PRD §6.2 Should-Have S4).
//
// Aufruf:  npm run seed
//
// Eigenschaften:
//   - Idempotent: legt einen festen Demo-Account an bzw. setzt dessen Daten
//     bei jedem Lauf sauber neu (kein Duplizieren).
//   - Rührt ausschließlich den Demo-Account an, keine anderen Nutzer.
//   - Nutzt denselben Algorithmus wie die App (kein doppelter Code).
//
// Demo-Login:  demo@learnhub.test  /  demo12345

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateStudyPlan } from "../src/lib/calculations/studyPlanAlgorithm.ts";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@learnhub.test";
const DEMO_PASSWORD = "demo12345";

const now = new Date();
/** Datum relativ zu heute, mit fester Uhrzeit (für deterministische Demo-Daten). */
function at(daysFromNow, hour = 10, minute = 0) {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // 1. Demo-Account anlegen oder wiederverwenden (Passwort immer frisch setzen).
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { displayName: "Demo Studentin", username: "demo", passwordHash },
    create: {
      email: DEMO_EMAIL,
      displayName: "Demo Studentin",
      username: "demo",
      passwordHash,
      role: "USER",
    },
  });

  // 2. Bestehende Demo-Daten entfernen (idempotent). Reihenfolge: erst Events
  //    (referenzieren Tasks/Pläne), dann Pläne (Cascade auf Tasks), dann Rest.
  await prisma.calendarEvent.deleteMany({ where: { ownerId: user.id } });
  await prisma.studyPlan.deleteMany({ where: { ownerId: user.id } });
  await prisma.notification.deleteMany({ where: { ownerId: user.id } });
  await prisma.notificationSettings.deleteMany({ where: { ownerId: user.id } });

  // 3. Standard-Benachrichtigungseinstellungen.
  await prisma.notificationSettings.create({ data: { ownerId: user.id } });

  // ── Lernplan A: Statistik Klausur (berechnet) ────────────────────────────
  const targetA = at(35, 9);
  const calcA = calculateStudyPlan({
    referenceDate: now,
    deadlineDate: targetA,
    difficulty: 3,
    priorKnowledge: 2,
    pages: 120,
    credits: 5,
  });
  const planA = await prisma.studyPlan.create({
    data: {
      title: "Statistik Klausur",
      subject: "Statistik",
      description: "Vorbereitung auf die Statistik-Klausur am Semesterende.",
      goalType: "KLAUSUR",
      targetDate: targetA,
      ownerId: user.id,
      difficulty: 3,
      priorKnowledge: 2,
      pages: 120,
      credits: 5,
      totalHours: calcA.totalHours,
      hoursPerDay: calcA.hoursPerDay,
      planType: calcA.planType,
    },
  });

  await prisma.task.create({
    data: { title: "Kapitel 1–3 durcharbeiten", estimatedMinutes: 180, difficulty: 3, dueDate: at(-7), completed: true, completedAt: at(-6), studyPlanId: planA.id },
  });
  await prisma.task.create({
    data: { title: "Übungsblatt 1 rechnen", estimatedMinutes: 120, difficulty: 3, dueDate: at(-3), completed: true, completedAt: at(-3), studyPlanId: planA.id },
  });
  await prisma.task.create({
    data: { title: "Kapitel 4: Hypothesentests", estimatedMinutes: 150, difficulty: 4, dueDate: at(-1), studyPlanId: planA.id },
  });
  const taskAltklausur = await prisma.task.create({
    data: { title: "Altklausur 2024 rechnen", estimatedMinutes: 120, difficulty: 4, dueDate: at(3, 14), studyPlanId: planA.id },
  });
  await prisma.task.create({
    data: { title: "Zusammenfassung erstellen", estimatedMinutes: 90, difficulty: 2, dueDate: at(10), studyPlanId: planA.id },
  });

  // Wiederkehrende Vorlesung + verknüpfte Lerneinheit zur Altklausur-Aufgabe.
  await prisma.calendarEvent.create({
    data: {
      title: "Statistik Vorlesung", startsAt: at(1, 10), endsAt: at(1, 11, 30),
      type: "VORLESUNG", typeLabel: "Vorlesung", subject: "Statistik",
      repeat: "weekly", source: "LOCAL", ownerId: user.id, studyPlanId: planA.id,
    },
  });
  await prisma.calendarEvent.create({
    data: {
      title: "Lernsession: Altklausur 2024", startsAt: at(3, 14), endsAt: at(3, 16),
      type: "LERNEINHEIT", typeLabel: "Lernsession", subject: "Statistik",
      source: "LOCAL", ownerId: user.id, studyPlanId: planA.id, taskId: taskAltklausur.id,
    },
  });

  // ── Lernplan B: Software Engineering Abgabe (berechnet) ───────────────────
  const targetB = at(14, 9);
  const calcB = calculateStudyPlan({
    referenceDate: now,
    deadlineDate: targetB,
    difficulty: 4,
    priorKnowledge: 3,
    pages: 80,
    credits: 6,
  });
  const planB = await prisma.studyPlan.create({
    data: {
      title: "Software Engineering Abgabe",
      subject: "Software Engineering",
      description: "Projektabgabe inkl. Dokumentation.",
      goalType: "ABGABE",
      targetDate: targetB,
      ownerId: user.id,
      difficulty: 4,
      priorKnowledge: 3,
      pages: 80,
      credits: 6,
      totalHours: calcB.totalHours,
      hoursPerDay: calcB.hoursPerDay,
      planType: calcB.planType,
    },
  });

  await prisma.task.create({
    data: { title: "Anforderungen analysieren", estimatedMinutes: 120, difficulty: 3, dueDate: at(-2), completed: true, completedAt: at(-2), studyPlanId: planB.id },
  });
  const taskKlassen = await prisma.task.create({
    data: { title: "Klassendiagramm erstellen", estimatedMinutes: 120, difficulty: 3, dueDate: at(2, 16), studyPlanId: planB.id },
  });
  await prisma.task.create({
    data: { title: "Implementierung Modul Auth", estimatedMinutes: 240, difficulty: 4, dueDate: at(6), studyPlanId: planB.id },
  });
  await prisma.task.create({
    data: { title: "Dokumentation schreiben", estimatedMinutes: 90, difficulty: 2, dueDate: at(11), studyPlanId: planB.id },
  });

  await prisma.calendarEvent.create({
    data: {
      title: "Lernsession: Klassendiagramm", startsAt: at(2, 16), endsAt: at(2, 18),
      type: "LERNEINHEIT", typeLabel: "Lernsession", subject: "Software Engineering",
      source: "LOCAL", ownerId: user.id, studyPlanId: planB.id, taskId: taskKlassen.id,
    },
  });

  // ── Lernplan C: Lineare Algebra (manuell, ohne Algorithmus) ───────────────
  const planC = await prisma.studyPlan.create({
    data: {
      title: "Lineare Algebra wiederholen",
      subject: "Mathematik",
      description: "Selbstlernziel zur Auffrischung der Grundlagen.",
      goalType: "SELBSTLERNZIEL",
      targetDate: at(50, 9),
      ownerId: user.id,
    },
  });
  await prisma.task.create({
    data: { title: "Vektorräume wiederholen", estimatedMinutes: 90, difficulty: 2, dueDate: at(5), studyPlanId: planC.id },
  });
  await prisma.task.create({
    data: { title: "Eigenwerte & Eigenvektoren üben", estimatedMinutes: 120, difficulty: 3, dueDate: at(12), studyPlanId: planC.id },
  });

  // ── Eigenständiger Termin (Typ Sonstiges) ────────────────────────────────
  await prisma.calendarEvent.create({
    data: {
      title: "Sprechstunde Prof. Schmidt", startsAt: at(1, 14), endsAt: at(1, 15),
      type: "SONSTIGES", typeLabel: "Sonstiges", subject: "Organisatorisches",
      source: "LOCAL", ownerId: user.id,
    },
  });

  const planCount = await prisma.studyPlan.count({ where: { ownerId: user.id } });
  const taskCount = await prisma.task.count({ where: { studyPlan: { ownerId: user.id } } });
  const eventCount = await prisma.calendarEvent.count({ where: { ownerId: user.id } });

  console.log("\n✓ Demo-Daten erstellt:");
  console.log(`  Login:        ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Lernpläne:    ${planCount} (A=berechnet ${calcA.planType}, B=berechnet ${calcB.planType}, C=manuell)`);
  console.log(`  Aufgaben:     ${taskCount} (inkl. erledigter und einer überfälligen)`);
  console.log(`  Termine:      ${eventCount} (Vorlesung, Lerneinheiten, Sonstiges)`);
  console.log("\n  Hinweis: Zieltermine erscheinen automatisch im Kalender (aus targetDate abgeleitet).\n");
}

main()
  .catch((error) => {
    console.error("\n✗ Seed fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
