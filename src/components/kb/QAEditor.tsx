"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

  return (
    <div className="card p-5 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="question" required>Pertanyaan</Label>
        <Input
          id="question"
          placeholder="Contoh: Jam buka klinik kapan?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="answer" required>Jawaban</Label>
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
        <Label htmlFor="tags">Tag (pisah dengan koma)</Label>
        <Input
          id="tags"
          placeholder="contoh: jam-buka, info"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          <option value="draft">Draft (belum aktif)</option>
          <option value="published">Published (aktif dipakai AI)</option>
          <option value="archived">Arsip (tidak dipakai)</option>
        </select>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          {isEdit && (
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
              Hapus
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/kb/qa")} disabled={loading}>
            Batal
          </Button>
          <Button variant="purple" loading={loading} onClick={handleSave}>
            {isEdit ? "Simpan Perubahan" : "Buat Q&A"}
          </Button>
        </div>
      </div>
    </div>
  )
}
