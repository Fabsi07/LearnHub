// Auth-Cookie-Konstanten gemaess docs/auth-concept.md §5.2 und §5.3.

export const SESSION_COOKIE = "lh_session";
export const SESSION_ROLE_COOKIE = "lh_role";

export const SESSION_TTL_DEFAULT_SECONDS = 24 * 60 * 60;        // 24 Stunden
export const SESSION_TTL_REMEMBER_SECONDS = 30 * 24 * 60 * 60;  // 30 Tage

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
