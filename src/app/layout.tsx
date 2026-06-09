import type { Metadata } from 'next'
import './globals.css'
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'LearnHub',
  description: 'Klausuren planen, Lernplan generieren, Fortschritt tracken',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={cn("font-sans", GeistSans.variable)}>
      <body>{children}</body>
    </html>
  )
}
