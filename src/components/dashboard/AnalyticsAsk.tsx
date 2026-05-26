"use client"

import { useState } from "react"

const EXAMPLES = [
  "Berapa pasien baru bulan ini?",
  "Dokter mana paling sibuk?",
  "Berapa booking minggu ini?",
  "Tingkat no-show?",
]

export function AnalyticsAsk() {
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)

  async function ask(question?: string) {
    const text = (question ?? q).trim()
    if (!text) return
    if (question) setQ(question)
    setLoading(true)
    setAnswer(null)
    try {
      const res = await fetch("/api/ai/analytics", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: text }),
      })
      const d = await res.json().catch(() => ({}))
      setAnswer(res.ok ? (d.answer ?? "—") : (d.error ?? "Gagal."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-rounded text-primary text-[20px]">insights</span>
        <p className="text-card-title text-ink">Tanya data klinik</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask() }} className="flex gap-2">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="mis. Berapa pasien baru bulan ini?"
        />
        <button type="submit" disabled={loading || !q.trim()} className="btn-primary shrink-0 disabled:opacity-60">
          {loading ? "…" : "Tanya"}
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => (
          <button key={ex} onClick={() => ask(ex)} disabled={loading} className="pill-gray hover:bg-surface-dim transition-colors">
            {ex}
          </button>
        ))}
      </div>

      {answer && (
        <div className="rounded-lg bg-primary-soft/50 border border-primary-dim px-3 py-2 text-body-md text-ink">
          {answer}
        </div>
      )}
    </div>
  )
}
