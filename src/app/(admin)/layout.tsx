import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { createClient } from "@/lib/supabase/server"
import type { StaffRole } from "@/lib/constants"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const initialStaff = await resolveStaff()
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar initialStaff={initialStaff} />
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
