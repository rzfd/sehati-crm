import { PatientBottomNav } from "@/components/layout/PatientBottomNav"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    // h-[100dvh] supaya BottomNav selalu di bawah viewport + main scrollable.
    // dvh > vh untuk mobile karena handle hide/show address bar.
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-gray-50 overflow-hidden">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <PatientBottomNav />
    </div>
  )
}
