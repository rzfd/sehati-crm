"use client"

export default function PatientError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 m-4 card space-y-3">
      <p className="text-base font-medium text-red-500">Ada yang salah</p>
      <p className="text-xs text-gray-500">{error.message}</p>
      <div className="flex gap-2">
        <button onClick={reset} className="btn-primary text-sm">Coba lagi</button>
        <a href="/home" className="btn-secondary text-sm">Beranda</a>
      </div>
    </div>
  )
}
