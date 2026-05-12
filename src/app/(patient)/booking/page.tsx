"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookingForm } from "@/components/booking/BookingForm"

export default function PatientBookingPage() {
  const router = useRouter()
  const [done, setDone] = useState(false)

  return (
    <div className="p-4 pt-6">
      <h1 className="text-lg font-medium text-gray-700 mb-1">Buat janji</h1>
      <p className="text-sm text-gray-500 mb-4">Pilih dokter dan waktu yang tersedia.</p>

      {done ? (
        <div className="card p-4 space-y-3 text-center">
          <p className="text-base font-medium text-gray-700">Booking terkirim ✅</p>
          <p className="text-sm text-gray-500">
            Tim klinik akan mengonfirmasi janji Anda dalam waktu singkat.
          </p>
          <div className="flex gap-2">
            <button onClick={() => router.push("/history")} className="btn-secondary flex-1 justify-center">
              Lihat Riwayat
            </button>
            <button onClick={() => setDone(false)} className="btn-primary flex-1 justify-center">
              Buat lagi
            </button>
          </div>
        </div>
      ) : (
        <BookingForm onSubmitted={() => setDone(true)} />
      )}
    </div>
  )
}
