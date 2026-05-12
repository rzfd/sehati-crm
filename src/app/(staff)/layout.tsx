import { StaffSidebar } from "@/components/layout/StaffSidebar"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <StaffSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
