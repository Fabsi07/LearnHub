import { DashboardShell } from "@/components/layout/DashboardShell";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";

export default function DashboardMessagesPage() {
  return (
    <DashboardShell>
      <div className="h-full p-6">
        <NotificationsPage />
      </div>
    </DashboardShell>
  );
}
