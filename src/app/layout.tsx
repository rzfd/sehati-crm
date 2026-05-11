import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sehati CRM",
  description: "AI-powered CRM untuk klinik Indonesia",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-700 font-sans">{children}</body>
    </html>
  )
}
