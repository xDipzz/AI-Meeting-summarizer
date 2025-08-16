import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Meeting Summarizer - Transform Your Meeting Notes",
  description:
    "Transform your meeting transcripts into structured, actionable summaries with AI-powered intelligence. Upload, customize, edit, and share professional meeting summaries.",
  generator: "v0.app",
  keywords: "AI, meeting, summarizer, transcript, notes, artificial intelligence, productivity",
  authors: [{ name: "AI Meeting Summarizer" }],
  openGraph: {
    title: "AI Meeting Summarizer",
    description:
      "Transform your meeting transcripts into structured, actionable summaries with AI-powered intelligence.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
