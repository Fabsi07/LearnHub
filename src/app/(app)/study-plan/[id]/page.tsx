import { StudyPlanDetail } from "@/components/study-plan/StudyPlanDetail";

export default async function StudyPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudyPlanDetail planId={id} />;
}
