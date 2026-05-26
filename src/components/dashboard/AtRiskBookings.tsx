"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "@/lib/toast"

interface AtRisk {
  id:           string
  booking_date: string
  booking_time: string
  patient_name: string
  doctor_name:  string | null
  risk:         { level: "medium" | "high"; score: number; reasons: string[] }
}

export function AtRiskBookings() {
  const [items, setItems] = useState<AtRisk[]>([])
  const [loading, setLoading] = useState(true)
  const [reminding, setReminding] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/booking/at-risk")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { if (!cancelled) { setItems(Array.isArray(d) ? d : []); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function remind(id: string) {
    setReminding(id)
    try {
      const res = await fetch(`/api/booking/${id}/remind`, { method: "POST" })
      if (res.ok) toast.success("Pengingat terkirim")
      else toast.error("Gagal kirim pengingat")
    } finally {
      setReminding(null)
    }
  }

  if (loading || items.length === 0) return null

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-rounded text-warning text-[20px]">event_busy</span>
        <p className="text-card-title text-ink">Risiko No-show ({items.length})</p>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 6).map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-2 border-b border-border-soft pb-2 last:border-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-body-md text-ink truncate">
                {b.patient_name}{b.doctor_name ? <span className="text-ink-dim"> · {b.doctor_name}</span> : null}
              </p>
              <p className="text-body-sm text-ink-muted">
                {format(parseISO(b.booking_date), "EEE d MMM", { locale: idLocale })} {b.booking_time.slice(0, 5)} ·{" "}
                <span className={b.risk.level === "high" ? "text-danger" : "text-warning"}>
                  {b.risk.level === "high" ? "Risiko tinggi" : "Risiko sedang"}
                </span>
              </p>
            </div>
            <button onClick={() => remind(b.id)} disabled={reminding === b.id} className="btn-secondary text-sm shrink-0 disabled:opacity-60">
              {reminding === b.id ? "…" : "Ingatkan"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
