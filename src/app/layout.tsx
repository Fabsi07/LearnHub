import type { Metadata } from 'next'
import './globals.css'
import { GeistSans } from "geist/font/sans";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const themeInitializationScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem("learnhub-theme");
      const theme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    } catch {}
  })();
`;

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
    <html
      lang="de"
      className={cn("font-sans", GeistSans.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
