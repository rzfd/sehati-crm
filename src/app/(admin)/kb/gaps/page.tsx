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
      <div>
        <h1 className="text-xl font-medium text-gray-700">KB Gaps</h1>
        <p className="text-sm text-gray-500">Pertanyaan yang AI tidak bisa jawab (30 hari terakhir).</p>
      </div>

      {loading && <p className="text-sm text-gray-400">Memuat…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && gaps.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-sm text-gray-500">✓ Tidak ada gap signifikan dalam 30 hari terakhir.</p>
        </div>
      )}

      <div className="space-y-2">
        {gaps.map((g, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 mb-1.5">&ldquo;{g.content}&rdquo;</p>
                <div className="flex flex-wrap gap-1.5 items-center text-xs text-gray-500">
                  <span className="pill pill-amber">{g.count}× ditanyakan</span>
                  {g.categories.map((c) => (
                    <span key={c} className="pill pill-gray">{c}</span>
                  ))}
                  <span className="text-gray-400">
                    Terakhir: {formatDistanceToNow(new Date(g.latest), { locale: idLocale, addSuffix: true })}
                  </span>
                </div>
              </div>
              <Link
                href={`/kb/qa/new?question=${encodeURIComponent(g.content)}`}
                className="btn-primary text-xs flex-shrink-0"
              >
                + Tambah Q&amp;A
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
