import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/cookie";

/**
 * Middleware für LearnHub — Auth-Schutz (C3).
 *
 * Schutzlogik:
 *   - Nicht eingeloggte User auf geschützten Pfaden → /login?redirect=<pfad>
 *   - Nicht eingeloggte User auf geschützten API-Routen → 401 JSON
 *   - Eingeloggte User auf /login oder /register → /dashboard
 *
 * Die Middleware prüft nur die Cookie-Existenz, nicht die DB-Gültigkeit
 * (Edge-Runtime hat keinen Prisma-Zugang). Echte Session-Validierung
 * erfolgt in Server Components und Route Handlern via getSession().
 * Siehe docs/auth-concept.md §6.3.
 */
const AUTH_ENABLED = true;

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/api/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Nur Cookie-Existenz prüfen – keine DB-Validierung (Edge-Runtime hat kein Prisma).
  // Echte Session-Gültigkeit wird in Server Components / Route Handlern via getSession() geprüft.
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
  const isPublic = isPublicPath(pathname);

  if (AUTH_ENABLED) {
    if (!hasSessionCookie && !isPublic) {
      // API-Routen: 401 JSON statt Redirect
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
      }
      // Seiten: Redirect auf Login mit Rücksprung-Pfad
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    // Eingeloggte User auf Login/Register → Dashboard
    if (hasSessionCookie && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API-Routen einschließen damit die 401-Logik greift.
    // _next-Interna und statische Assets ausschließen.
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
