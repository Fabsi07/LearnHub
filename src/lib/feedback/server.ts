import { prisma } from "@/lib/prisma";
import type { FeedbackPayload } from "./types";
import { serializeFeedback } from "./types";

export async function getFeedbackPayload(): Promise<FeedbackPayload> {
  const [total, newCount, feedbacks] = await prisma.$transaction([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { status: "OPEN" } }),
    prisma.feedback.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        submittedCategory: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  return {
    total,
    newCount,
    feedbacks: feedbacks.map(serializeFeedback),
  };
}
