import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_ROLE_COOKIE } from "@/lib/auth/cookie";

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
const ADMIN_ROLE = "ADMIN";
const DEV_ROLE = "DEV";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/api/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAdminApiPath(pathname: string) {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

function isAdminPagePath(pathname: string) {
  return pathname === "/admin" || pathname === "/admin/";
}

function isAdminOnlyPagePath(pathname: string) {
  return pathname.startsWith("/admin/") && pathname !== "/admin/";
}

function hasAdminRole(request: NextRequest) {
  return request.cookies.get(SESSION_ROLE_COOKIE)?.value === ADMIN_ROLE;
}

function hasFeedbackManagerRole(request: NextRequest) {
  const role = request.cookies.get(SESSION_ROLE_COOKIE)?.value;
  return role === ADMIN_ROLE || role === DEV_ROLE;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Nur Cookie-Existenz prüfen – keine DB-Validierung (Edge-Runtime hat kein Prisma).
  // Echte Session-Gültigkeit wird in Server Components / Route Handlern via getSession() geprüft.
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
  const isPublic = isPublicPath(pathname);
  const isAdminApi = isAdminApiPath(pathname);
  const isAdminPage = isAdminPagePath(pathname);
  const isAdminOnlyPage = isAdminOnlyPagePath(pathname);

  if (AUTH_ENABLED) {
    if (isAdminApi || isAdminOnlyPage) {
      if (!hasSessionCookie) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
        }

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }

      if (!hasAdminRole(request)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Keine Admin-Berechtigung." },
            { status: 403 },
          );
        }

        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (isAdminPage) {
      if (!hasSessionCookie) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }

      if (!hasFeedbackManagerRole(request)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

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

    // Kein Redirect von /login oder /register basierend nur auf Cookie-Existenz:
    // Cookie kann vorhanden sein obwohl die Session in der DB bereits ungültig ist (z. B. Logout in anderem Tab).
    // Ein Redirect würde dann zu einem Loop zwischen /login ↔ /dashboard führen.

  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API-Routen einschließen, damit die 401-Logik greift. Next.js-Interna
    // und alle statischen Dateien aus public/ (erkennbar an der Dateiendung)
    // ausschließen, unabhängig davon, in welchem Unterordner sie liegen.
    "/((?!_next|favicon.ico|.*\\.[^/]+$).*)",
  ],
};
