import { Suspense } from "react";

import { SettingsPage } from "@/components/settings/SettingsPage";

function SettingsSkeleton() {
  return (
    <main className="h-full px-6 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-56 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-14 animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm" />
        <div className="h-64 animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm" />
      </div>
    </main>
  );
}

export default function SettingsRoute() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPage />
    </Suspense>
  );
}
