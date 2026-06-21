import { Suspense } from "react";
import { LoginForm } from "@/components/login/LoginForm";
import { AuthSplitLayout } from "@/components/login/AuthSplitLayout";

export default function LoginPage() {
  return (
    <AuthSplitLayout
      headline={
        <>
          Weil <span className="italic">Zettelchaos</span>
          <br />
          keine{" "}
          <span style={{ color: "#7a000a", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>
            Karriere
          </span>{" "}
          macht.
        </>
      }
      subtitle={
        <>
          Plane deine Klausuren, generiere personalisierte Lernpläne und
          verfolge deinen Fortschritt – alles an einem Ort.
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
