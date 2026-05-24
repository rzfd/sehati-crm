"use client"

import { useState } from "react"

interface Match {
  question?: string
  answer?:   string
  similarity?: number
  score?:    number
}

// RAG Simulator — uji bagaimana AI mengambil data dari KB untuk sebuah pertanyaan.
export function RAGSimulator() {
  const [query, setQuery]   = useState("")
  const [loading, setLoad]  = useState(false)
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [error, setError]   = useState<string | null>(null)

  async function run(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || loading) return
    setLoad(true); setError(null); setMatches(null)
    try {
      const res = await fetch("/api/kb/search", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? "Gagal menjalankan simulasi."); return }
      setMatches(Array.isArray(data.matches) ? data.matches : [])
    } catch {
      setError("Network error.")
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="card p-4">
      <p className="text-card-title text-ink flex items-center gap-1.5">
        <span className="material-symbols-rounded filled text-[18px] text-primary">science</span>
        RAG Simulator
      </p>
      <p className="text-body-sm text-ink-muted mt-0.5">Uji bagaimana AI mengambil data dari KB.</p>

      <form onSubmit={run} className="mt-3 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Masukkan pertanyaan simulasi…"
          className="flex-1 rounded-lg bg-surface-alt border border-border px-3 py-2 text-body-md text-ink placeholder:text-ink-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          aria-label="Jalankan"
          className="size-9 shrink-0 bg-primary text-on-primary rounded-lg flex items-center justify-center disabled:opacity-50"
        >
          <span className="material-symbols-rounded filled text-[18px]">{loading ? "more_horiz" : "send"}</span>
        </button>
      </form>

      {error && <p className="text-body-sm text-danger mt-3">{error}</p>}

      {matches && (
        matches.length === 0 ? (
          <p className="text-body-sm text-ink-muted mt-3 rounded-lg bg-warning-soft text-warning px-3 py-2">
            Tidak ada data KB yang cocok. Kandidat KB gap.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="eyebrow text-primary">AI Prediction</p>
            {matches.slice(0, 3).map((m, i) => (
              <div key={i} className="rounded-lg bg-primary-soft border border-primary-dim px-3 py-2">
                {m.question && <p className="text-body-sm font-semibold text-ink">{m.question}</p>}
                {m.answer && <p className="text-body-sm text-ink-muted mt-0.5 line-clamp-3">{m.answer}</p>}
                {(m.similarity ?? m.score) != null && (
                  <span className="font-mono text-code-mono text-ink-dim mt-1 inline-block">
                    match {(((m.similarity ?? m.score) as number) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
