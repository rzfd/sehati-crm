"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface KBMatch {
  id:          string
  content:     string
  similarity:  number
  source_type: "qa_pair" | "document_chunk"
}

export function AIPreview() {
  const [query, setQuery]     = useState("")
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<KBMatch[] | null>(null)
  const [error, setError]     = useState("")

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/kb/search", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Gagal cari KB")
      setMatches(data.matches ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 sticky top-6">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-700">AI Preview</h3>
        <p className="text-xs text-gray-400 mt-0.5">Coba simulasi: apakah Q&A ini di-retrieve?</p>
      </div>

      <div className="space-y-2 mb-3">
        <Input
          placeholder="Contoh: jam buka klinik?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          variant="purple"
          size="sm"
          className="w-full justify-center"
          loading={loading}
          onClick={handleSearch}
          disabled={!query.trim()}
        >
          Cari di KB
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>
      )}

      {matches !== null && !error && (
        <div className="space-y-2 mt-2">
          {matches.length === 0 ? (
            <p className="text-xs text-gray-500">Tidak ada match di KB. Pertimbangkan menambahkan Q&A baru.</p>
          ) : (
            matches.map((m, i) => (
              <div key={m.id} className="rounded-lg border border-black/[0.06] bg-gray-50 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">#{i + 1}</span>
                  <span className="pill pill-purple text-[10px]">{Math.round(m.similarity * 100)}%</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-line">{m.content}</p>
                <span className="text-[10px] text-gray-400 mt-1 inline-block">{m.source_type === "qa_pair" ? "Q&A" : "Dokumen"}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
