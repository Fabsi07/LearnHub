import { RegisterForm } from "@/components/register/RegisterForm";
import { AuthSplitLayout } from "@/components/login/AuthSplitLayout";

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      headline={
        <>
          Starte deinen <span className="italic">strukturierten</span>
          <br />
          Weg zum{" "}
          <span style={{ color: "#7a000a", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>
            Lernerfolg
          </span>
          .
        </>
      }
      subtitle={
        <>
          Lege dir in wenigen Sekunden ein Konto an und plane deine
          Klausuren, Lerninhalte und Termine an einem Ort.
        </>
      }
    >
      <RegisterForm />
    </AuthSplitLayout>
  );
}
