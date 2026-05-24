"use client"

import Link from "next/link"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="card p-8 max-w-md w-full text-center space-y-3">
        <div className="size-12 rounded-full bg-danger-soft text-danger mx-auto flex items-center justify-center text-2xl">
          !
        </div>
        <h1 className="text-lg font-medium text-ink">Ada yang salah</h1>
        <p className="text-sm text-ink-muted">{error.message || "Terjadi kesalahan tak terduga."}</p>
        <div className="flex gap-2 justify-center pt-2">
          <button onClick={reset} className="btn-primary">Coba lagi</button>
          <Link href="/" className="btn-secondary">Ke beranda</Link>
        </div>
      </div>
    </div>
  )
}
