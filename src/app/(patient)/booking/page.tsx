"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookingForm } from "@/components/booking/BookingForm"
import { toast } from "@/lib/toast"
import confetti from "canvas-confetti"

export default function PatientBookingPage() {
  const router = useRouter()
  const [done, setDone] = useState(false)

  function onSubmitted() {
    setDone(true)
    toast.success("Booking terkirim!", "Tim klinik akan konfirmasi waktu.")
    // Confetti burst dari tengah-atas
    if (typeof window !== "undefined") {
      try {
        const duration = 1200
        const end = Date.now() + duration
        const colors = ["#466147", "#5e7a5e", "#95492b", "#C97B2C"]
        const frame = () => {
          confetti({
            particleCount: 3, angle: 60, spread: 55,
            origin: { x: 0, y: 0.6 }, colors,
          })
          confetti({
            particleCount: 3, angle: 120, spread: 55,
            origin: { x: 1, y: 0.6 }, colors,
          })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
      } catch {}
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-headline-lg text-ink mb-1">Booking Jadwal</h1>
      <p className="text-body-md text-ink-muted mb-5">Pilih dokter dan waktu yang tersedia.</p>

      {done ? (
        <div className="card p-6 space-y-3 text-center">
          <div className="mx-auto size-16 rounded-full bg-primary-soft flex items-center justify-center text-primary">
            <span className="material-symbols-rounded filled text-[32px]">check_circle</span>
          </div>
          <div>
            <p className="text-headline-sm text-ink">Booking terkirim!</p>
            <p className="text-body-md text-ink-muted mt-1">
              Tim klinik akan mengonfirmasi janji Anda dalam waktu singkat.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => router.push("/history")} className="btn-secondary flex-1">
              Lihat Riwayat
            </button>
            <button onClick={() => setDone(false)} className="btn-primary flex-1">
              Buat lagi
            </button>
          </div>
        </div>
      ) : (
        <BookingForm onSubmitted={onSubmitted} />
      )}
    </div>
  )
}
