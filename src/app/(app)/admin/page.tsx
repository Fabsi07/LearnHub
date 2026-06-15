import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminUsersPayload } from "@/lib/admin/users";
import { getAdminAuth, getAdminCredentials } from "@/lib/auth/admin";

export default async function AdminPage() {
  const auth = await getAdminAuth();

  if (auth.status === "unauthenticated") {
    redirect("/login?redirect=/admin");
  }
  if (auth.status === "forbidden") {
    redirect("/dashboard");
  }

  const initialData = await getAdminUsersPayload();

  return (
    <AdminDashboard
      initialData={initialData}
      currentUserId={auth.user.id}
      fixedAdminEmail={getAdminCredentials().email}
    />
  );
}
