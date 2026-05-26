import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { StaffSidebar } from "@/components/layout/StaffSidebar"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { createClient } from "@/lib/supabase/server"
import type { StaffRole } from "@/lib/constants"

const ALLOWED = ["marketing", "admin", "manager"]

// Shared route (staff + admin shell, dipilih per role — pola sama dengan /dashboard).
// Hanya marketing/admin/manager yang boleh; lainnya diarahkan ke inbox.
export default async function BroadcastsLayout({ children }: { children: React.ReactNode }) {
  const staff = await resolveStaff()
  if (!staff || !ALLOWED.includes(staff.role)) redirect("/inbox")
  const isAdmin = staff.role === "admin"

  return (
    <div className="flex h-screen overflow-hidden">
      {isAdmin ? <AdminSidebar initialStaff={staff} /> : <StaffSidebar />}
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
    .from("staff_members").select("name, role").eq("user_id", user.id).maybeSingle()
  return data ? { name: data.name, role: data.role as StaffRole } : null
}
