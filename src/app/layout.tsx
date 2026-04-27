import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StudyHub',
  description: 'Klausuren planen, Lernplan generieren, Fortschritt tracken',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
