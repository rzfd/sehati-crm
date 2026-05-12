"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useInboxStore } from "@/store/inboxStore"
import { toast } from "@/lib/toast"

interface PatientResult {
  id:    string
  name:  string
  phone: string | null
}

// Search bar di top inbox. Klik hasil → open patient's latest conversation.
export function PatientSearchBar() {
  const [q, setQ]           = useState("")
  const [results, setResults] = useState<PatientResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen]     = useState(false)
  const setActive = useInboxStore((s) => s.setActive)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    /* eslint-enable react-hooks/set-state-in-effect */
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/patients?q=${encodeURIComponent(q)}`)
      if (cancelled) return
      if (res.ok) setResults(await res.json())
      setLoading(false)
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [q])

  async function selectPatient(p: PatientResult) {
    setOpen(false)
    setQ("")
    setResults([])
    const supabase = createClient()
    const { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .eq("patient_id", p.id)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (conv) setActive(conv.id)
    else toast.info(`${p.name} belum punya conversation.`)
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Cari pasien (nama / nomor HP)…"
        className="input text-xs h-8"
      />
      {open && q.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/[0.08] rounded-lg shadow-md max-h-72 overflow-y-auto z-20">
          {loading ? (
            <p className="p-3 text-xs text-gray-400">Mencari…</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-xs text-gray-400">Tidak ada hasil.</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPatient(p)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-black/[0.04]"
              >
                <p className="text-xs font-medium text-gray-700">{p.name}</p>
                {p.phone && <p className="text-[10px] text-gray-500">{p.phone}</p>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
