import { PatientBottomNav } from "@/components/layout/PatientBottomNav"
import { Breadcrumb } from "@/components/layout/Breadcrumb"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    // h-[100dvh] supaya BottomNav selalu di bawah viewport + main scrollable.
    // dvh > vh untuk mobile karena handle hide/show address bar.
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-background overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Breadcrumb />
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </main>
      <PatientBottomNav />
    </div>
  )
}
