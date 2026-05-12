import { DashboardShell } from "@/components/layout/DashboardShell";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";

export default function DashboardNotificationsPage() {
  return (
    <DashboardShell>
      <div className="h-full p-6">
        <NotificationsPage />
      </div>
    </DashboardShell>
  );
}
