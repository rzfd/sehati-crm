"use client"

import { useEffect, useState } from "react"
import { format, addDays, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { SlotPicker } from "./SlotPicker"
import { cn } from "@/lib/utils"
import { formatDoctorName } from "@/lib/format"

interface Doctor {
  id:         string
  name:       string
  title:      string
  specialty:  string
  bio:        string | null
  avatar_url: string | null
}

interface BookingFormProps {
  onSubmitted: (bookingId: string) => void
}

// 4-step wizard: Dokter → Hari → Jam → Catatan.
export function BookingForm({ onSubmitted }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [doctors, setDoctors]       = useState<Doctor[]>([])
  const [doctorsLoading, setDocLoad] = useState(true)
  const [doctor, setDoctor]         = useState<Doctor | null>(null)

  const [date, setDate]             = useState<string>("")     // YYYY-MM-DD
  const [slots, setSlots]           = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slot, setSlot]             = useState<string | null>(null)

  const [notes, setNotes]           = useState("")
  const [paymentMethod, setPaymentMethod]     = useState("self")  // self | insurance
  const [insuranceProv, setInsuranceProv]     = useState("BPJS")
  const [insuranceNum, setInsuranceNum]       = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  // Load dokter list once
  useEffect(() => {
    fetch("/api/booking/doctors")
      .then((r) => r.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .finally(() => setDocLoad(false))
  }, [])

  // Load slot saat doctor + date dipilih. Sync external (API) → state.
  useEffect(() => {
    if (!doctor || !date) return
    /* eslint-disable react-hooks/set-state-in-effect */
    setSlot(null)
    setSlotsLoading(true)
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch(`/api/booking/slots?doctor_id=${doctor.id}&date=${date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data?.slots ?? []))
      .finally(() => setSlotsLoading(false))
  }, [doctor, date])

  // Generate 14 hari ke depan untuk picker
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i)
    return d.toISOString().split("T")[0]
  })

  async function handleSubmit() {
    if (!doctor || !date || !slot) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/booking", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id:          doctor.id,
          booking_date:       date,
          booking_time:       slot,
          notes:              notes.trim() || undefined,
          payment_method:     paymentMethod,
          payment_status:     paymentMethod === "insurance" ? "insurance_pending" : "unpaid",
          insurance_provider: paymentMethod === "insurance" ? insuranceProv : undefined,
          insurance_number:   paymentMethod === "insurance" ? insuranceNum : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Gagal membuat booking.")
        return
      }
      onSubmitted(data.id)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={cn(
              "flex-1 h-1.5 rounded-full transition-colors",
              n <= step ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <section>
          <StepHeading n={1} label="Pilih Tenaga Medis" />
          {doctorsLoading ? (
            <p className="text-body-md text-ink-dim">Memuat…</p>
          ) : doctors.length === 0 ? (
            <p className="text-body-md text-ink-muted">Belum ada dokter aktif di klinik ini.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doctors.map((d) => {
                const sel = doctor?.id === d.id
                return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setDoctor(d); setStep(2) }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border flex gap-3 items-center transition-colors",
                    sel ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-primary/40",
                  )}
                >
                  {d.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.avatar_url} alt={d.name} className="size-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="size-12 rounded-full bg-info-soft flex items-center justify-center text-tertiary text-sm font-semibold flex-shrink-0">
                      {d.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-card-title text-ink">{formatDoctorName(d)}</p>
                    <p className="text-body-sm text-ink-muted">{d.specialty}</p>
                  </div>
                  <span className={cn(
                    "material-symbols-rounded text-[22px] shrink-0",
                    sel ? "filled text-primary" : "text-ink-dim",
                  )}>
                    {sel ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {step === 2 && doctor && (
        <section>
          <StepHeading n={2} label="Pilih Tanggal" />
          <div className="grid grid-cols-4 gap-2">
            {days.map((d) => {
              const dt = parseISO(d)
              const active = date === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => { setDate(d); setStep(3) }}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center transition-colors",
                    active
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface text-ink border-border hover:border-primary/40",
                  )}
                >
                  <p className="text-eyebrow uppercase tracking-wide opacity-75">
                    {format(dt, "EEE", { locale: idLocale })}
                  </p>
                  <p className="text-xl font-semibold leading-tight">{format(dt, "d")}</p>
                  <p className="text-eyebrow opacity-75">{format(dt, "MMM", { locale: idLocale })}</p>
                </button>
              )
            })}
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-body-sm text-ink-muted hover:text-ink">
            ← Ganti dokter
          </button>
        </section>
      )}

      {step === 3 && doctor && date && (
        <section>
          <StepHeading n={3} label="Pilih Waktu" />
          <SlotPicker
            slots={slots}
            selected={slot}
            loading={slotsLoading}
            onSelect={(s) => { setSlot(s); setStep(4) }}
          />
          <button onClick={() => setStep(2)} className="mt-4 text-body-sm text-ink-muted hover:text-ink">
            ← Ganti hari
          </button>
        </section>
      )}

      {step === 4 && doctor && date && slot && (
        <section className="space-y-3">
          <StepHeading n={4} label="Konfirmasi & Catatan" />

          <div className="card p-4">
            <p className="text-card-title text-ink">{formatDoctorName(doctor)}</p>
            <p className="text-body-sm text-ink-muted">{doctor.specialty}</p>
            <p className="text-body-md text-ink mt-2 flex items-center gap-1.5">
              <span className="material-symbols-rounded text-[16px] text-secondary">event</span>
              {format(parseISO(date), "EEEE, d MMMM yyyy", { locale: idLocale })} • {slot.slice(0, 5)} WIB
            </p>
          </div>

          <div>
            <label className="block text-body-sm text-ink-muted mb-1.5">Pembayaran</label>
            <div className="flex gap-2">
              <label className={cn(
                "flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-body-sm text-center transition-colors",
                paymentMethod === "self" ? "border-primary bg-primary-soft text-primary font-semibold" : "border-border text-ink",
              )}>
                <input type="radio" name="pay" value="self" className="sr-only" checked={paymentMethod === "self"} onChange={() => setPaymentMethod("self")} />
                Bayar sendiri
              </label>
              <label className={cn(
                "flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-body-sm text-center transition-colors",
                paymentMethod === "insurance" ? "border-tertiary bg-info-soft text-tertiary font-semibold" : "border-border text-ink",
              )}>
                <input type="radio" name="pay" value="insurance" className="sr-only" checked={paymentMethod === "insurance"} onChange={() => setPaymentMethod("insurance")} />
                Asuransi
              </label>
            </div>
          </div>

          {paymentMethod === "insurance" && (
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div>
                <label className="block text-caption text-ink-muted mb-0.5">Penyedia</label>
                <select className="input" value={insuranceProv} onChange={(e) => setInsuranceProv(e.target.value)}>
                  <option value="BPJS">BPJS</option>
                  <option value="Mandiri Inhealth">Mandiri Inhealth</option>
                  <option value="AXA">AXA</option>
                  <option value="Allianz">Allianz</option>
                  <option value="Prudential">Prudential</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-caption text-ink-muted mb-0.5">Nomor kartu</label>
                <input className="input" value={insuranceNum} onChange={(e) => setInsuranceNum(e.target.value)} placeholder="No. kartu asuransi" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-body-sm text-ink-muted mb-1.5">Catatan untuk dokter <span className="text-ink-dim">(opsional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input"
              placeholder="Keluhan singkat, riwayat, dll."
            />
          </div>

          {error && (
            <p className="text-body-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1" type="button">
              Kembali
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1" disabled={submitting}>
              <span className="material-symbols-rounded text-[18px]">event_available</span>
              {submitting ? "Menyimpan…" : "Konfirmasi Booking"}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function StepHeading({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="size-6 rounded-full bg-primary text-on-primary text-body-sm font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      <h2 className="text-headline-sm text-ink">{label}</h2>
    </div>
  )
}
