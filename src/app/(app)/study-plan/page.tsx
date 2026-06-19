import { StudyPlanOverview } from "@/components/study-plan/StudyPlanOverview";

interface StudyPlanPageProps {
  searchParams?: Promise<{
    create?: string | string[];
  }>;
}

export default async function StudyPlanPage({ searchParams }: StudyPlanPageProps) {
  const params = await searchParams;
  const createParam = Array.isArray(params?.create) ? params?.create[0] : params?.create;

  return <StudyPlanOverview initialCreateOpen={createParam === "1"} />;
}
