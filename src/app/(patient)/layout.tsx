"use client"

import { usePathname } from "next/navigation"
import { PatientSidebar } from "@/components/layout/PatientSidebar"
import { PatientTopbar } from "@/components/layout/PatientTopbar"
import { PatientRightRail } from "@/components/layout/PatientRightRail"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ""

  // Onboarding adalah wizard satu arah pra-dashboard — tampil tanpa shell.
  if (pathname.startsWith("/onboarding")) {
    return <div className="min-h-screen overflow-auto bg-background">{children}</div>
  }

  // 3-kolom dashboard: sidebar + main (topbar + konten) + right rail.
  // Pola mengikuti (staff)/layout.tsx yang sudah teruji di Next 16.
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <PatientSidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <PatientTopbar />
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
      </main>
      <PatientRightRail />
    </div>
  )
}
