import { redirect } from "next/navigation";

export default function RootPage() {
  // Die Startseite leitet auf das Dashboard. Sobald echtes Auth aktiv ist,
  // entscheidet die middleware.ts, ob stattdessen /login angezeigt wird.
  redirect("/dashboard");
}
