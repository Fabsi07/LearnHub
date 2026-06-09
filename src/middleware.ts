import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware für LearnHub — Auth-Schutz (C3).
 *
 * Schutzlogik:
 *   - Nicht eingeloggte User auf geschützten Pfaden → /login?redirect=<pfad>
 *   - Eingeloggte User auf /login oder /register → /dashboard
 *
 * Die Middleware prüft nur die Cookie-Existenz, nicht die DB-Gültigkeit
 * (Edge-Runtime hat keinen Prisma-Zugang). Echte Session-Validierung
 * erfolgt in Server Components und Route Handlern via getSession().
 * Siehe docs/auth-concept.md §6.3.
 *
 * Static Assets werden über config.matcher ausgenommen.
 */
const AUTH_ENABLED = true;

// Pfade die ohne Login erreichbar sein müssen.
// /api/auth/* ist bereits durch den matcher ("!api") vom Middleware-Matching ausgenommen.
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Nur Cookie-Existenz prüfen – keine DB-Validierung (Edge-Runtime hat kein Prisma).
  // Echte Session-Gültigkeit wird in Server Components / Route Handlern via getSession() geprüft.
  const hasSessionCookie = request.cookies.has("lh_session");
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (AUTH_ENABLED) {
    // Vollständiger Schutz: nicht eingeloggte User → /login
    if (!hasSessionCookie && !isPublic) {
      const loginUrl = new URL("/login", request.url);
      const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
      loginUrl.searchParams.set("redirect", redirectTo);
      return NextResponse.redirect(loginUrl);
    }
    // Eingeloggte User auf /login oder /register → /dashboard
    if (hasSessionCookie && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Alles außer API-Routen, Next.js-Interna und statische Assets.
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
