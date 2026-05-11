"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
        alert(data.error ?? "Gagal menghapus.")
        setLoading(false)
        return
      }
      router.refresh()
    } catch {
      alert("Terjadi kesalahan.")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 px-2 py-1"
      title="Hapus dokumen"
    >
      {loading ? "..." : "Hapus"}
    </button>
  )
}
