"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/useCurrentUser"

interface NavLink {
  href:  string
  label: string
  icon:  React.ReactNode
}

const NAV: NavLink[] = [
  { href: "/kb",           label: "Dashboard KB", icon: <DashIcon /> },
  { href: "/kb/qa",        label: "Q&A",          icon: <QAIcon /> },
  { href: "/kb/documents", label: "Dokumen",      icon: <DocIcon /> },
  { href: "/kb/gaps",      label: "KB Gaps",      icon: <GapIcon /> },
  { href: "/doctors",      label: "Dokter",       icon: <DoctorIcon /> },
  { href: "/staff",        label: "Staff",        icon: <StaffIcon /> },
  { href: "/audit-log",    label: "Audit Log",    icon: <AuditIcon /> },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { staff, loading } = useCurrentUser()

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-black/[0.08] flex flex-col">
      <div className="p-4 border-b border-black/[0.08]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700 truncate">
              {loading ? "Memuat…" : staff?.name ?? "Belum terhubung"}
            </div>
            {staff ? (
              <span className="admin-badge">{staff.role}</span>
            ) : !loading ? (
              <span className="pill pill-red text-[10px]">Bukan staff</span>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map((item) => {
          const isActive =
            item.href === "/kb"
              ? pathname === "/kb"
              : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? "nav-item-active-purple" : "nav-item")}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-black/[0.08]">
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="nav-item w-full text-left">
            <LogoutIcon />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  )
}

function DashIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
      <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
    </svg>
  )
}
function QAIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function DocIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}
function DoctorIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
    </svg>
  )
}
function StaffIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function GapIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17.01"/>
    </svg>
  )
}
function AuditIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <path d="M9 13h6M9 17h6M9 9h2"/>
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
