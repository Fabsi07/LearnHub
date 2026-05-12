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
  if (!AUTH_ENABLED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has("lh_session");
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Alles außer API-Routen, Next.js-Interna und statische Assets.
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
