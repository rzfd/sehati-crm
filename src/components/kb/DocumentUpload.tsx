"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { APP_CONFIG } from "@/lib/constants"

interface DocumentUploadProps {
  onUploaded?: () => void
}

export function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const acceptedExts = ".pdf,.doc,.docx,.txt"
  const acceptedMime = APP_CONFIG.ACCEPTED_MIME as readonly string[]

  async function upload(file: File) {
    setError("")
    setSuccess("")
    if (file.size > APP_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File terlalu besar (maks ${APP_CONFIG.MAX_FILE_SIZE_MB}MB).`)
      return
    }
    if (!acceptedMime.includes(file.type)) {
      setError("Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, atau TXT.")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/kb/documents", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Gagal upload.")
      setSuccess(`✓ ${file.name} berhasil diproses (${data.chunk_count} chunks).`)
      onUploaded?.()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) upload(file)
        }}
        onClick={() => !uploading && fileInput.current?.click()}
        className={cn(
          "rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors bg-surface-alt",
          dragOver  ? "border-primary bg-primary-soft" : "border-border hover:border-primary",
          uploading && "opacity-60 cursor-not-allowed"
        )}
      >
        <div className="mx-auto size-14 rounded-full bg-surface border border-border flex items-center justify-center text-primary mb-3 shadow-card">
          <span className="material-symbols-rounded text-[26px]">cloud_upload</span>
        </div>
        <p className="text-headline-sm text-ink">
          {uploading ? "Memproses dokumen…" : "Upload Dokumen"}
        </p>
        <p className="text-body-md text-ink-muted mt-1">Seret dan lepas file di sini atau klik untuk memilih dari komputer.</p>
        <p className="text-body-sm text-ink-dim mt-1">Format: .pdf, .docx, .txt — maks {APP_CONFIG.MAX_FILE_SIZE_MB}MB</p>

        <input
          ref={fileInput}
          type="file"
          accept={acceptedExts}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file)
            e.target.value = "" // reset so same file can be re-uploaded
          }}
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="size-3 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          Parsing → chunking → embedding (proses ini bisa 10-30 detik)
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger-soft border border-danger px-3 py-2 text-xs text-danger">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-primary-soft border border-primary px-3 py-2 text-xs text-primary">{success}</div>
      )}

      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          Pilih File
        </Button>
      </div>
    </div>
  )
}
