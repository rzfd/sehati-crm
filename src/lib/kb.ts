import { createClient as createServerClient } from "@/lib/supabase/server"
import { embedText } from "@/lib/voyage"
import { AI_CONFIG } from "@/lib/constants"
import type { KBMatch } from "@/types/ai"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Accept an optional client supaya bisa dipakai dari context Next request (default)
// MAUPUN dari script CLI yang inject service-role client.
export async function retrieveFromKB(
  query: string,
  clinicId: string,
  supabase?: SupabaseClient<Database>,
): Promise<KBMatch[]> {
  const sb = supabase ?? (await createServerClient())
  const embedding = await embedText(query)

  const { data, error } = await sb.rpc("match_kb", {
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
