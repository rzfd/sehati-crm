"use client"

import { useState } from "react"
import { toast } from "@/lib/toast"

// Tombol "Buat Q&A dari dokumen" (hanya untuk dokumen yang sudah ready).
export function DocumentExtractQAButton({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false)
  if (status !== "ready") return null

  async function run() {
    setBusy(true)
    try {
      const res = await fetch(`/api/kb/documents/${id}/extract-qa`, { method: "POST" })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(d.error ?? "Gagal membuat Q&A."); return }
      toast.success(`${d.created} draft Q&A dibuat`, "Tinjau & publikasikan dari daftar Q&A.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      title="Buat Q&A dari dokumen (AI)"
      aria-label="Buat Q&A dari dokumen"
      className="text-primary hover:text-primary/80 disabled:opacity-50 p-1.5 rounded-lg hover:bg-primary-soft transition-colors"
    >
      <span className="material-symbols-rounded text-[18px]">{busy ? "hourglass_empty" : "auto_awesome"}</span>
    </button>
  )
}
