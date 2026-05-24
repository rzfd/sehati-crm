import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister"
import { Toaster } from "@/components/shared/Toaster"
import { ThemeProvider } from "@/components/shared/ThemeProvider"

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
  themeColor:     "#466147",
  width:          "device-width",
  initialScale:   1,
  maximumScale:   1,
  viewportFit:    "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full bg-background text-ink font-sans">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
