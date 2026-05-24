"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface LogRow {
  id:          string
  action:      string
  target_type: string | null
  target_id:   string | null
  metadata:    Record<string, unknown> | null
  created_at:  string
  actor:       { id: string; name: string; role: string } | null
}

export default function AuditLogPage() {
  const [rows, setRows] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState("")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/audit-log")
      if (cancelled) return
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal memuat.")
      } else {
        setRows(await res.json())
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = rows.filter((r) => {
    if (!search) return true
    const s = search.toLowerCase()
    return r.action.toLowerCase().includes(s)
        || r.actor?.name.toLowerCase().includes(s)
        || (r.target_type ?? "").toLowerCase().includes(s)
  })

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-ink dark:text-ink-dim">Audit Log</h1>
          <p className="text-sm text-ink-muted">200 entri terakhir.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari action / actor / target…"
          className="input max-w-sm"
        />
      </div>

      {loading && <p className="text-sm text-ink-dim">Memuat…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-background dark:bg-surface-alt text-ink-muted">
            <tr>
              <th className="text-left px-3 py-2">Waktu</th>
              <th className="text-left px-3 py-2">Actor</th>
              <th className="text-left px-3 py-2">Action</th>
              <th className="text-left px-3 py-2">Target</th>
              <th className="text-left px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-ink-dim">Tidak ada entri.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-background/60 dark:hover:bg-surface-alt/60">
                <td className="px-3 py-2 text-ink-muted whitespace-nowrap">
                  {format(new Date(r.created_at), "d MMM HH:mm:ss", { locale: idLocale })}
                </td>
                <td className="px-3 py-2 text-ink dark:text-ink-dim">
                  {r.actor?.name ?? <span className="text-ink-dim">sistem</span>}
                  {r.actor && <span className="text-ink-dim"> ({r.actor.role})</span>}
                </td>
                <td className="px-3 py-2">
                  <span className="pill pill-purple">{r.action}</span>
                </td>
                <td className="px-3 py-2 text-ink-muted">
                  {r.target_type ?? "-"}
                  {r.target_id && <span className="font-mono-id ml-1">{r.target_id.slice(0, 8)}</span>}
                </td>
                <td className="px-3 py-2 font-mono-id text-ink-dim max-w-[200px] truncate">
                  {r.metadata ? JSON.stringify(r.metadata) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
