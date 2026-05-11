import { createClient } from "@/lib/supabase/server"
import { embedText } from "@/lib/voyage"
import { AI_CONFIG } from "@/lib/constants"
import type { KBMatch } from "@/types/ai"

export async function retrieveFromKB(
  query: string,
  clinicId: string
): Promise<KBMatch[]> {
  const supabase = await createClient()
  const embedding = await embedText(query)

  const { data, error } = await supabase.rpc("match_kb", {
    query_embedding:  embedding,
    match_threshold:  AI_CONFIG.KB_SIMILARITY_THRESHOLD,
    match_count:      AI_CONFIG.KB_TOP_K,
    filter_clinic_id: clinicId,
  })

  if (error) {
    console.error("[kb] match_kb error:", error)
    return []
  }

  return (data ?? []).map((row) => ({
    id:          row.id,
    content:     row.content,
    similarity:  row.similarity,
    source_type: row.source_type as "qa_pair" | "document_chunk",
    source_id:   row.source_id,
  }))
}

export function formatKBContext(matches: KBMatch[]): string {
  if (!matches.length) return ""
  return matches
    .map((m, i) => `[${i + 1}] ${m.content}`)
    .join("\n\n")
}
