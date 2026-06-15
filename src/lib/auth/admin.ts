import type { UserRole } from "@prisma/client";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const DEFAULT_ADMIN_EMAIL = "0000@learnhub.admin";
const DEFAULT_ADMIN_PASSWORD = "0000admin";
const DEFAULT_ADMIN_DISPLAY_NAME = "LearnHub Root";

export interface AdminCredentials {
  email: string;
  password: string;
  displayName: string;
}

export type AdminAuthResult =
  | { status: "ok"; user: CurrentUser }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

export function getAdminCredentials(): AdminCredentials {
  return {
    email: (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD,
    displayName:
      (process.env.ADMIN_DISPLAY_NAME ?? DEFAULT_ADMIN_DISPLAY_NAME).trim() ||
      DEFAULT_ADMIN_DISPLAY_NAME,
  };
}

export function isFixedAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === getAdminCredentials().email;
}

export async function ensureFixedAdminAccount() {
  const credentials = getAdminCredentials();
  const existing = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true, passwordHash: true, role: true },
  });

  if (!existing) {
    return prisma.user.create({
      data: {
        email: credentials.email,
        displayName: credentials.displayName,
        passwordHash: await hashPassword(credentials.password),
        role: "ADMIN",
      },
      select: { id: true },
    });
  }

  const hasConfiguredPassword = await verifyPassword(
    credentials.password,
    existing.passwordHash,
  );
  const data: { passwordHash?: string; role?: UserRole } = {};

  if (!hasConfiguredPassword) {
    data.passwordHash = await hashPassword(credentials.password);
  }
  if (existing.role !== "ADMIN") {
    data.role = "ADMIN";
  }

  if (Object.keys(data).length > 0) {
    await prisma.user.update({
      where: { id: existing.id },
      data,
      select: { id: true },
    });
  }

  return { id: existing.id };
}

export async function getAdminAuth(): Promise<AdminAuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "unauthenticated" };
  }
  if (user.role !== "ADMIN") {
    return { status: "forbidden" };
  }
  return { status: "ok", user };
}
