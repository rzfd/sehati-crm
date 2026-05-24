import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { RAGSimulator } from "@/components/kb/RAGSimulator"

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

  const coverage = stats.qaPublished + stats.docs > 0
  // KB health score heuristic: bobot hit-rate + ketersediaan konten + minim draft.
  const healthScore = Math.min(100, Math.round(
    stats.hitRate * 0.6 +
    (coverage ? 30 : 0) +
    (stats.qaTotal > 0 ? Math.max(0, 10 - (stats.qaDraft / stats.qaTotal) * 10) : 0),
  ))

  return (
    <div className="p-6 max-w-7xl">
      <nav className="text-body-sm text-ink-muted mb-1">Klinik Pusat <span className="text-ink-dim mx-1">›</span> Knowledge Base</nav>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-headline-md text-ink">Manajemen Pengetahuan</h1>
          <p className="text-body-md text-ink-muted mt-1">Kelola Q&amp;A dan dokumen yang dipakai AI untuk auto-reply.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/kb/documents"><Button variant="secondary">Upload Dokumen</Button></Link>
          <Link href="/kb/qa/new"><Button variant="primary"><span className="material-symbols-rounded text-[18px]">add</span> Q&amp;A Baru</Button></Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Q&A Aktif"      value={stats.qaPublished} icon="quiz"        accent="sage" />
        <StatCard label="Dokumen"        value={stats.docs}        icon="description" accent="slate" />
        <StatCard label="Retrieval Acc." value={`${stats.hitRate}%`} icon="target"    accent="clay" />
        <StatCard label="Draft"          value={stats.qaDraft}     icon="edit_note"   accent="amber" />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Left — Q&A list */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
            <h2 className="text-card-title text-ink">Daftar Pertanyaan &amp; Jawaban</h2>
            <Link href="/kb/qa" className="text-body-sm font-semibold text-primary hover:underline">Lihat Semua</Link>
          </div>
          {stats.topQA.length === 0 ? (
            <p className="text-body-md text-ink-dim p-6 text-center">Belum ada Q&amp;A yang terpakai.</p>
          ) : (
            <ul className="divide-y divide-border-soft">
              {stats.topQA.map((qa) => (
                <li key={qa.id}>
                  <Link href={`/kb/qa/${qa.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-alt transition-colors">
                    <span className="text-body-md text-ink truncate flex-1">{qa.question}</span>
                    <span className="pill-info shrink-0">{qa.usage_count}x</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <RAGSimulator />

          <Link href="/kb/gaps" className="card-hover p-4 flex items-center gap-3">
            <span className="size-10 rounded-lg bg-warning-soft text-warning flex items-center justify-center shrink-0">
              <span className="material-symbols-rounded text-[20px]">help_center</span>
            </span>
            <div className="flex-1">
              <p className="text-card-title text-ink">KB Gaps Terkini</p>
              <p className="text-body-sm text-ink-muted">Pertanyaan tanpa jawaban yang cocok.</p>
            </div>
            <span className="material-symbols-rounded text-ink-dim">chevron_right</span>
          </Link>

          {/* Health score — dark card */}
          <div className="rounded-xl bg-ink text-white p-5">
            <p className="eyebrow text-white/40">Skor Kesehatan KB</p>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-headline-lg text-white leading-none">{healthScore}</span>
              <span className="text-body-sm text-white/50 mb-1">/100</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-primary rounded-full" style={{ width: `${healthScore}%` }} />
            </div>
            <p className="text-body-sm text-white/50 mt-2">Berdasarkan hit-rate, cakupan konten, dan rasio draft.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, accent }: {
  label: string; value: number | string; icon: string; accent: "sage" | "clay" | "slate" | "amber"
}) {
  const bg = {
    sage:  "bg-primary-soft text-primary",
    clay:  "bg-accent-soft text-secondary",
    slate: "bg-info-soft text-tertiary",
    amber: "bg-warning-soft text-warning",
  }[accent]
  return (
    <div className="card p-4">
      <span className={`size-9 rounded-lg flex items-center justify-center ${bg}`}>
        <span className="material-symbols-rounded text-[20px]">{icon}</span>
      </span>
      <p className="eyebrow mt-3">{label}</p>
      <p className="text-headline-md text-ink mt-0.5">{value}</p>
    </div>
  )
}
