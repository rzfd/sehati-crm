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
        const colors = ["#1D9E75", "#5DCAA5", "#185FA5", "#7BB5E8"]
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
    <div className="p-4 pt-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Buat janji</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Pilih dokter dan waktu yang tersedia.</p>

      {done ? (
        <div className="card p-6 space-y-3 text-center">
          <div className="mx-auto size-16 rounded-full bg-teal-50 dark:bg-teal-500/15 flex items-center justify-center text-3xl">
            ✅
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Booking terkirim!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tim klinik akan mengonfirmasi janji Anda dalam waktu singkat.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => router.push("/history")} className="btn-secondary flex-1 justify-center">
              Lihat Riwayat
            </button>
            <button onClick={() => setDone(false)} className="btn-primary flex-1 justify-center">
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
