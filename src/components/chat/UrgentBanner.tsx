interface UrgentBannerProps {
  reason?:         string
  evidence?:       string[]
  recommendation?: string
  onDismiss?:      () => void
}

export function UrgentBanner({ reason, evidence, recommendation, onDismiss }: UrgentBannerProps) {
  return (
    <div className="urgent-banner">
      <div className="flex-shrink-0 size-9 rounded-full bg-surface/15 flex items-center justify-center">
        <span className="text-lg">!</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Perlu perhatian segera</p>
        {reason && <p className="text-xs opacity-90 mt-0.5">{reason}</p>}
        {evidence && evidence.length > 0 && (
          <ul className="text-xs opacity-90 mt-1 list-disc list-inside">
            {evidence.map((e, i) => <li key={i}>&ldquo;{e}&rdquo;</li>)}
          </ul>
        )}
        {recommendation && (
          <p className="text-xs mt-1.5 font-medium">→ {recommendation}</p>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 text-white/80 hover:text-white text-xs underline">
          Tutup
        </button>
      )}
    </div>
  )
}
