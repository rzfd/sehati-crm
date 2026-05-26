"use client"

import { useCallback, useEffect, useState } from "react"
import { format, addDays, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { SlotPicker } from "./SlotPicker"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

interface Props {
  bookingId:   string
  doctorId:    string
  doctorName?: string | null
  onClose: () => void
  onDone:  () => void
}

// Modal jadwalkan-ulang dipakai pasien (history) & staff (kalender). Sama-sama
// PATCH /api/booking/[id] dengan { booking_date, booking_time }; peran ditentukan server.
export function RescheduleModal({ bookingId, doctorId, doctorName, onClose, onDone }: Props) {
  const [date, setDate]               = useState<string>("")
  const [slots, setSlots]             = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slot, setSlot]               = useState<string | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const days = Array.from({ length: 14 }, (_, i) => format(addDays(new Date(), i), "yyyy-MM-dd"))

  const loadSlots = useCallback((d: string) => {
    setSlotsLoading(true)
    fetch(`/api/booking/slots?doctor_id=${doctorId}&date=${d}`)
      .then((r) => r.json())
      .then((res) => setSlots(res?.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [doctorId])

  useEffect(() => {
    if (!date) return
    /* eslint-disable react-hooks/set-state-in-effect */
    setSlot(null)
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
    loadSlots(date)
  }, [date, loadSlots])

  async function submit() {
    if (!date || !slot) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/booking/${bookingId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ booking_date: date, booking_time: slot }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(d.error ?? "Gagal menjadwalkan ulang.")
        if (res.status === 409) { setSlot(null); loadSlots(date) } // slot keburu diambil → refresh
        return
      }
      toast.success("Jadwal diperbarui", "Janji berhasil dijadwalkan ulang.")
      onDone()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/60 modal-backdrop z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-modal slide-up sm:animate-none max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm text-ink">Jadwalkan Ulang</h2>
          <button onClick={onClose} aria-label="Tutup" className="size-8 rounded-lg hover:bg-surface-alt flex items-center justify-center text-ink-muted">
            <span className="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>
        {doctorName && <p className="text-body-sm text-ink-muted -mt-2">Bersama {doctorName}</p>}

        <div>
          <p className="eyebrow mb-2">Pilih tanggal</p>
          <div className="flex gap-2 overflow-x-auto chat-scroll pb-1">
            {days.map((d) => {
              const dt = parseISO(d)
              const active = date === d
              return (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  className={cn(
                    "shrink-0 w-14 rounded-xl border px-2 py-2 text-center transition-colors",
                    active ? "bg-primary text-on-primary border-primary" : "bg-surface text-ink border-border hover:border-primary/40",
                  )}
                >
                  <p className="text-eyebrow uppercase opacity-75">{format(dt, "EEE", { locale: idLocale })}</p>
                  <p className="text-lg font-semibold leading-tight">{format(dt, "d")}</p>
                  <p className="text-eyebrow opacity-75">{format(dt, "MMM", { locale: idLocale })}</p>
                </button>
              )
            })}
          </div>
        </div>

        {date && (
          <div>
            <p className="eyebrow mb-2">Pilih waktu</p>
            <SlotPicker slots={slots} selected={slot} loading={slotsLoading} onSelect={setSlot} />
          </div>
        )}

        {error && <p className="text-body-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button onClick={submit} disabled={!slot || submitting} className="btn-primary flex-1">
            {submitting ? "Menyimpan…" : "Konfirmasi jadwal baru"}
          </button>
        </div>
      </div>
    </div>
  )
}
