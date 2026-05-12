// Minimal i18n helper — no deps. Default locale "id", fallback "id".
// Untuk skala besar, swap ke next-intl. Pattern di sini supaya gampang migrasi.

export type Locale = "id" | "en"

const MESSAGES: Record<Locale, Record<string, string>> = {
  id: {
    "common.save":      "Simpan",
    "common.cancel":    "Batal",
    "common.loading":   "Memuat…",
    "common.error":     "Terjadi kesalahan",
    "common.success":   "Berhasil disimpan",
    "common.delete":    "Hapus",
    "common.edit":      "Edit",
    "common.search":    "Cari",
    "auth.login":       "Masuk",
    "auth.logout":      "Keluar",
    "auth.email":       "Email",
    "auth.password":    "Password",
    "auth.forgot":      "Lupa password?",
    "patient.home":     "Beranda",
    "patient.chat":     "Chat",
    "patient.booking":  "Booking",
    "patient.history":  "Riwayat",
    "patient.profile":  "Profil",
  },
  en: {
    "common.save":      "Save",
    "common.cancel":    "Cancel",
    "common.loading":   "Loading…",
    "common.error":     "An error occurred",
    "common.success":   "Saved",
    "common.delete":    "Delete",
    "common.edit":      "Edit",
    "common.search":    "Search",
    "auth.login":       "Sign in",
    "auth.logout":      "Sign out",
    "auth.email":       "Email",
    "auth.password":    "Password",
    "auth.forgot":      "Forgot password?",
    "patient.home":     "Home",
    "patient.chat":     "Chat",
    "patient.booking":  "Booking",
    "patient.history":  "History",
    "patient.profile":  "Profile",
  },
}

let currentLocale: Locale = "id"

export function setLocale(l: Locale) {
  currentLocale = l
  if (typeof window !== "undefined") {
    try { localStorage.setItem("locale", l) } catch {}
    document.documentElement.lang = l
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("locale")
      if (stored === "en" || stored === "id") return stored
    } catch {}
  }
  return currentLocale
}

export function t(key: string, fallback?: string): string {
  const locale = getLocale()
  return MESSAGES[locale]?.[key] ?? MESSAGES.id[key] ?? fallback ?? key
}
