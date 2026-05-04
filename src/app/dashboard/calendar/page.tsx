import { DashboardShell } from "@/components/layout/DashboardShell";
import { Calendar } from "@/components/calendar/Calendar";

export default function CalendarPage() {
  return (
    <DashboardShell>
      <div className="p-6 h-full">
        <Calendar />
      </div>
    </DashboardShell>
  );
}
