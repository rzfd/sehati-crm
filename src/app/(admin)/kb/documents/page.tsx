import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { StatusPill } from "@/components/shared/StatusPill"
import { EmptyState } from "@/components/shared/EmptyState"
import { DocumentUpload } from "@/components/kb/DocumentUpload"
import { DocumentDeleteButton } from "@/components/kb/DocumentDeleteButton"

export const dynamic = "force-dynamic"

function formatBytes(bytes: number | null) {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function AdminKBDocumentsPage() {
  const supabase = await createClient()
  const { data: docs } = await supabase
    .from("kb_documents")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/kb" className="text-xs text-gray-500 hover:text-purple-500">← Kembali ke KB</Link>
        <h1 className="text-xl font-medium text-gray-700 mt-2">Dokumen KB</h1>
        <p className="text-sm text-gray-500 mt-1">Upload PDF / DOC untuk memperkaya knowledge base AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <Card>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Daftar Dokumen</h2>
          {!docs || docs.length === 0 ? (
            <EmptyState
              title="Belum ada dokumen"
              description="Upload PDF, DOC, DOCX, atau TXT untuk menambahkan ke knowledge base."
            />
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {docs.map((doc) => (
                <li key={doc.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-400">
                      {formatBytes(doc.file_size_bytes)} · {doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <StatusPill type="document" status={doc.status} />
                  <DocumentDeleteButton id={doc.id} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div>
          <Card>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Upload Baru</h2>
            <DocumentUpload />
          </Card>
        </div>
      </div>
    </div>
  )
}
