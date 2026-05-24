"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Logo } from "@/components/shared/Logo"
import type { StaffRole } from "@/lib/constants"

interface NavLink {
  href:  string
  label: string
  icon:  React.ReactNode
  // Roles yang tidak boleh melihat link ini. Admin fokus ke manajemen,
  // operasional harian (Inbox/Kalender) dikerjakan staff lain.
  hideFor?: StaffRole[]
}

interface NavSection {
  label: string
  items: NavLink[]
}

const SECTIONS: NavSection[] = [
  {
    label: "Operasional",
    items: [
      { href: "/inbox",      label: "Inbox Chat",  icon: <InboxNavIcon />,     hideFor: ["admin"] },
      { href: "/calendar",   label: "Kalender",    icon: <CalNavIcon />,       hideFor: ["admin"] },
      { href: "/dashboard",  label: "Dashboard",   icon: <DashboardNavIcon /> },
    ],
  },
  {
    label: "Knowledge Base",
    items: [
      { href: "/kb",           label: "Ringkasan KB",   icon: <DashIcon /> },
      { href: "/kb/qa",        label: "Q&A",            icon: <QAIcon /> },
      { href: "/kb/documents", label: "Dokumen",        icon: <DocIcon /> },
      { href: "/kb/gaps",      label: "KB Gaps",        icon: <GapIcon /> },
      { href: "/templates",    label: "Template Reply", icon: <TplIcon /> },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { href: "/doctors",   label: "Dokter",         icon: <DoctorIcon /> },
      { href: "/staff",     label: "Staff",          icon: <StaffIcon /> },
      { href: "/settings",  label: "Klinik",         icon: <SettingsIcon /> },
      { href: "/security",  label: "Keamanan (2FA)", icon: <ShieldIcon /> },
      { href: "/audit-log", label: "Audit Log",      icon: <AuditIcon /> },
    ],
  },
]

interface AdminSidebarProps {
  // Server-resolved staff info — kalau ada, pakai ini untuk first paint.
  // Cegah flicker dari client-side useCurrentUser fetch.
  initialStaff?: { name: string; role: StaffRole } | null
}

export function AdminSidebar({ initialStaff }: AdminSidebarProps = {}) {
  const pathname = usePathname()
  const { staff: clientStaff, loading } = useCurrentUser()
  // Prefer server-resolved data; jatuh balik ke client fetch kalau tidak ada.
  const staff = initialStaff ?? clientStaff
  const hasResolved = !!initialStaff || !loading

  return (
    <aside className="w-sidebar-width shrink-0 bg-surface-alt border-r border-border flex flex-col">
      <div className="p-4">
        <Logo size={28} withText variant="sage" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-thin">
        {SECTIONS.map((section) => {
          // Kalau role belum ter-resolve, sembunyikan item dengan hideFor
          // (default pessimistic) supaya tidak ada flicker "muncul lalu hilang".
          const items = section.items.filter((item) => {
            if (!item.hideFor) return true
            if (!hasResolved) return false
            return !staff?.role || !item.hideFor.includes(staff.role as StaffRole)
          })
          if (items.length === 0) return null
          return (
            <div key={section.label}>
              <p className="eyebrow px-3 pt-1 pb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
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
              </div>
            </div>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="size-9 rounded-full bg-accent-soft text-secondary flex items-center justify-center font-semibold text-sm shrink-0">
            {(staff?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-card-title text-ink truncate">
              {!hasResolved ? "Memuat…" : staff?.name ?? "Belum terhubung"}
            </div>
            {staff ? (
              <span className="eyebrow text-secondary">{staff.role}</span>
            ) : hasResolved ? (
              <span className="eyebrow text-danger">Bukan staff</span>
            ) : null}
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="text-ink-muted hover:text-danger p-1.5 rounded-lg hover:bg-surface transition-colors"
              title="Keluar"
            >
              <LogoutIcon />
            </button>
          </form>
        </div>
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
function InboxNavIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
      <path d="M3 13h5l2 3h4l2-3h5"/>
    </svg>
  )
}
function CalNavIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  )
}
function DashboardNavIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 1 18 0Z"/><path d="M12 12 9 7"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}
function TplIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
