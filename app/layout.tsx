import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Exam Ready - AI-Powered Exam Paper Sharing Platform",
  description:
    "Upload, share, and discover examination papers. Find frequently-repeated topics using AI analysis. Ace your exams with smart preparation.",
  keywords: ["exam papers", "study materials", "AI", "education", "college", "university", "topics", "preparation"],
  authors: [{ name: "Exam Ready Team" }],
  openGraph: {
    title: "Exam Ready - AI-Powered Exam Paper Sharing Platform",
    description: "Upload, share, and discover examination papers. Find frequently-repeated topics using AI analysis.",
    type: "website",
    locale: "en_US",
    siteName: "Exam Ready",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Ready - AI-Powered Exam Paper Sharing Platform",
    description: "Upload, share, and discover examination papers. Find frequently-repeated topics using AI analysis.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
