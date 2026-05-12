import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500">404</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Seite nicht gefunden</h1>
        <p className="mt-3 text-gray-500">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        Zurück zum Dashboard
      </Link>
    </main>
  );
}
