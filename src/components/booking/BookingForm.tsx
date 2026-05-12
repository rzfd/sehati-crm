"use client"

import { useEffect, useState } from "react"
import { format, addDays, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { SlotPicker } from "./SlotPicker"
import { cn } from "@/lib/utils"

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
              n <= step ? "bg-teal-400" : "bg-gray-200",
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">1. Pilih dokter</h2>
          {doctorsLoading ? (
            <p className="text-sm text-gray-400">Memuat…</p>
          ) : doctors.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada dokter aktif di klinik ini.</p>
          ) : (
            <div className="space-y-2">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setDoctor(d); setStep(2) }}
                  className={cn(
                    "card-hover w-full text-left p-3 flex gap-3 items-start",
                    doctor?.id === d.id && "ring-2 ring-teal-400",
                  )}
                >
                  {d.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.avatar_url} alt={d.name} className="size-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="size-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-sm flex-shrink-0">
                      {d.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700">{d.title} {d.name}</p>
                    <p className="text-xs text-gray-500">{d.specialty}</p>
                    {d.bio && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{d.bio}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 2 && doctor && (
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">2. Pilih hari</h2>
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
                    "rounded-lg border px-2 py-3 text-center transition-colors",
                    active
                      ? "bg-teal-400 text-white border-teal-500"
                      : "bg-white text-gray-700 border-black/[0.12] hover:border-teal-400",
                  )}
                >
                  <p className="text-[10px] uppercase tracking-wide opacity-75">
                    {format(dt, "EEE", { locale: idLocale })}
                  </p>
                  <p className="text-lg font-medium leading-tight">{format(dt, "d")}</p>
                  <p className="text-[10px] opacity-75">{format(dt, "MMM", { locale: idLocale })}</p>
                </button>
              )
            })}
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-xs text-gray-500 hover:text-gray-700">
            ← Ganti dokter
          </button>
        </section>
      )}

      {step === 3 && doctor && date && (
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">3. Pilih jam</h2>
          <SlotPicker
            slots={slots}
            selected={slot}
            loading={slotsLoading}
            onSelect={(s) => { setSlot(s); setStep(4) }}
          />
          <button onClick={() => setStep(2)} className="mt-4 text-xs text-gray-500 hover:text-gray-700">
            ← Ganti hari
          </button>
        </section>
      )}

      {step === 4 && doctor && date && slot && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">4. Konfirmasi & catatan</h2>

          <div className="card p-3 space-y-1">
            <p className="text-sm font-medium text-gray-700">{doctor.title} {doctor.name}</p>
            <p className="text-xs text-gray-500">{doctor.specialty}</p>
            <p className="text-sm text-gray-700 mt-2">
              {format(parseISO(date), "EEEE, d MMMM yyyy", { locale: idLocale })} • {slot.slice(0, 5)}
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Pembayaran</label>
            <div className="flex gap-2">
              <label className={cn(
                "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs text-center",
                paymentMethod === "self" ? "border-teal-400 bg-teal-50 text-teal-700" : "border-black/[0.12]",
              )}>
                <input
                  type="radio" name="pay" value="self" className="sr-only"
                  checked={paymentMethod === "self"}
                  onChange={() => setPaymentMethod("self")}
                />
                Bayar sendiri
              </label>
              <label className={cn(
                "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs text-center",
                paymentMethod === "insurance" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-black/[0.12]",
              )}>
                <input
                  type="radio" name="pay" value="insurance" className="sr-only"
                  checked={paymentMethod === "insurance"}
                  onChange={() => setPaymentMethod("insurance")}
                />
                Asuransi
              </label>
            </div>
          </div>

          {paymentMethod === "insurance" && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Penyedia</label>
                <select className="input text-xs" value={insuranceProv} onChange={(e) => setInsuranceProv(e.target.value)}>
                  <option value="BPJS">BPJS</option>
                  <option value="Mandiri Inhealth">Mandiri Inhealth</option>
                  <option value="AXA">AXA</option>
                  <option value="Allianz">Allianz</option>
                  <option value="Prudential">Prudential</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Nomor kartu</label>
                <input className="input text-xs" value={insuranceNum} onChange={(e) => setInsuranceNum(e.target.value)} placeholder="No. kartu asuransi" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Catatan untuk dokter <span className="text-gray-400">(opsional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input"
              placeholder="Keluhan singkat, riwayat, dll."
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1 justify-center" type="button">
              Kembali
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1 justify-center" disabled={submitting}>
              {submitting ? "Menyimpan…" : "Konfirmasi booking"}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
