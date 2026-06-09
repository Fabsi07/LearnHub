import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth/session";

export async function POST() {
  await destroyCurrentSession();
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  await destroyCurrentSession();

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect");
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/login";

  return NextResponse.redirect(new URL(safeRedirect, url));
}
