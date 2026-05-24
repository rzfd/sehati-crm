/**
 * Re-embed SEMUA Q&A + document chunks dengan input_type="document".
 * Run: npm run reembed:kb
 *
 * Wajib dijalankan setelah voyage.ts dipindah ke konvensi input_type
 * (document vs query). Tanpa ini, embedding lama (tanpa input_type) tak konsisten
 * dengan query baru → similarity jeblok.
 *
 * Batch besar dalam sedikit request (hindari limit Voyage 3 RPM); jeda antar-batch
 * kalau lebih dari satu.
 */
import { loadEnv, sleep } from "./bench/lib/env"
loadEnv()

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../src/types/database"
import { embedBatch } from "../src/lib/voyage"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BATCH = 96
const GAP_MS = 21_000 // 3 RPM → ~1 request / 20s; jeda hanya kalau >1 batch

async function reembedQA(): Promise<number> {
  const { data, error } = await supabase.from("kb_qa_pairs").select("id, question, answer")
  if (error) { console.error("✗ fetch qa:", error.message); return 0 }
  if (!data?.length) { console.log("  (qa) tidak ada baris."); return 0 }

  let ok = 0
  const batches = Math.ceil(data.length / BATCH)
  for (let i = 0; i < data.length; i += BATCH) {
    const slice = data.slice(i, i + BATCH)
    const vecs = await embedBatch(slice.map((r) => `Q: ${r.question}\nA: ${r.answer}`), "document")
    for (let j = 0; j < slice.length; j++) {
      const { error: upErr } = await supabase
        .from("kb_qa_pairs")
        .update({ embedding: vecs[j] as unknown as number[] })
        .eq("id", slice[j].id)
      if (upErr) console.error(`  ✗ ${slice[j].id}: ${upErr.message}`)
      else ok++
    }
    if (batches > 1 && i + BATCH < data.length) await sleep(GAP_MS)
  }
  return ok
}

async function reembedChunks(): Promise<number> {
  const { data, error } = await supabase.from("kb_document_chunks").select("id, content")
  if (error) { console.error("✗ fetch chunks:", error.message); return 0 }
  if (!data?.length) { console.log("  (chunks) tidak ada baris."); return 0 }

  let ok = 0
  const batches = Math.ceil(data.length / BATCH)
  for (let i = 0; i < data.length; i += BATCH) {
    const slice = data.slice(i, i + BATCH)
    const vecs = await embedBatch(slice.map((r) => r.content), "document")
    for (let j = 0; j < slice.length; j++) {
      const { error: upErr } = await supabase
        .from("kb_document_chunks")
        .update({ embedding: vecs[j] as unknown as number[] })
        .eq("id", slice[j].id)
      if (upErr) console.error(`  ✗ ${slice[j].id}: ${upErr.message}`)
      else ok++
    }
    if (batches > 1 && i + BATCH < data.length) await sleep(GAP_MS)
  }
  return ok
}

async function main() {
  console.log("\n♻️  Re-embed KB sebagai input_type=document\n")
  const qa = await reembedQA()
  console.log(`  Q&A      : ${qa} di-re-embed`)
  const ch = await reembedChunks()
  console.log(`  chunks   : ${ch} di-re-embed`)
  console.log("\n✅ Selesai. Query retrieve sekarang pakai input_type=query (lihat lib/kb.ts).\n")
}

main().catch((e) => { console.error(e); process.exit(1) })
