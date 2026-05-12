// Lightweight CSV export — no deps. Handles quoted strings, embedded commas, newlines.

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return ""
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const out = [headers.map(escapeCell).join(",")]
  for (const r of rows) {
    out.push(headers.map((h) => escapeCell(r[h])).join(","))
  }
  return out.join("\n")
}

export function csvResponse(filename: string, rows: Record<string, unknown>[]): Response {
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
