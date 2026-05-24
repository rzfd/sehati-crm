import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="card p-8 max-w-md w-full text-center space-y-3">
        <div className="size-12 rounded-full bg-warning-soft text-warning mx-auto flex items-center justify-center text-2xl">
          ?
        </div>
        <h1 className="text-lg font-medium text-ink">Halaman tidak ditemukan</h1>
        <p className="text-sm text-ink-muted">URL yang Anda buka tidak tersedia.</p>
        <div className="pt-2">
          <Link href="/" className="btn-primary inline-flex">Ke beranda</Link>
        </div>
      </div>
    </div>
  )
}
