import { NextResponse } from "next/server";
import { getAdminAnalyticsPayload } from "@/lib/admin/analytics";
import { getAdminAuth } from "@/lib/auth/admin";

function unauthorized(status: "unauthenticated" | "forbidden") {
  return NextResponse.json(
    {
      error:
        status === "unauthenticated" ? "Nicht angemeldet." : "Keine Admin-Berechtigung.",
    },
    { status: status === "unauthenticated" ? 401 : 403 },
  );
}

export async function GET() {
  const auth = await getAdminAuth();
  if (auth.status !== "ok") {
    return unauthorized(auth.status);
  }

  return NextResponse.json(await getAdminAnalyticsPayload());
}
