import { NextResponse } from "next/server";
import { z } from "zod";
import { getFeedbackManagerAuth } from "@/lib/auth/admin";
import { getFeedbackPayload } from "@/lib/feedback/server";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
  type FeedbackCategory,
  type FeedbackPriority,
  type FeedbackStatus,
} from "@/lib/feedback/types";
import { prisma } from "@/lib/prisma";

const updateFeedbackSchema = z
  .object({
    category: z.enum(FEEDBACK_CATEGORIES).optional(),
    priority: z.enum(FEEDBACK_PRIORITIES).optional(),
    status: z.enum(FEEDBACK_STATUSES).optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "Keine Änderungen übergeben.",
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getFeedbackManagerAuth();
  if (auth.status !== "ok") {
    return unauthorized(auth.status);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger Anfrage-Body." },
      { status: 400 },
    );
  }

  const parsed = updateFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 },
    );
  }

  const data: Partial<{
    category: FeedbackCategory;
    priority: FeedbackPriority;
    status: FeedbackStatus;
  }> = {};

  if (parsed.data.category) data.category = parsed.data.category;
  if (parsed.data.priority) data.priority = parsed.data.priority;
  if (parsed.data.status) data.status = parsed.data.status;

  const { id } = await params;
  const updated = await prisma.feedback.updateMany({
    where: { id },
    data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Feedback nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json(await getFeedbackPayload());
}
