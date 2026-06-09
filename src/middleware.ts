import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware für LearnHub.
 *
 * Aktuell ist die Authentifizierung **deaktiviert** – jede Route ist offen
 * erreichbar. Sobald echtes Auth integriert ist (z.B. NextAuth oder Clerk),
 * den `AUTH_ENABLED`-Flag auf `true` setzen.
 *
 * Schutzlogik:
 *   - Eingeloggte User auf `/login` werden auf `/dashboard` umgeleitet.
 *   - Nicht eingeloggte User auf geschützten Pfaden landen auf `/login`.
 *
 * Static Assets (Bilder, _next/* etc.) werden über `config.matcher` ausgenommen.
 */
const AUTH_ENABLED = false;

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has("lh_session");
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (AUTH_ENABLED) {
    // Vollständiger Schutz: nicht eingeloggte User → /login
    if (!isLoggedIn && !isPublic) {
      const loginUrl = new URL("/login", request.url);
      const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
      loginUrl.searchParams.set("redirect", redirectTo);
      return NextResponse.redirect(loginUrl);
    }
    // Eingeloggte User auf /login oder /register → /dashboard
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // AUTH_ENABLED = false: App ist offen, aber /login ist trotzdem der Einstiegspunkt.
  // Der Redirect von / → /login passiert bereits in src/app/page.tsx.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Alles außer API-Routen, Next.js-Interna und statische Assets.
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
