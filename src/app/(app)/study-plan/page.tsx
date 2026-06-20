import { StudyPlanOverview } from "@/components/study-plan/StudyPlanOverview";

interface StudyPlanPageProps {
  searchParams?: {
    create?: string | string[];
  };
}

export default function StudyPlanPage({ searchParams }: StudyPlanPageProps) {
  const createParam = Array.isArray(searchParams?.create)
    ? searchParams.create[0]
    : searchParams?.create;

  return <StudyPlanOverview initialCreateOpen={createParam === "1"} />;
}
