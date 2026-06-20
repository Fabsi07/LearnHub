import { StudyPlanOverview } from "@/components/study-plan/StudyPlanOverview";

interface StudyPlanPageProps {
  searchParams?: Promise<{
    create?: string | string[];
  }>;
}

export default async function StudyPlanPage({ searchParams }: StudyPlanPageProps) {
  const resolvedSearchParams = await searchParams;
  const createParam = Array.isArray(resolvedSearchParams?.create)
    ? resolvedSearchParams.create[0]
    : resolvedSearchParams?.create;

  return <StudyPlanOverview initialCreateOpen={createParam === "1"} />;
}
