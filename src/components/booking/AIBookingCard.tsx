"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface Suggestion {
  doctor_id:    string
  doctor_name:  string
  specialty:    string
  date:         string  // YYYY-MM-DD
  time:         string  // HH:mm:ss
}

interface Props {
  suggestion:     Suggestion
  conversationId: string
  onConfirmed:    () => void
  onRejected:     () => void
}

// Panel staff untuk approve AI-suggested booking. 3 actions:
// Konfirmasi → create booking + reply ke pasien
// Ubah     → buka full booking form
// Tolak    → reply explanation
export function AIBookingCard({ suggestion, conversationId, onConfirmed, onRejected }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/booking", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id:       suggestion.doctor_id,
          booking_date:    suggestion.date,
          booking_time:    suggestion.time,
          conversation_id: conversationId,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Gagal konfirmasi.")
        return
      }
      onConfirmed()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card p-3 border-l-4 border-l-primary space-y-2">
      <div className="flex items-center gap-2">
        <span className="pill-sukses flex items-center gap-1">
          <span className="material-symbols-rounded filled text-[12px]">auto_awesome</span> AI booking
        </span>
        <span className="text-caption text-ink-dim">Saran dari AI</span>
      </div>
      <div className="text-sm">
        <p className="font-medium text-ink">dr. {suggestion.doctor_name}</p>
        <p className="text-xs text-ink-muted">{suggestion.specialty}</p>
        <p className="text-xs text-ink mt-1">
          {format(parseISO(suggestion.date), "EEEE, d MMM yyyy", { locale: idLocale })} • {suggestion.time.slice(0, 5)}
        </p>
      </div>
      {error && <p className="text-xs text-danger bg-danger-soft rounded-md px-2 py-1">{error}</p>}
      <div className="flex gap-1.5">
        <button onClick={confirm} disabled={busy} className="btn-primary text-xs flex-1 justify-center">
          {busy ? "..." : "Konfirmasi"}
        </button>
        <button onClick={onRejected} disabled={busy} className="btn-secondary text-xs flex-1 justify-center">
          Ubah / Tolak
        </button>
      </div>
    </div>
  )
}
