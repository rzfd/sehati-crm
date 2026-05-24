"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface Gap {
  content:    string
  count:      number
  latest:     string
  sample_ids: string[]
  categories: string[]
}

export default function KBGapsPage() {
  const [gaps, setGaps] = useState<Gap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/kb/gaps")
      if (cancelled) return
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal memuat.")
      } else {
        setGaps(await res.json())
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <nav className="text-body-sm text-ink-muted">
        <Link href="/kb" className="hover:text-ink">Knowledge Base</Link>
        <span className="text-ink-dim mx-1">›</span> KB Gaps
      </nav>
      <div>
        <h1 className="text-headline-md text-ink">KB Gaps</h1>
        <p className="text-body-md text-ink-muted">Pertanyaan yang AI tidak bisa jawab (30 hari terakhir).</p>
      </div>

      {loading && <p className="text-body-md text-ink-dim">Memuat…</p>}
      {error && <p className="text-body-md text-danger">{error}</p>}

      {!loading && gaps.length === 0 && (
        <div className="card p-8 text-center">
          <span className="material-symbols-rounded text-[32px] text-primary">task_alt</span>
          <p className="text-body-md text-ink-muted mt-2">Tidak ada gap signifikan dalam 30 hari terakhir.</p>
        </div>
      )}

      <div className="space-y-2">
        {gaps.map((g, i) => {
          const sev = g.count >= 5 ? { cls: "pill-danger", label: "High Miss" }
            : g.count >= 2 ? { cls: "pill-warning", label: "Partial Match" }
            : { cls: "pill-info", label: "New Topic" }
          return (
          <div key={i} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={sev.cls}>{sev.label}</span>
                  <span className="text-body-sm text-ink-dim">{g.count}× ditanyakan</span>
                </div>
                <p className="text-body-md text-ink">&ldquo;{g.content}&rdquo;</p>
                <div className="flex flex-wrap gap-1.5 items-center mt-2">
                  {g.categories.map((c) => (
                    <span key={c} className="pill-gray">{c}</span>
                  ))}
                  <span className="text-body-sm text-ink-dim">
                    Terakhir: {formatDistanceToNow(new Date(g.latest), { locale: idLocale, addSuffix: true })}
                  </span>
                </div>
              </div>
              <Link
                href={`/kb/qa/new?question=${encodeURIComponent(g.content)}`}
                className="btn-primary text-sm flex-shrink-0"
              >
                <span className="material-symbols-rounded text-[18px]">add</span> Q&amp;A
              </Link>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
