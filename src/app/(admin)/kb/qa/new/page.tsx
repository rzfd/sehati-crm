import { createClient } from "@/lib/supabase/server"
import { QAEditor } from "@/components/kb/QAEditor"
import { AIPreview } from "@/components/kb/AIPreview"
import { KBQuestionNav } from "@/components/kb/KBQuestionNav"

export const dynamic = "force-dynamic"

export default async function NewQAPage() {
  const supabase = await createClient()
  const { data: list } = await supabase
    .from("kb_qa_pairs")
    .select("id, question, status, tags")
    .order("updated_at", { ascending: false })
    .limit(50)

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4 items-start">
        <KBQuestionNav items={list ?? []} />
        <QAEditor />
        <AIPreview />
      </div>
    </div>
  )
}
