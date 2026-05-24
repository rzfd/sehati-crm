"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusPill } from "@/components/shared/StatusPill"
import { EmptyState } from "@/components/shared/EmptyState"
import { cn } from "@/lib/utils"
import type { KBQAPair } from "@/types/database"

type StatusFilter = "all" | "published" | "draft" | "archived"

interface QAListProps {
  items: KBQAPair[]
}

export function QAList({ items }: QAListProps) {
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [query, setQuery]   = useState("")

  const filtered = useMemo(() => {
    return items.filter((qa) => {
      if (filter !== "all" && qa.status !== filter) return false
      if (!query) return true
      const q = query.toLowerCase()
      return qa.question.toLowerCase().includes(q) || qa.answer.toLowerCase().includes(q)
    })
  }, [items, filter, query])

  const counts = useMemo(
    () => ({
      all:       items.length,
      published: items.filter((q) => q.status === "published").length,
      draft:     items.filter((q) => q.status === "draft").length,
      archived:  items.filter((q) => q.status === "archived").length,
    }),
    [items]
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          type="search"
          placeholder="Cari pertanyaan atau jawaban..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-1 ml-auto">
          <FilterTab active={filter === "all"}       count={counts.all}       onClick={() => setFilter("all")}>Semua</FilterTab>
          <FilterTab active={filter === "published"} count={counts.published} onClick={() => setFilter("published")}>Published</FilterTab>
          <FilterTab active={filter === "draft"}     count={counts.draft}     onClick={() => setFilter("draft")}>Draft</FilterTab>
          <FilterTab active={filter === "archived"}  count={counts.archived}  onClick={() => setFilter("archived")}>Arsip</FilterTab>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Belum ada Q&A"
            description={query ? "Tidak ada hasil untuk pencarian Anda." : "Buat Q&A pertama untuk knowledge base Anda."}
            action={
              !query && (
                <Link href="/kb/qa/new">
                  <Button variant="purple">+ Q&A Baru</Button>
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted">Pertanyaan</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted w-32">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted w-24">Usage</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-muted w-40">Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {filtered.map((qa) => (
                <tr key={qa.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/kb/qa/${qa.id}`} className="text-ink hover:text-secondary line-clamp-1">
                      {qa.question}
                    </Link>
                    <p className="text-xs text-ink-dim line-clamp-1 mt-0.5">{qa.answer}</p>
                  </td>
                  <td className="px-4 py-3"><StatusPill type="kb" status={qa.status} /></td>
                  <td className="px-4 py-3 text-ink-muted">{qa.usage_count}x</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {qa.tags.slice(0, 2).map((t) => (
                        <span key={t} className="pill pill-gray text-[10px]">{t}</span>
                      ))}
                      {qa.tags.length > 2 && <span className="text-xs text-ink-dim">+{qa.tags.length - 2}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilterTab({
  active,
  count,
  onClick,
  children,
}: {
  active:   boolean
  count:    number
  onClick:  () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-accent-soft text-secondary" : "text-ink-muted hover:bg-surface-alt"
      )}
    >
      {children} <span className="text-ink-dim">({count})</span>
    </button>
  )
}
