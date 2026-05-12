import { StaffSidebar } from "@/components/layout/StaffSidebar"
import { Breadcrumb } from "@/components/layout/Breadcrumb"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <StaffSidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Breadcrumb />
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
