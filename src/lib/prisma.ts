import { PrismaClient } from "@prisma/client";

// Singleton, damit der Dev-Server bei Hot-Reload nicht zig Prisma-Instanzen
// erzeugt (jede haelt eine eigene Pool-Verbindung zur Datenbank).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
