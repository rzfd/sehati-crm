"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/lib/toast"

export function DocumentDeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm("Hapus dokumen ini permanen?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/kb/documents/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? "Gagal menghapus.")
        setLoading(false)
        return
      }
      toast.success("Dokumen dihapus.")
      router.refresh()
    } catch {
      toast.error("Terjadi kesalahan.")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-ink-dim hover:text-danger disabled:opacity-50 px-2 py-1"
      title="Hapus dokumen"
    >
      {loading ? "..." : "Hapus"}
    </button>
  )
}
