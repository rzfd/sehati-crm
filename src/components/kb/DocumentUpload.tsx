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
          "card border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          dragOver  ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-500",
          uploading && "opacity-60 cursor-not-allowed"
        )}
      >
        <div className="mx-auto size-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-3">
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">
          {uploading ? "Memproses dokumen…" : "Klik atau drag file di sini"}
        </p>
        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT — maks {APP_CONFIG.MAX_FILE_SIZE_MB}MB</p>

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
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="size-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          Parsing → chunking → embedding (proses ini bisa 10-30 detik)
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2 text-xs text-teal-600">{success}</div>
      )}

      <div>
        <Button
          variant="purple"
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          Pilih File
        </Button>
      </div>
    </div>
  )
}
