"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Logo } from "@/components/shared/Logo"
import { Avatar } from "@/components/shared/Avatar"

interface NavLink {
  href:  string
  label: string
  icon:  React.ReactNode
}

const NAV: NavLink[] = [
  { href: "/home",    label: "Beranda", icon: <HomeIcon /> },
  { href: "/chat",    label: "Chat",    icon: <ChatIcon /> },
  { href: "/booking", label: "Booking", icon: <CalIcon /> },
  { href: "/history", label: "Riwayat", icon: <HistIcon /> },
  { href: "/profile", label: "Profil",  icon: <PersonIcon /> },
]

export function PatientSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { patient } = useCurrentUser()

  async function handleSignout() {
    await fetch("/api/auth/signout", { method: "POST" })
    router.replace("/login")
  }

  return (
    <aside className="w-sidebar-width shrink-0 bg-surface-alt border-r border-border flex flex-col">
      <div className="p-4">
        <Logo size={28} withText variant="sage" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "nav-item-active" : "nav-item"}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <Avatar name={patient?.name ?? "?"} size="sm" status="online" />
          <div className="min-w-0 flex-1">
            <div className="text-card-title text-ink truncate">{patient?.name ?? "Pasien"}</div>
            <span className="eyebrow text-primary">Pasien</span>
          </div>
          <button
            onClick={handleSignout}
            className="text-ink-muted hover:text-danger p-1.5 rounded-lg hover:bg-surface transition-colors"
            title="Keluar"
          >
            <SignoutIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── icons (size-4, matches StaffSidebar) ───────────────────
function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <path d="M3 9.5 10 3l7 6.5V16a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V9.5Z" strokeLinejoin="round" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-3 3v-3H5a2 2 0 0 1-2-2V5Z" strokeLinejoin="round" />
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
function HistIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" strokeLinecap="round" />
    </svg>
  )
}
function PersonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
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
