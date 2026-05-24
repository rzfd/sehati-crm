// Format helpers untuk display string (nama dokter, dll).

interface DoctorLike {
  name:    string
  title?:  string | null
}

/**
 * Format nama dokter: gabung title + name, tapi strip prefix duplikat.
 *
 * Background: staff sering input name dengan prefix "dr." padahal field title
 * sudah berisi "dr.". Render naive `${title} ${name}` jadi "dr. dr. Andi".
 */
export function formatDoctorName(doctor: DoctorLike | null | undefined): string {
  if (!doctor) return ""
  const title = (doctor.title ?? "").trim()
  const name  = stripLeadingTitle(doctor.name ?? "", title)
  return title ? `${title} ${name}`.trim() : name
}

/**
 * Strip prefix title (case-insensitive) di awal nama supaya tidak dobel.
 * Cocokkan "dr.", "dr ", "Dr.", "DR." dst.
 */
function stripLeadingTitle(name: string, title: string): string {
  const trimmed = name.trim()
  if (!title) return trimmed

  // Normalisasi title untuk match: hilangkan trailing dot/space.
  const titleCore = title.replace(/\.+$/, "").trim().toLowerCase()
  if (!titleCore) return trimmed

  // Match "dr.", "dr ", "Dr.", dst di awal name.
  const pattern = new RegExp(`^${escapeRegex(titleCore)}\\.?\\s+`, "i")
  return trimmed.replace(pattern, "")
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
