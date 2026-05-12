"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

// Segment slug → label Bahasa Indonesia.
// Tambahkan entry baru di sini saat route baru dibuat.
const LABELS: Record<string, string> = {
  // staff
  inbox:       "Inbox",
  calendar:    "Kalender",
  dashboard:   "Dashboard",
  // admin
  doctors:     "Dokter",
  staff:       "Staff",
  kb:          "Knowledge Base",
  qa:          "Q&A",
  documents:   "Dokumen",
  gaps:        "KB Gaps",
  templates:   "Template Reply",
  settings:    "Klinik",
  security:    "Keamanan",
  "audit-log": "Audit Log",
  // patient
  home:        "Beranda",
  chat:        "Chat",
  booking:     "Booking",
  history:     "Riwayat",
  profile:     "Profil",
  // generic
  new:         "Baru",
}

// Onboarding adalah wizard satu arah — pasien belum boleh navigasi sebelum selesai.
const HIDE_ON = ["/onboarding"]

export function Breadcrumb() {
  const pathname = usePathname() ?? "/"
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return null

  const crumbs = segments.map((seg, idx) => ({
    href:   "/" + segments.slice(0, idx + 1).join("/"),
    label:  LABELS[seg] ?? prettify(seg),
    isLast: idx === segments.length - 1,
  }))

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-0 z-20 px-4 sm:px-6 py-2.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-black/[0.06] dark:border-white/[0.06]"
    >
      <ol className="flex items-center flex-wrap gap-1 text-xs">
        {crumbs.map((c, idx) => (
          <Fragment key={c.href}>
            {idx > 0 && <Separator />}
            <li className="flex items-center">
              {c.isLast ? (
                <span className="text-gray-700 dark:text-gray-200 font-medium">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 transition-colors"
                >
                  {c.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

function Separator() {
  return (
    <li aria-hidden className="text-gray-300 dark:text-gray-600 flex items-center">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </li>
  )
}

// Dynamic segments — UUID di-mask jadi "Detail", lainnya di-titlecase.
function prettify(seg: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg)) {
    return "Detail"
  }
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}
