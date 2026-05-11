import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

async function getStats() {
  const supabase = await createClient()

  const [qaTotal, qaPublished, qaDraft, docs, queryLogs, queryLogsUsed] = await Promise.all([
    supabase.from("kb_qa_pairs").select("*", { count: "exact", head: true }),
    supabase.from("kb_qa_pairs").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("kb_qa_pairs").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("kb_documents").select("*", { count: "exact", head: true }),
    supabase.from("kb_query_logs").select("*", { count: "exact", head: true }),
    supabase.from("kb_query_logs").select("*", { count: "exact", head: true }).eq("was_used", true),
  ])

  const totalQueries = queryLogs.count ?? 0
  const usedQueries  = queryLogsUsed.count ?? 0
  const hitRate      = totalQueries > 0 ? Math.round((usedQueries / totalQueries) * 100) : 0

  const { data: topQA } = await supabase
    .from("kb_qa_pairs")
    .select("id, question, usage_count")
    .eq("status", "published")
    .order("usage_count", { ascending: false })
    .limit(5)

  return {
    qaTotal:     qaTotal.count     ?? 0,
    qaPublished: qaPublished.count ?? 0,
    qaDraft:     qaDraft.count     ?? 0,
    docs:        docs.count        ?? 0,
    totalQueries,
    hitRate,
    topQA:       topQA ?? [],
  }
}

export default async function AdminKBPage() {
  const stats = await getStats()

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-700">Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola Q&amp;A dan dokumen yang dipakai AI untuk auto-reply</p>
        </div>
        <div className="flex gap-2">
          <Link href="/kb/qa/new"><Button variant="purple">+ Q&amp;A Baru</Button></Link>
          <Link href="/kb/documents"><Button variant="secondary">Upload Dokumen</Button></Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Q&A"        value={stats.qaTotal}     accent="purple" />
        <StatCard label="Published"        value={stats.qaPublished} accent="teal" />
        <StatCard label="Draft"            value={stats.qaDraft}     accent="amber" />
        <StatCard label="Dokumen"          value={stats.docs}        accent="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Pencarian KB" value={stats.totalQueries}    accent="gray" />
        <StatCard label="Hit Rate"           value={`${stats.hitRate}%`}   accent="teal" />
        <StatCard label="Coverage"           value={stats.qaPublished + stats.docs > 0 ? "Aktif" : "Kosong"} accent="purple" />
      </div>

      {/* Top Q&A */}
      <Card>
        <h2 className="text-base font-medium text-gray-700 mb-3">Top Q&amp;A (paling sering dipakai)</h2>
        {stats.topQA.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Belum ada Q&amp;A yang terpakai.</p>
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {stats.topQA.map((qa) => (
              <li key={qa.id} className="py-3 flex items-center justify-between">
                <Link href={`/kb/qa/${qa.id}`} className="text-sm text-gray-700 hover:text-purple-500 truncate flex-1 mr-3">
                  {qa.question}
                </Link>
                <span className="pill pill-purple shrink-0">{qa.usage_count}x</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: "teal" | "purple" | "amber" | "blue" | "gray" }) {
  const accentClass = {
    teal:   "text-teal-600",
    purple: "text-purple-500",
    amber:  "text-amber-600",
    blue:   "text-blue-600",
    gray:   "text-gray-700",
  }[accent]
  return (
    <Card className="p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${accentClass}`}>{value}</div>
    </Card>
  )
}
