import { redirect } from "next/navigation";

export default function RootPage() {
  // Startseite leitet auf Login. Die Middleware leitet eingeloggte User
  // von /login direkt auf /dashboard weiter (sobald AUTH_ENABLED = true).
  redirect("/login");
}
