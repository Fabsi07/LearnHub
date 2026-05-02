import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="de" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  )
}
