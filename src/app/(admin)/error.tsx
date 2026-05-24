"use client"

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 m-6 card max-w-lg space-y-3">
      <p className="text-base font-medium text-danger">Admin panel error</p>
      <p className="text-xs text-ink-muted break-all">{error.message}</p>
      <div className="flex gap-2">
        <button onClick={reset} className="btn-purple text-sm">Coba lagi</button>
        <a href="/kb" className="btn-secondary text-sm">Dashboard KB</a>
      </div>
    </div>
  )
}
