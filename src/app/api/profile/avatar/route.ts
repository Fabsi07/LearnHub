import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const AVATAR_SERVE_URL = "/api/profile/avatar";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatarData: true, avatarMime: true },
  });

  if (!user?.avatarData || !user.avatarMime) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(user.avatarData, {
    status: 200,
    headers: {
      "Content-Type": user.avatarMime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Kein Bild angegeben." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Nur PNG, JPEG oder WebP erlaubt." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Datei ist zu groß (max. 5 MB)." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      avatarData: buffer,
      avatarMime: file.type,
      avatarUrl: AVATAR_SERVE_URL,
    },
  });

  return NextResponse.json({ avatarUrl: AVATAR_SERVE_URL }, { status: 200 });
}
