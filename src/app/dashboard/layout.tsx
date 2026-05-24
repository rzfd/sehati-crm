import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { StaffSidebar } from "@/components/layout/StaffSidebar"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { createClient } from "@/lib/supabase/server"
import type { StaffRole } from "@/lib/constants"

// Server component — resolve role di server agar sidebar yang benar
// muncul dari first paint, tanpa flicker.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const initialStaff = await resolveStaff()
  // Asdok tidak boleh akses Dashboard — operasional cuma Inbox + Kalender.
  if (initialStaff?.role === "doctor_assistant") redirect("/inbox")
  const isAdmin = initialStaff?.role === "admin"

  return (
    <div className="flex h-screen overflow-hidden">
      {isAdmin ? <AdminSidebar initialStaff={initialStaff} /> : <StaffSidebar />}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Breadcrumb />
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
      </main>
    </div>
  )
}

async function resolveStaff(): Promise<{ name: string; role: StaffRole } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from("staff_members")
    .select("name, role")
    .eq("user_id", user.id)
    .maybeSingle()
  return data ? { name: data.name, role: data.role as StaffRole } : null
}
