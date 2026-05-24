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
    <div className="rounded-xl bg-warning-soft border border-warning/25 p-4 space-y-1.5">
      <p className="eyebrow text-warning flex items-center gap-1.5">
        <span className="material-symbols-rounded text-[16px]">warning</span>
        Deteksi Anomali
      </p>
      <ul className="text-body-md text-ink space-y-1">
        {anomalies.map((a, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-warning">•</span>
            <span>{a.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
