"use client"

export default function StaffError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 m-6 card max-w-lg space-y-3">
      <p className="text-base font-medium text-red-500">Workspace staff error</p>
      <p className="text-xs text-gray-500 break-all">{error.message}</p>
      <div className="flex gap-2">
        <button onClick={reset} className="btn-primary text-sm">Coba lagi</button>
        <a href="/inbox" className="btn-secondary text-sm">Refresh inbox</a>
      </div>
    </div>
  )
}
