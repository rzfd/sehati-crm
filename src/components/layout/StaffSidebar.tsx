"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useUrgentCount, requestNotificationPermission } from "@/hooks/useUrgentCount"
import { Logo } from "@/components/shared/Logo"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar } from "@/components/shared/Avatar"

interface NavLink {
  href:  string
  label: string
  icon:  React.ReactNode
}

const NAV: NavLink[] = [
  { href: "/inbox",     label: "Inbox",     icon: <InboxIcon /> },
  { href: "/calendar",  label: "Kalender",  icon: <CalIcon /> },
  { href: "/dashboard", label: "Dashboard", icon: <DashIcon /> },
]

export function StaffSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { staff } = useCurrentUser()
  const urgent = useUrgentCount(staff?.clinic_id ?? null)

  const isAsdok = staff?.role === "doctor_assistant"

  async function handleSignout() {
    await fetch("/api/auth/signout", { method: "POST" })
    router.replace("/login")
  }

  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-neutral-900 border-r border-black/[0.08] dark:border-white/[0.06] flex flex-col">
      <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.06]">
        <Logo size={28} withText className="mb-3" />
        <div className="flex items-center gap-2.5">
          <Avatar name={staff?.name ?? "?"} size="sm" status="online" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {staff?.name ?? "Sehati Staff"}
            </div>
            <span className={cn(
              "pill",
              isAsdok ? "pill-pink" : "pill-blue",
            )}>
              {roleLabel(staff?.role)}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const showUrgent = item.href === "/inbox" && urgent.total > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? "nav-item-active" : "nav-item", "justify-between")}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {showUrgent && (
                <span className="pill pill-red text-[10px]">
                  {urgent.total}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Notification opt-in button */}
      <div className="px-2 pb-1">
        <button
          onClick={() => requestNotificationPermission()}
          className="text-[10px] text-gray-400 hover:text-teal-600 px-3 py-1.5 w-full text-left"
          title="Aktifkan notifikasi browser untuk pesan urgent"
        >
          🔔 Aktifkan notifikasi
        </button>
      </div>

      <div className="p-2 border-t border-black/[0.08] dark:border-white/[0.06] flex items-center gap-1">
        <ThemeToggle />
        <button onClick={handleSignout} className="nav-item w-full text-left flex-1">
          <SignoutIcon />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}

function roleLabel(r?: string): string {
  switch (r) {
    case "admin":            return "Admin"
    case "manager":          return "Manager"
    case "receptionist":     return "Resepsionis"
    case "cs":               return "CS"
    case "doctor_assistant": return "Asisten Dokter"
    case "marketing":        return "Marketing"
    default:                 return "Staff"
  }
}

// ── icons ──────────────────────────────────────────────────
function InboxIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z" />
      <path d="M3 11h4l1.5 2h3L13 11h4" strokeLinejoin="round" />
    </svg>
  )
}
function CalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path d="M3 8h14M7 3v3M13 3v3" strokeLinecap="round" />
    </svg>
  )
}
function DashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <rect x="3" y="3" width="6" height="8" rx="1" />
      <rect x="11" y="3" width="6" height="4" rx="1" />
      <rect x="11" y="9" width="6" height="8" rx="1" />
      <rect x="3" y="13" width="6" height="4" rx="1" />
    </svg>
  )
}
function SignoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <path d="M13 14v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1" />
      <path d="M9 10h7m0 0-2-2m2 2-2 2" strokeLinejoin="round" />
    </svg>
  )
}
