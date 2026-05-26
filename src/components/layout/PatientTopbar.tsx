"use client"

import { usePathname } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { NotificationBell } from "@/components/layout/NotificationBell"

// Judul per-route. /home tampil sebagai greeting; /chat punya header sendiri
// (lihat chat/page.tsx) jadi topbar disembunyikan di sana.
const TITLES: Record<string, string> = {
  "/booking": "Booking",
  "/history": "Riwayat",
  "/profile": "Profil",
}

export function PatientTopbar() {
  const pathname = usePathname() ?? ""
  const { patient } = useCurrentUser()

  // Chat punya header klinik sendiri setinggi topbar — jangan dobel.
  if (pathname.startsWith("/chat")) return null

  const isHome = pathname === "/home" || pathname.startsWith("/home")
  const firstName = patient?.name?.split(" ")[0] ?? "Pasien"
  const label = Object.entries(TITLES).find(([href]) => pathname.startsWith(href))?.[1] ?? "Sehati"

  return (
    <header className="h-topbar-height shrink-0 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between gap-3 px-desktop-margin">
      {isHome ? (
        <div className="min-w-0">
          <p className="eyebrow text-ink-dim leading-none">{getGreeting()}</p>
          <h1 className="text-headline-sm text-ink truncate">Halo, {firstName} 👋</h1>
        </div>
      ) : (
        <h1 className="text-headline-sm text-ink truncate">{label}</h1>
      )}

      <NotificationBell patientId={patient?.id ?? null} />
    </header>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}
