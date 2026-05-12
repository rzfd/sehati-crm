import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title:       "Sehati CRM",
  description: "AI-powered CRM untuk klinik Indonesia",
  manifest:    "/manifest.json",
  applicationName: "Sehati CRM",
  appleWebApp: {
    capable:     true,
    statusBarStyle: "default",
    title:       "Sehati",
  },
  icons: {
    icon:    "/icons/icon-192.svg",
    apple:   "/icons/icon-192.svg",
  },
}

export const viewport: Viewport = {
  themeColor:     "#1D9E75",
  width:          "device-width",
  initialScale:   1,
  maximumScale:   1,
  viewportFit:    "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-700 font-sans">{children}</body>
    </html>
  )
}
