"use client"

import { useEffect, useState } from "react"

interface Template {
  id:          string
  title:       string
  content:     string
  category:    string | null
  usage_count: number
}

export default function TemplatesPage() {
  const [items, setItems] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [title, setTitle]       = useState("")
  const [content, setContent]   = useState("")
  const [category, setCategory] = useState("")
  const [saving, setSaving]     = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/reply-templates")
    if (res.ok) setItems(await res.json())
    else setError("Gagal memuat.")
    setLoading(false)
  }

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { load() }, [])

  function reset() {
    setTitle(""); setContent(""); setCategory(""); setEditId(null); setShowForm(false); setError(null)
  }

  function openEdit(t: Template) {
    setEditId(t.id); setTitle(t.title); setContent(t.content); setCategory(t.category ?? "")
    setShowForm(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) { setError("Title dan content wajib."); return }
    setSaving(true); setError(null)
    try {
      const url = editId ? `/api/reply-templates/${editId}` : "/api/reply-templates"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal."); return
      }
      reset(); load()
    } finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm("Hapus template ini?")) return
    await fetch(`/api/reply-templates/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium text-gray-700">Template Balasan</h1>
          <p className="text-sm text-gray-500">Quick-reply yang bisa staff pakai di inbox.</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true) }} className="btn-purple">+ Template baru</button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Memuat…</p>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-gray-500">Belum ada template. Tambah template pertama Anda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-700">{t.title}</p>
                    {t.category && <span className="pill pill-purple">{t.category}</span>}
                    <span className="text-[10px] text-gray-400">dipakai {t.usage_count}×</span>
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">{t.content}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(t)} className="text-[11px] text-purple-500 hover:text-purple-700">Edit</button>
                  <button onClick={() => remove(t.id)} className="text-[11px] text-red-500 hover:text-red-700">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 modal-backdrop z-50 flex items-center justify-center p-4" onClick={reset}>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 modal-content w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-medium text-gray-700">{editId ? "Edit" : "Tambah"} template</h2>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mis. Greeting pagi" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kategori (opsional)</label>
                <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="greeting, booking, medical" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Konten</label>
                <textarea className="input resize-none" rows={5} value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-2 py-1.5">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={reset} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" disabled={saving} className="btn-purple flex-1 justify-center">
                  {saving ? "..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
