"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/useCurrentUser"

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

  const isAsdok = staff?.role === "doctor_assistant"

  async function handleSignout() {
    await fetch("/api/auth/signout", { method: "POST" })
    router.replace("/login")
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-black/[0.08] flex flex-col">
      <div className="p-4 border-b border-black/[0.08]">
        <div className="flex items-center gap-2">
          <div className={cn(
            "size-7 rounded-lg flex items-center justify-center",
            isAsdok ? "bg-pink-500" : "bg-blue-500",
          )}>
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700 truncate">
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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? "nav-item-active" : "nav-item")}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-black/[0.08]">
        <button onClick={handleSignout} className="nav-item w-full text-left">
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
