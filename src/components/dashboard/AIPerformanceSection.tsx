interface AIPerformanceData {
  total_conversations:  number
  ai_handled:           number
  hit_rate:             number    // 0-1
  avg_confidence:       number    // 0-1
  kb_coverage:          number    // 0-1
  time_saved_minutes:   number
}

interface Props {
  data: AIPerformanceData
}

export function AIPerformanceSection({ data }: Props) {
  const handledPct  = data.total_conversations > 0 ? (data.ai_handled / data.total_conversations) * 100 : 0
  const hitPct      = data.hit_rate * 100
  const confPct     = data.avg_confidence * 100
  const coveragePct = data.kb_coverage * 100

  return (
    <div className="card p-5 space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700">Performance AI &amp; KB</p>
        <p className="text-xs text-gray-500">Indikator efektivitas auto-reply &amp; cakupan knowledge base.</p>
      </div>

      <div className="space-y-3">
        <ProgressRow label="AI handled" value={handledPct} color="bg-teal-400" />
        <ProgressRow label="KB hit rate" value={hitPct} color="bg-blue-500" />
        <ProgressRow label="Confidence rata-rata" value={confPct} color="bg-purple-500" />
        <ProgressRow label="KB coverage" value={coveragePct} color="bg-amber-500" />
      </div>

      <div className="pt-2 border-t border-black/[0.04]">
        <p className="text-xs text-gray-500">Estimasi waktu yang dihemat staff</p>
        <p className="text-lg font-medium text-teal-600">{data.time_saved_minutes} menit</p>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-700 font-medium">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  )
}
