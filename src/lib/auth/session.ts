import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_TTL_DEFAULT_SECONDS,
  SESSION_TTL_REMEMBER_SECONDS,
  sessionCookieOptions,
} from "./cookie";

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
}

function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    select: { userId: true, expiresAt: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: token } }).catch(() => undefined);
    return null;
  }

  return { userId: session.userId };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: token } }).catch(() => undefined);
    return null;
  }

  return session.user;
}

export async function createSession(
  userId: string,
  rememberMe: boolean,
): Promise<void> {
  const token = generateSessionToken();
  const ttlSeconds = rememberMe
    ? SESSION_TTL_REMEMBER_SECONDS
    : SESSION_TTL_DEFAULT_SECONDS;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await prisma.session.create({
    data: { id: token, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(ttlSeconds));
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.delete({ where: { id: token } }).catch(() => undefined);
  }

  cookieStore.set(SESSION_COOKIE, "", sessionCookieOptions(0));
}
