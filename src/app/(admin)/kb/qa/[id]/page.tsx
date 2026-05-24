import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QAEditor } from "@/components/kb/QAEditor"
import { AIPreview } from "@/components/kb/AIPreview"
import { KBQuestionNav } from "@/components/kb/KBQuestionNav"

export const dynamic = "force-dynamic"

export default async function AdminKBQADetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: qa, error }, { data: list }] = await Promise.all([
    supabase.from("kb_qa_pairs").select("*").eq("id", id).single(),
    supabase.from("kb_qa_pairs").select("id, question, status, tags").order("updated_at", { ascending: false }).limit(50),
  ])

  if (error || !qa) notFound()

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4 items-start">
        <KBQuestionNav items={list ?? []} activeId={id} />
        <QAEditor initial={qa} />
        <AIPreview />
      </div>
    </div>
  )
}
