import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { StatusPill } from "@/components/shared/StatusPill"
import { EmptyState } from "@/components/shared/EmptyState"
import { DocumentUpload } from "@/components/kb/DocumentUpload"
import { DocumentDeleteButton } from "@/components/kb/DocumentDeleteButton"
import { DocumentExtractQAButton } from "@/components/kb/DocumentExtractQAButton"

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
    <div className="p-6 max-w-5xl">
      <nav className="text-body-sm text-ink-muted mb-1">
        <Link href="/kb" className="hover:text-ink">Knowledge Base</Link>
        <span className="text-ink-dim mx-1">›</span> Upload Dokumen
      </nav>
      <h1 className="text-headline-md text-ink mt-1">Manajemen Dokumen</h1>
      <p className="text-body-md text-ink-muted mt-1 mb-6">Unggah dan kelola sumber pengetahuan untuk AI Sehati.</p>

      {/* Upload zone */}
      <DocumentUpload />

      {/* Document table */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
          <h2 className="text-card-title text-ink">Daftar Dokumen</h2>
          <span className="text-body-sm text-ink-muted">{docs?.length ?? 0} Dokumen Total</span>
        </div>
        {!docs || docs.length === 0 ? (
          <EmptyState
            title="Belum ada dokumen"
            description="Upload PDF, DOC, DOCX, atau TXT untuk menambahkan ke knowledge base."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-ink-dim eyebrow border-b border-border-soft">
                  <th className="font-semibold px-4 py-2.5">Nama File</th>
                  <th className="font-semibold px-4 py-2.5">Ukuran</th>
                  <th className="font-semibold px-4 py-2.5">Total Chunk</th>
                  <th className="font-semibold px-4 py-2.5">Tgl Unggah</th>
                  <th className="font-semibold px-4 py-2.5">Status</th>
                  <th className="font-semibold px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-rounded text-[18px] text-secondary shrink-0">description</span>
                        <span className="text-body-md text-ink truncate">{doc.title}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-ink-muted whitespace-nowrap">{formatBytes(doc.file_size_bytes)}</td>
                    <td className="px-4 py-3 text-body-sm text-ink-muted">{doc.chunk_count}</td>
                    <td className="px-4 py-3 text-body-sm text-ink-muted whitespace-nowrap">{new Date(doc.created_at).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3"><StatusPill type="document" status={doc.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DocumentExtractQAButton id={doc.id} status={doc.status} />
                        <DocumentDeleteButton id={doc.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
