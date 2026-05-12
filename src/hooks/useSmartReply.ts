"use client"

import { useState, useCallback } from "react"
import type { SmartReplyResult } from "@/types/ai"

interface UseSmartReplyResult {
  result:    SmartReplyResult | null
  loading:   boolean
  error:     string | null
  generate:  (message: string, clinicId: string) => Promise<void>
  clear:     () => void
}

export function useSmartReply(): UseSmartReplyResult {
  const [result, setResult]   = useState<SmartReplyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const generate = useCallback(async (message: string, clinicId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/smart-reply", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, clinicId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Gagal generate.")
        return
      }
      const data = (await res.json()) as SmartReplyResult
      setResult(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, generate, clear }
}
