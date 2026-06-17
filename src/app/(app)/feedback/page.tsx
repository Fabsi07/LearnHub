import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <main className="flex h-full flex-col gap-5 overflow-auto p-6">
      <div>
        <p className="text-sm font-medium text-gray-500">Feedback</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Rückmeldung senden</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Teile Fehlerberichte, Verbesserungsvorschläge und neue Feature-Ideen mit dem
          Entwicklungsteam.
        </p>
      </div>

      <FeedbackForm />
    </main>
  );
}
