import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react"
import { LanguageProvider } from "@/lib/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NoteUS",
  description: "Your app description",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Quicksand:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-[#F2F5DA]`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
