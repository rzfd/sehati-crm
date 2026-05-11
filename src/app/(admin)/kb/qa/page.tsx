import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { QAList } from "@/components/kb/QAList"

export const dynamic = "force-dynamic"

export default async function AdminKBQAPage() {
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from("kb_qa_pairs")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-700">Q&amp;A</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar pertanyaan dan jawaban yang dipakai AI untuk auto-reply</p>
        </div>
        <Link href="/kb/qa/new">
          <Button variant="purple">+ Q&amp;A Baru</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600 mb-4">
          Gagal memuat data: {error.message}
        </div>
      )}

      <QAList items={items ?? []} />
    </div>
  )
}
