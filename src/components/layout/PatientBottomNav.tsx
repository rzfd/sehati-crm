"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItem {
  href:  string
  label: string
  icon:  React.ReactNode
}

const ITEMS: NavItem[] = [
  { href: "/home",    label: "Beranda", icon: <IconHome /> },
  { href: "/chat",    label: "Chat",    icon: <IconChat /> },
  { href: "/booking", label: "Booking", icon: <IconCal /> },
  { href: "/history", label: "Riwayat", icon: <IconHist /> },
]

export function PatientBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="bg-surface border-t border-border-soft flex flex-shrink-0 z-30">
      {ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-caption transition-colors",
              active ? "text-primary" : "text-ink-muted hover:text-primary",
            )}
          >
            <span className={cn("size-6", active && "[&_path]:fill-primary/15 [&_circle]:fill-primary/15")}>
              {item.icon}
            </span>
            <span className={cn(active && "font-bold")}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Inline icons (no extra dep) ───────────────────────────
function IconHome() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-full" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9.5 10 3l7 6.5V16a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V9.5Z" strokeLinejoin="round" />
    </svg>
  )
}
function IconChat() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-full" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-3 3v-3H5a2 2 0 0 1-2-2V5Z" strokeLinejoin="round" />
    </svg>
  )
}
function IconCal() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-full" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path d="M3 8h14M7 3v3M13 3v3" strokeLinecap="round" />
    </svg>
  )
}
function IconHist() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-full" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" strokeLinecap="round" />
    </svg>
  )
}
