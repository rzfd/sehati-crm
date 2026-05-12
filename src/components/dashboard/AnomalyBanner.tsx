interface Anomaly {
  type:    "volume_spike" | "urgency_spike" | "ai_drop"
  message: string
}

interface Props {
  anomalies: Anomaly[]
}

// Threshold-based anomaly banner. Sprint 6 — versi AI lebih nuanced nanti.
export function AnomalyBanner({ anomalies }: Props) {
  if (!anomalies.length) return null

  return (
    <div className="card border-l-4 border-l-amber-500 p-3 space-y-1.5">
      <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Deteksi anomali</p>
      <ul className="text-sm text-gray-700 space-y-1">
        {anomalies.map((a, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-amber-500">⚠</span>
            <span>{a.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
