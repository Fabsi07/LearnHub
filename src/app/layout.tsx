import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learnmanagement App',
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
