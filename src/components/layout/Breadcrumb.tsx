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
  broadcasts:  "Broadcast",
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
// Halaman pasien punya header sendiri (greeting / chat header), jadi breadcrumb
// disembunyikan agar sesuai referensi mobile.
const HIDE_ON = ["/onboarding", "/home", "/chat", "/booking", "/history", "/profile"]

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
      className="sticky top-0 z-20 px-4 sm:px-6 py-2.5 bg-background/95 backdrop-blur border-b border-border"
    >
      <ol className="flex items-center flex-wrap gap-1 text-body-sm">
        {crumbs.map((c, idx) => (
          <Fragment key={c.href}>
            {idx > 0 && <Separator />}
            <li className="flex items-center">
              {c.isLast ? (
                <span className="text-ink font-semibold">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="text-ink-muted hover:text-ink transition-colors"
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
    <li aria-hidden className="text-ink-dim flex items-center">
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
