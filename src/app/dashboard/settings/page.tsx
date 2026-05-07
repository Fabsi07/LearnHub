import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { SettingsPage } from "@/components/settings/SettingsPage";

export default function SettingsRoute() {
  return (
    <DashboardShell>
      <Suspense fallback={null}>
        <SettingsPage />
      </Suspense>
    </DashboardShell>
  );
}
