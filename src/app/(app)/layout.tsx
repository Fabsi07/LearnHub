import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/api/auth/logout?redirect=/login");
  }

  return <DashboardShell currentUser={currentUser}>{children}</DashboardShell>;
}
