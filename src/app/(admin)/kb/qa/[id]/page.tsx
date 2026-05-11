import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QAEditor } from "@/components/kb/QAEditor"
import { AIPreview } from "@/components/kb/AIPreview"

export const dynamic = "force-dynamic"

export default async function AdminKBQADetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: qa, error } = await supabase
    .from("kb_qa_pairs")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !qa) notFound()

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/kb/qa" className="text-xs text-gray-500 hover:text-purple-500">← Kembali ke Q&amp;A</Link>
        <h1 className="text-xl font-medium text-gray-700 mt-2">Edit Q&amp;A</h1>
        <p className="text-sm text-gray-500 mt-1">Diubah pada {new Date(qa.updated_at).toLocaleString("id-ID")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <QAEditor initial={qa} />
        <AIPreview />
      </div>
    </div>
  )
}
