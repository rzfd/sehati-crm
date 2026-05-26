"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

interface Doctor { id: string; name: string; specialty: string; title: string }
interface BroadcastRow {
  id:              string
  title:           string
  body:            string
  segment_type:    string
  segment_value:   string | null
  recipient_count: number
  created_at:      string
}

const SEGMENTS = [
  { value: "all",    label: "Semua pasien" },
  { value: "new",    label: "Pasien baru" },
  { value: "doctor", label: "Per dokter" },
  { value: "tag",    label: "Per tag" },
] as const

export default function BroadcastsPage() {
  const [segmentType, setSegmentType]   = useState<string>("all")
  const [segmentValue, setSegmentValue] = useState<string>("")
  const [title, setTitle] = useState("")
  const [body, setBody]   = useState("")
  const [link, setLink]   = useState("")
  const [count, setCount] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [history, setHistory] = useState<BroadcastRow[]>([])

  useEffect(() => {
    fetch("/api/booking/doctors").then((r) => r.json())
      .then((d) => setDoctors(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const loadHistory = useCallback(() => {
    fetch("/api/broadcasts").then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])
  useEffect(() => { loadHistory() }, [loadHistory])

  const needsValue   = segmentType === "doctor" || segmentType === "tag"
  const segmentReady = !needsValue || !!segmentValue

  // Preview jumlah penerima (dryRun) — setState hanya di callback async (bukan body effect).
  useEffect(() => {
    if (needsValue && !segmentValue) return
    let cancelled = false
    fetch("/api/broadcasts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ dryRun: true, segment_type: segmentType, segment_value: segmentValue || null }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setCount(typeof d.count === "number" ? d.count : null) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [segmentType, segmentValue, needsValue])

  async function send() {
    if (!title.trim() || !body.trim()) { toast.error("Judul & isi wajib."); return }
    setSending(true)
    try {
      const res = await fetch("/api/broadcasts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, body, link: link || undefined, segment_type: segmentType, segment_value: segmentValue || null }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(d.error ?? "Gagal mengirim broadcast."); return }
      toast.success("Broadcast terkirim", `Terkirim ke ${d.count} pasien.`)
      setTitle(""); setBody(""); setLink("")
      loadHistory()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-headline-lg text-ink mb-1">Broadcast</h1>
      <p className="text-body-md text-ink-muted mb-6">Kirim pengumuman atau promo ke segmen pasien (notifikasi in-app + push).</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Compose */}
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-body-sm text-ink-muted mb-1.5">Segmen penerima</label>
            <div className="grid grid-cols-2 gap-2">
              {SEGMENTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => { setSegmentType(s.value); setSegmentValue(""); setCount(null) }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-body-sm transition-colors",
                    segmentType === s.value ? "border-primary bg-primary-soft text-primary font-semibold" : "border-border text-ink hover:border-primary/40",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {segmentType === "doctor" && (
            <div>
              <label className="block text-body-sm text-ink-muted mb-1.5">Dokter</label>
              <select className="input" value={segmentValue} onChange={(e) => setSegmentValue(e.target.value)}>
                <option value="">Pilih dokter…</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.title} {d.name} · {d.specialty}</option>)}
              </select>
            </div>
          )}
          {segmentType === "tag" && (
            <div>
              <label className="block text-body-sm text-ink-muted mb-1.5">Tag pasien</label>
              <input className="input" value={segmentValue} onChange={(e) => setSegmentValue(e.target.value)} placeholder="mis. vip, lansia" />
            </div>
          )}

          <div className="rounded-lg bg-surface-alt px-3 py-2 text-body-sm text-ink-muted">
            {count === null
              ? "Pilih segmen untuk melihat estimasi penerima."
              : <>Estimasi penerima: <span className="font-semibold text-ink">{count} pasien</span></>}
          </div>

          <div>
            <label className="block text-body-sm text-ink-muted mb-1.5">Judul</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Promo vaksin flu" maxLength={80} />
          </div>
          <div>
            <label className="block text-body-sm text-ink-muted mb-1.5">Isi pesan</label>
            <textarea className="input" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tulis pengumuman…" maxLength={500} />
          </div>
          <div>
            <label className="block text-body-sm text-ink-muted mb-1.5">Link tujuan <span className="text-ink-dim">(opsional)</span></label>
            <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/booking" />
          </div>

          <button
            onClick={send}
            disabled={sending || !segmentReady || !title.trim() || !body.trim()}
            className="btn-primary w-full"
          >
            <span className="material-symbols-rounded text-[18px]">campaign</span>
            {sending ? "Mengirim…" : count !== null ? `Kirim ke ${count} pasien` : "Kirim broadcast"}
          </button>
        </div>

        {/* History */}
        <div>
          <p className="eyebrow mb-3">Riwayat broadcast</p>
          {history.length === 0 ? (
            <div className="card p-6 text-center text-body-sm text-ink-muted">Belum ada broadcast.</div>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-card-title text-ink">{h.title}</p>
                    <span className="pill-gray shrink-0">{h.recipient_count} pasien</span>
                  </div>
                  <p className="text-body-sm text-ink-muted mt-0.5 line-clamp-2">{h.body}</p>
                  <p className="text-caption text-ink-dim mt-1">
                    {segmentLabel(h.segment_type)} · {format(new Date(h.created_at), "d MMM yyyy HH:mm", { locale: idLocale })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function segmentLabel(t: string) {
  return SEGMENTS.find((s) => s.value === t)?.label ?? t
}
