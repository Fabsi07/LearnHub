import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminAnalyticsPayload } from "@/lib/admin/analytics";
import { getAdminUsersPayload } from "@/lib/admin/users";
import {
  canManageFeedbackRole,
  getAdminCredentials,
} from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeedbackPayload } from "@/lib/feedback/server";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirect=/admin");
  }
  if (!canManageFeedbackRole(currentUser.role)) {
    redirect("/dashboard");
  }

  const [initialUsersData, initialFeedbackData, initialAnalyticsData] = await Promise.all([
    currentUser.role === "ADMIN" ? getAdminUsersPayload() : Promise.resolve(null),
    getFeedbackPayload(),
    currentUser.role === "ADMIN" ? getAdminAnalyticsPayload() : Promise.resolve(null),
  ]);

  return (
    <AdminDashboard
      initialAnalyticsData={initialAnalyticsData}
      initialUsersData={initialUsersData}
      initialFeedbackData={initialFeedbackData}
      currentUserId={currentUser.id}
      currentUserRole={currentUser.role}
      fixedAdminEmail={getAdminCredentials().email}
    />
  );
}
