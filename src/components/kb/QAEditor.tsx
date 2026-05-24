"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { KBQAPair } from "@/types/database"

type Status = "draft" | "published" | "archived"

interface QAEditorProps {
  initial?: KBQAPair
}

export function QAEditor({ initial }: QAEditorProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isEdit       = !!initial

  // Prefill dari query string (dipakai oleh KB Gaps deep-link)
  const initialQuestion = initial?.question ?? searchParams.get("question") ?? ""
  const initialAnswer   = initial?.answer   ?? searchParams.get("answer")   ?? ""

  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer]     = useState(initialAnswer)
  const [tags, setTags]         = useState((initial?.tags ?? []).join(", "))
  const [status, setStatus]     = useState<Status>(initial?.status ?? "draft")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  async function handleSave() {
    if (!question.trim() || !answer.trim()) {
      setError("Pertanyaan dan jawaban wajib diisi.")
      return
    }

    setLoading(true)
    setError("")

    const payload = {
      question: question.trim(),
      answer:   answer.trim(),
      tags:     tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
    }

    try {
      const url    = isEdit ? `/api/kb/qa/${initial!.id}` : "/api/kb/qa"
      const method = isEdit ? "PATCH" : "POST"
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan")

      router.push("/kb/qa")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initial) return
    if (!confirm("Hapus Q&A ini permanen?")) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/kb/qa/${initial.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Gagal menghapus")
      router.push("/kb/qa")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setLoading(false)
    }
  }

  const STATUSES: { value: Status; label: string }[] = [
    { value: "published", label: "Published" },
    { value: "draft",     label: "Draft" },
    { value: "archived",  label: "Archived" },
  ]
  const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-border-soft pb-4">
        <div>
          <p className="eyebrow">{isEdit ? "Edit Knowledge" : "Knowledge Baru"}</p>
          {isEdit && <p className="font-mono text-code-mono text-ink-dim mt-0.5">ID: {initial!.id.slice(0, 12).toUpperCase()}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push("/kb/qa")} disabled={loading}>Batalkan</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleSave}>
            {isEdit ? "Simpan Perubahan" : "Buat Q&A"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-soft border border-danger/30 px-3 py-2 text-body-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="question" required>Pertanyaan Utama</Label>
        <Input
          id="question"
          placeholder="Contoh: Jam buka klinik kapan?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <p className="text-body-sm text-ink-dim mt-1">Gunakan bahasa yang sering ditanyakan pasien untuk akurasi retrieval lebih baik.</p>
      </div>

      <div>
        <Label htmlFor="answer" required>Jawaban Database</Label>
        <Textarea
          id="answer"
          rows={6}
          placeholder="Tulis jawaban dengan jelas dan ramah. AI akan pakai ini sebagai dasar auto-reply."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Status Publikasi</Label>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-body-sm font-medium transition-colors",
                status === s.value ? "border-primary bg-primary-soft text-primary" : "border-border text-ink-muted hover:border-primary/40",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Kategori &amp; Tags</Label>
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tagList.map((t) => <span key={t} className="pill-info">{t}</span>)}
          </div>
        )}
        <Input
          id="tags"
          placeholder="Pisah dengan koma — mis: jam-buka, info"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {isEdit && (
        <div className="pt-2 border-t border-border-soft">
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
            <span className="material-symbols-rounded text-[16px]">delete</span> Hapus Q&amp;A
          </Button>
        </div>
      )}
    </div>
  )
}
