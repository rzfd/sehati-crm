import Link from "next/link"
import { cn } from "@/lib/utils"

interface QAItem {
  id:       string
  question: string
  status:   string
  tags?:    string[] | null
}

const STATUS_PILL: Record<string, string> = {
  published: "pill-sukses",
  draft:     "pill-warning",
  archived:  "pill-gray",
}

// Left rail untuk editor Q&A — daftar pertanyaan KB, item aktif disorot.
export function KBQuestionNav({ items, activeId }: { items: QAItem[]; activeId?: string }) {
  return (
    <div className="card overflow-hidden flex flex-col max-h-[calc(100vh-9rem)]">
      <div className="px-3 py-3 border-b border-border-soft flex items-center justify-between">
        <p className="text-card-title text-ink">Knowledge Base</p>
        <Link href="/kb/qa/new" className="text-body-sm font-semibold text-primary hover:underline">+ Baru</Link>
      </div>
      <ul className="overflow-y-auto scrollbar-thin divide-y divide-border-soft">
        {items.length === 0 && (
          <li className="px-3 py-4 text-body-sm text-ink-dim">Belum ada Q&amp;A.</li>
        )}
        {items.map((qa) => {
          const active = qa.id === activeId
          return (
            <li key={qa.id}>
              <Link
                href={`/kb/qa/${qa.id}`}
                className={cn(
                  "block px-3 py-3 transition-colors",
                  active ? "bg-primary-soft" : "hover:bg-surface-alt",
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={STATUS_PILL[qa.status] ?? "pill-gray"}>{qa.status}</span>
                </div>
                <p className={cn("text-body-md line-clamp-2", active ? "text-ink font-semibold" : "text-ink")}>{qa.question}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
