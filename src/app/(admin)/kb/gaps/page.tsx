"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "@/lib/toast"

interface Gap {
  content:    string
  count:      number
  latest:     string
  sample_ids: string[]
  categories: string[]
}

interface Draft {
  question:         string
  answer:           string
  needs_human_info: boolean
  note:             string
}

export default function KBGapsPage() {
  const [gaps, setGaps] = useState<Gap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [draftingFor, setDraftingFor] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/kb/gaps")
      if (cancelled) return
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal memuat.")
      } else {
        setGaps(await res.json())
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  async function makeDraft(content: string) {
    setDraftingFor(content)
    try {
      const res = await fetch("/api/kb/gaps/draft", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: content }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(d.error ?? "Gagal membuat draft."); return }
      setDraft({ question: content, answer: d.answer ?? "", needs_human_info: !!d.needs_human_info, note: d.note ?? "" })
    } finally {
      setDraftingFor(null)
    }
  }

  async function saveDraft() {
    if (!draft) return
    if (!draft.question.trim() || !draft.answer.trim()) { toast.error("Pertanyaan & jawaban wajib diisi."); return }
    setSaving(true)
    try {
      const res = await fetch("/api/kb/qa", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: draft.question, answer: draft.answer, status: "draft" }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(d.error ?? "Gagal menyimpan."); return }
      toast.success("Tersimpan sebagai draft Q&A", "Tinjau & publikasikan dari daftar Q&A.")
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <nav className="text-body-sm text-ink-muted">
        <Link href="/kb" className="hover:text-ink">Knowledge Base</Link>
        <span className="text-ink-dim mx-1">›</span> KB Gaps
      </nav>
      <div>
        <h1 className="text-headline-md text-ink">KB Gaps</h1>
        <p className="text-body-md text-ink-muted">Pertanyaan yang AI tidak bisa jawab (30 hari terakhir). Pakai <strong>Draft AI</strong> untuk bikin jawaban awal.</p>
      </div>

      {loading && <p className="text-body-md text-ink-dim">Memuat…</p>}
      {error && <p className="text-body-md text-danger">{error}</p>}

      {!loading && gaps.length === 0 && (
        <div className="card p-8 text-center">
          <span className="material-symbols-rounded text-[32px] text-primary">task_alt</span>
          <p className="text-body-md text-ink-muted mt-2">Tidak ada gap signifikan dalam 30 hari terakhir.</p>
        </div>
      )}

      <div className="space-y-2">
        {gaps.map((g, i) => {
          const sev = g.count >= 5 ? { cls: "pill-danger", label: "High Miss" }
            : g.count >= 2 ? { cls: "pill-warning", label: "Partial Match" }
            : { cls: "pill-info", label: "New Topic" }
          return (
          <div key={i} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={sev.cls}>{sev.label}</span>
                  <span className="text-body-sm text-ink-dim">{g.count}× ditanyakan</span>
                </div>
                <p className="text-body-md text-ink">&ldquo;{g.content}&rdquo;</p>
                <div className="flex flex-wrap gap-1.5 items-center mt-2">
                  {g.categories.map((c) => (
                    <span key={c} className="pill-gray">{c}</span>
                  ))}
                  <span className="text-body-sm text-ink-dim">
                    Terakhir: {formatDistanceToNow(new Date(g.latest), { locale: idLocale, addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => makeDraft(g.content)}
                  disabled={draftingFor === g.content}
                  className="btn-sage text-sm justify-center disabled:opacity-60"
                >
                  <span className="material-symbols-rounded text-[18px]">auto_awesome</span>
                  {draftingFor === g.content ? "Membuat…" : "Draft AI"}
                </button>
                <Link
                  href={`/kb/qa/new?question=${encodeURIComponent(g.content)}`}
                  className="btn-secondary text-sm justify-center"
                >
                  <span className="material-symbols-rounded text-[18px]">add</span> Q&amp;A
                </Link>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {/* Draft review modal */}
      {draft && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 modal-backdrop z-50 flex items-end sm:items-center justify-center" onClick={() => setDraft(null)}>
          <div className="bg-surface w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 space-y-3 shadow-modal slide-up sm:animate-none max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-headline-sm text-ink flex items-center gap-2">
                <span className="material-symbols-rounded text-[20px] text-primary">auto_awesome</span> Draft jawaban AI
              </h2>
              <button onClick={() => setDraft(null)} aria-label="Tutup" className="size-8 rounded-lg hover:bg-surface-alt flex items-center justify-center text-ink-muted">
                <span className="material-symbols-rounded text-[20px]">close</span>
              </button>
            </div>

            {draft.needs_human_info && (
              <div className="rounded-lg bg-warning-soft border border-warning/30 px-3 py-2 text-body-sm text-warning">
                ⚠ Perlu dilengkapi staff{draft.note ? `: ${draft.note}` : "."} AI tidak mengisi data spesifik/medis.
              </div>
            )}

            <div>
              <label className="block text-body-sm text-ink-muted mb-1">Pertanyaan</label>
              <input className="input" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
            </div>
            <div>
              <label className="block text-body-sm text-ink-muted mb-1">Jawaban (draft AI — tinjau dulu)</label>
              <textarea className="input" rows={5} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} placeholder="Tulis jawaban…" />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setDraft(null)} className="btn-secondary flex-1">Batal</button>
              <button onClick={saveDraft} disabled={saving} className="btn-primary flex-1">
                {saving ? "Menyimpan…" : "Simpan sebagai draft Q&A"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
