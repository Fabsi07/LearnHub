import { NextResponse } from "next/server";
import { z } from "zod";
import { getFeedbackManagerAuth } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import { getFeedbackPayload } from "@/lib/feedback/server";
import {
  FEEDBACK_CATEGORIES,
  serializeFeedback,
} from "@/lib/feedback/types";
import { prisma } from "@/lib/prisma";

const createFeedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  title: z
    .string()
    .trim()
    .min(3, "Bitte gib einen aussagekraeftigen Titel an.")
    .max(120, "Der Titel darf hoechstens 120 Zeichen lang sein."),
  description: z
    .string()
    .trim()
    .min(10, "Bitte beschreibe dein Feedback etwas genauer.")
    .max(4000, "Die Beschreibung darf hoechstens 4000 Zeichen lang sein."),
});

function unauthorized(status: "unauthenticated" | "forbidden") {
  return NextResponse.json(
    {
      error:
        status === "unauthenticated" ? "Nicht angemeldet." : "Keine Feedback-Berechtigung.",
    },
    { status: status === "unauthenticated" ? 401 : 403 },
  );
}

export async function GET() {
  const auth = await getFeedbackManagerAuth();
  if (auth.status !== "ok") {
    return unauthorized(auth.status);
  }

  return NextResponse.json(await getFeedbackPayload());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungueltiger Anfrage-Body." },
      { status: 400 },
    );
  }

  const parsed = createFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungueltige Eingabe." },
      { status: 400 },
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      submittedCategory: parsed.data.category,
      authorId: session.userId,
    },
  });

  return NextResponse.json(
    { feedback: serializeFeedback(feedback) },
    { status: 201 },
  );
}
