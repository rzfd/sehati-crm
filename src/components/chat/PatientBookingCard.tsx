"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "@/lib/toast"

export interface ChatBookingSuggestion {
  doctor_id:   string | null
  doctor_name: string | null
  specialty:   string | null
  date:        string | null
  time:        string | null
}

// Kartu booking di chat pasien — muncul saat AI mendeteksi niat booking + ekstrak detail.
// Kalau dokter+tanggal+jam lengkap → konfirmasi langsung (self-book). Kalau tidak → ke form.
export function PatientBookingCard({ suggestion, conversationId, onDismiss }: {
  suggestion:     ChatBookingSuggestion
  conversationId: string
  onDismiss:      () => void
}) {
  const [busy, setBusy] = useState(false)
  const hasFull = !!(suggestion.doctor_id && suggestion.date && suggestion.time)

  async function confirm() {
    if (!hasFull) return
    setBusy(true)
    try {
      const res = await fetch("/api/booking", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          doctor_id:       suggestion.doctor_id,
          booking_date:    suggestion.date,
          booking_time:    suggestion.time,
          conversation_id: conversationId,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(d.error ?? "Gagal booking — coba pilih jadwal manual."); return }
      toast.success("Booking dibuat!", "Tim klinik akan mengonfirmasi.")
      onDismiss()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl bg-primary-soft border border-primary-dim p-4 space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-rounded filled text-[18px] text-primary">event_available</span>
        <p className="eyebrow text-primary">Mau buat janji?</p>
      </div>
      <p className="text-body-md text-ink">
        {suggestion.doctor_name
          ? <>Dengan <strong>dr. {suggestion.doctor_name}</strong>{suggestion.specialty ? ` · ${suggestion.specialty}` : ""}</>
          : "Buat janji dengan dokter kami"}
        {suggestion.date
          ? <> pada {format(parseISO(suggestion.date), "EEEE, d MMM", { locale: idLocale })}{suggestion.time ? `, ${suggestion.time.slice(0, 5)} WIB` : ""}</>
          : ""}.
      </p>
      <div className="flex gap-2 pt-1">
        {hasFull ? (
          <button onClick={confirm} disabled={busy} className="btn-primary text-sm flex-1 justify-center disabled:opacity-60">
            {busy ? "…" : "Konfirmasi booking"}
          </button>
        ) : (
          <Link href="/booking" className="btn-primary text-sm flex-1 justify-center">Pilih jadwal</Link>
        )}
        <button onClick={onDismiss} className="btn-secondary text-sm justify-center">Nanti</button>
      </div>
    </div>
  )
}
