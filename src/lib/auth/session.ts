import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_TTL_DEFAULT_SECONDS,
  SESSION_TTL_REMEMBER_SECONDS,
  sessionCookieOptions,
} from "./cookie";

// >= 256 Bit Entropie gemaess docs/auth-concept.md §3 und §5.1.
function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Liest den Session-Cookie und gibt die userId zurück, oder null wenn
 * keine gültige Session existiert.
 */
export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    select: { userId: true, expiresAt: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return { userId: session.userId };
}

/**
 * Erstellt eine neue Session fuer den User: Token erzeugen, DB-Eintrag
 * anlegen, Cookie setzen. Wird von Register und (spaeter, in C3) Login
 * aufgerufen.
 */
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
