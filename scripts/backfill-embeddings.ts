/**
 * Backfill embeddings untuk Q&A dan document chunks yang embedding-nya masih NULL.
 * Run: npm run backfill:embeddings
 *
 * Necessary karena seed.ts insert Q&A tanpa embedding column (untuk hindari
 * Voyage call saat seed). Script ini fix data setelah seed.
 *
 * Throttle: 1 request per 1.2 detik (50 RPM) untuk akun Voyage tanpa billing.
 * Kalau Anda sudah upgrade Voyage billing, ganti BATCH_DELAY_MS jadi 0.
 */

import fs from "fs"
import path from "path"

// Load .env.local SEBELUM import lain (ESM hoisting)
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!(key in process.env)) process.env[key] = val
  }
}

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../src/types/database"
import { embedText, embedBatch } from "../src/lib/voyage"

const BATCH_DELAY_MS = 1200  // 50 RPM untuk free tier Voyage. Ganti 0 kalau billing aktif.
const BATCH_SIZE     = 8     // Voyage batch endpoint bisa handle banyak per call.

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function backfillQA() {
  console.log("\n── Q&A pairs ─────────────────────────────")
  const { data, error } = await supabase
    .from("kb_qa_pairs")
    .select("id, question, answer")
    .is("embedding", null)
  if (error) { console.error(error); return 0 }
  if (!data || data.length === 0) {
    console.log("✓ Semua Q&A sudah punya embedding.")
    return 0
  }
  console.log(`Found ${data.length} Q&A tanpa embedding. Embedding…`)

  let ok = 0
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const slice = data.slice(i, i + BATCH_SIZE)
    const texts = slice.map((r) => `Q: ${r.question}\nA: ${r.answer}`)

    try {
      const vectors = await embedBatch(texts, "document")
      for (let j = 0; j < slice.length; j++) {
        const { error: upErr } = await supabase
          .from("kb_qa_pairs")
          .update({ embedding: vectors[j] as unknown as number[] })
          .eq("id", slice[j].id)
        if (upErr) {
          console.error(`  ✗ ${slice[j].id}: ${upErr.message}`)
        } else {
          ok++
          process.stdout.write(`.`)
        }
      }
    } catch (err) {
      console.error(`\n  Batch error (will retry per-item):`, err instanceof Error ? err.message : err)
      // Fallback: per-item dengan delay
      for (const row of slice) {
        try {
          const v = await embedText(`Q: ${row.question}\nA: ${row.answer}`, "document")
          await supabase.from("kb_qa_pairs").update({ embedding: v as unknown as number[] }).eq("id", row.id)
          ok++
          process.stdout.write(`.`)
          await sleep(BATCH_DELAY_MS)
        } catch (e) {
          console.error(`\n  ✗ ${row.id}: ${e instanceof Error ? e.message : e}`)
        }
      }
    }

    if (BATCH_DELAY_MS > 0 && i + BATCH_SIZE < data.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  console.log(`\n✓ ${ok}/${data.length} Q&A embedded.`)
  return ok
}

async function backfillChunks() {
  console.log("\n── Document chunks ───────────────────────")
  const { data, error } = await supabase
    .from("kb_document_chunks")
    .select("id, content")
    .is("embedding", null)
  if (error) { console.error(error); return 0 }
  if (!data || data.length === 0) {
    console.log("✓ Semua chunks sudah punya embedding.")
    return 0
  }
  console.log(`Found ${data.length} chunks tanpa embedding. Embedding…`)

  let ok = 0
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const slice = data.slice(i, i + BATCH_SIZE)
    try {
      const vectors = await embedBatch(slice.map((r) => r.content), "document")
      for (let j = 0; j < slice.length; j++) {
        const { error: upErr } = await supabase
          .from("kb_document_chunks")
          .update({ embedding: vectors[j] as unknown as number[] })
          .eq("id", slice[j].id)
        if (!upErr) { ok++; process.stdout.write(`.`) }
      }
    } catch (err) {
      console.error(`\n  Batch error:`, err instanceof Error ? err.message : err)
    }
    if (BATCH_DELAY_MS > 0 && i + BATCH_SIZE < data.length) await sleep(BATCH_DELAY_MS)
  }
  console.log(`\n✓ ${ok}/${data.length} chunks embedded.`)
  return ok
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Backfill embeddings (Voyage AI)")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`Throttle: ${BATCH_DELAY_MS}ms / batch (size ${BATCH_SIZE})`)

  const qa = await backfillQA()
  const ch = await backfillChunks()

  console.log(`\nTotal: ${qa + ch} row di-embed.`)
  console.log("Selesai. Test ulang chat — AI sekarang harusnya bisa retrieve KB.\n")
}

main().catch((e) => { console.error(e); process.exit(1) })
