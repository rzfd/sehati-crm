"use client"

import { useState } from "react"

interface Summary { summary: string; next_action: string; reason: string }

const ACTION_LABEL: Record<string, string> = {
  reply:        "Balas pasien",
  book:         "Bantu booking",
  route_doctor: "Teruskan ke asdok",
  escalate:     "Eskalasi segera",
  resolve:      "Tandai selesai",
}
const ACTION_CLS: Record<string, string> = {
  reply:        "pill-gray",
  book:         "pill-warning",
  route_doctor: "pill-info",
  escalate:     "pill-danger",
  resolve:      "pill-sukses",
}

export function ChatSummaryPanel({ conversationId }: { conversationId: string }) {
  const [loading, setLoading] = useState(false)
  const [data, setData]   = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/summary`, { method: "POST" })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error ?? "Gagal membuat ringkasan."); return }
      setData(d as Summary)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 space-y-3">
      <button onClick={run} disabled={loading} className="btn-sage text-sm w-full justify-center disabled:opacity-60">
        <span className="material-symbols-rounded text-[18px]">auto_awesome</span>
        {loading ? "Menganalisis…" : data ? "Buat ulang ringkasan" : "Buat ringkasan AI"}
      </button>

      {error && <p className="text-body-sm text-danger">{error}</p>}

      {data && (
        <div className="space-y-3">
          <div>
            <p className="eyebrow mb-1">Ringkasan</p>
            <p className="text-body-md text-ink whitespace-pre-wrap">{data.summary}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Saran aksi</p>
            <span className={ACTION_CLS[data.next_action] ?? "pill-gray"}>
              {ACTION_LABEL[data.next_action] ?? data.next_action}
            </span>
            {data.reason && <p className="text-body-sm text-ink-muted mt-1.5">{data.reason}</p>}
          </div>
          <p className="text-caption text-ink-dim">Dibuat oleh AI — periksa sebelum bertindak.</p>
        </div>
      )}
    </div>
  )
}
