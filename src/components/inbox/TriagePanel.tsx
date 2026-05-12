"use client"

import { useState } from "react"

interface Props {
  message:        string
  conversationId: string
}

interface TriageResult {
  urgency_level:  number
  is_emergency:   boolean
  reason:         string
  evidence:       string[]
  recommendation: string
}

// On-demand triage trigger (staff klik untuk re-evaluasi pesan tertentu).
// Untuk auto-triage gunakan pipeline yang sudah jalan saat patient mengirim pesan.
export function TriagePanel({ message, conversationId }: Props) {
  const [result, setResult] = useState<TriageResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function runTriage() {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/triage", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
      })
      if (res.ok) setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-3">
      <p className="text-xs font-medium text-gray-700 mb-2">Triage AI</p>
      {!result && (
        <button onClick={runTriage} disabled={loading} className="btn-secondary text-xs">
          {loading ? "Menganalisis…" : "Analisis urgency"}
        </button>
      )}
      {result && (
        <div className="text-xs space-y-1.5">
          <p>
            <span className="text-gray-400">Level:</span>{" "}
            <span className={`pill ${result.urgency_level >= 3 ? "pill-red" : "pill-amber"}`}>
              {result.urgency_level}
            </span>
          </p>
          <p className="text-gray-700">{result.reason}</p>
          {result.evidence.length > 0 && (
            <ul className="text-gray-500 list-disc list-inside">
              {result.evidence.map((e, i) => <li key={i}>&ldquo;{e}&rdquo;</li>)}
            </ul>
          )}
          <p className="text-teal-600 font-medium">→ {result.recommendation}</p>
        </div>
      )}
    </div>
  )
}
