/**
 * Sprint 2 — End-to-end pipeline tester.
 * Run: npm run test:pipeline
 *
 * Tidak pakai Jest/Vitest dulu — script ini hit Anthropic + Voyage + Supabase live
 * untuk verifikasi orkestrasi nyata. Cost per run ~ $0.02-0.05 (Haiku + sedikit Sonnet).
 *
 * Requires: ANTHROPIC_API_KEY, VOYAGE_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
 *           SUPABASE_SERVICE_ROLE_KEY di .env.local
 */

import fs from "fs"
import path from "path"

// ── Load .env.local ───────────────────────────────────────
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
import { runChatPipeline } from "../src/lib/ai/pipeline"
import { runTriage } from "../src/lib/ai/triage"
import type { PipelineResult } from "../src/types/ai"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Fixtures ──────────────────────────────────────────────
type Expect = {
  action?:    PipelineResult["action"]
  category?:  PipelineResult["gatekeeper"]["category"]
  decidedAt?: PipelineResult["decidedAt"]
}
type Case = { id: string; group: string; message: string; expect: Expect }

const FAQ_CASES: Case[] = [
  { id: "faq-01", group: "FAQ",     message: "Jam buka klinik kapan?",                        expect: { category: "faq" } },
  { id: "faq-02", group: "FAQ",     message: "Berapa biaya konsultasi dokter umum?",          expect: { category: "faq" } },
  { id: "faq-03", group: "FAQ",     message: "Apakah klinik menerima BPJS?",                  expect: { category: "faq" } },
  { id: "faq-04", group: "FAQ",     message: "Lokasi klinik di mana ya?",                     expect: { category: "faq" } },
  { id: "faq-05", group: "FAQ",     message: "Ada dokter spesialis kandungan tidak?",         expect: { category: "faq" } },
  { id: "faq-06", group: "FAQ",     message: "Bisa bayar pakai kartu kredit?",                expect: { category: "faq" } },
]

const BOOKING_CASES: Case[] = [
  { id: "bk-01",  group: "Booking", message: "Saya mau booking ke dokter umum besok pagi",    expect: { category: "booking", action: "booking_request" } },
  { id: "bk-02",  group: "Booking", message: "Bisa atur jadwal kontrol minggu depan?",        expect: { category: "booking", action: "booking_request" } },
  { id: "bk-03",  group: "Booking", message: "Reschedule appointment saya ke hari Jumat",     expect: { category: "booking", action: "booking_request" } },
]

const MEDICAL_CASES: Case[] = [
  { id: "med-01", group: "Medical", message: "Demam 3 hari belum turun, badan lemas",         expect: { category: "medical", action: "escalate" } },
  { id: "med-02", group: "Medical", message: "Anak saya batuk pilek sudah 5 hari",            expect: { category: "medical", action: "escalate" } },
  { id: "med-03", group: "Medical", message: "Sakit perut sebelah kanan bawah",               expect: { category: "medical", action: "escalate" } },
]

// Layer 1 urgent keyword hits — harus instan, tidak panggil gatekeeper
const URGENT_KW_CASES: Case[] = [
  { id: "urg-01", group: "Urgent",  message: "Dada sakit sekali",                             expect: { action: "escalate", decidedAt: "keyword" } },
  { id: "urg-02", group: "Urgent",  message: "Suami saya tidak bisa nafas",                   expect: { action: "escalate", decidedAt: "keyword" } },
  { id: "urg-03", group: "Urgent",  message: "Ibu saya pingsan barusan!",                     expect: { action: "escalate", decidedAt: "keyword" } },
  { id: "urg-04", group: "Urgent",  message: "Anak saya kejang sudah 5 menit",                expect: { action: "escalate", decidedAt: "keyword" } },
  { id: "urg-05", group: "Urgent",  message: "Saya muntah darah",                             expect: { action: "escalate", decidedAt: "keyword" } },
]

const COMPLAINT_CASES: Case[] = [
  { id: "cmp-01", group: "Complaint", message: "Pelayanan tadi sangat lambat dan tidak ramah", expect: { category: "complaint", action: "escalate" } },
]

const UNCLEAR_CASES: Case[] = [
  { id: "unc-01", group: "Unclear", message: "staff",                                          expect: { action: "escalate", decidedAt: "keyword" } },
  { id: "unc-02", group: "Unclear", message: "asdf qwerty",                                    expect: { action: "escalate" } },
]

const ALL_CASES = [
  ...FAQ_CASES,
  ...BOOKING_CASES,
  ...MEDICAL_CASES,
  ...URGENT_KW_CASES,
  ...COMPLAINT_CASES,
  ...UNCLEAR_CASES,
]

// Triage-only stress test (Sonnet)
const TRIAGE_CASES = [
  { id: "tri-01", message: "Dada sakit sekali, sesak nafas, keringat dingin",                  expectMin: 3 },
  { id: "tri-02", message: "Demam ringan anak, masih mau makan dan main",                      expectMax: 2 },
  { id: "tri-03", message: "Pendarahan hebat setelah melahirkan, lemas",                       expectMin: 4 },
  { id: "tri-04", message: "Sakit kepala ringan sejak pagi, sudah minum obat",                 expectMax: 2 },
]

// ── Runner ────────────────────────────────────────────────
async function getClinicId(): Promise<string> {
  const { data, error } = await supabase.from("clinics").select("id").limit(1).single()
  if (error || !data) throw new Error("Tidak ada clinic di DB. Jalankan: npm run seed")
  return data.id
}

function matchExpectation(result: PipelineResult, expect: Expect): { ok: boolean; diff: string[] } {
  const diff: string[] = []
  if (expect.action && result.action !== expect.action) {
    diff.push(`action expected=${expect.action} got=${result.action}`)
  }
  if (expect.category && result.gatekeeper.category !== expect.category) {
    diff.push(`category expected=${expect.category} got=${result.gatekeeper.category}`)
  }
  if (expect.decidedAt && result.decidedAt !== expect.decidedAt) {
    diff.push(`decidedAt expected=${expect.decidedAt} got=${result.decidedAt}`)
  }
  return { ok: diff.length === 0, diff }
}

async function runOne(c: Case, clinicId: string) {
  const start = Date.now()
  const result = await runChatPipeline({ message: c.message, clinicId }, { supabase })
  const ms = Date.now() - start
  const { ok, diff } = matchExpectation(result, c.expect)
  const icon = ok ? "PASS" : "FAIL"
  console.log(
    `[${icon}] ${c.id.padEnd(7)} ${c.group.padEnd(9)} (${String(ms).padStart(5)}ms) action=${result.action.padEnd(15)} cat=${result.gatekeeper.category.padEnd(9)} conf=${result.confidence.toFixed(2)} at=${result.decidedAt}`,
  )
  if (!ok) {
    console.log(`         ↳ msg: "${c.message}"`)
    for (const d of diff) console.log(`         ↳ ${d}`)
    console.log(`         ↳ reason: ${result.reason}`)
  }
  return { ok, ms }
}

async function runTriageOne(c: { id: string; message: string; expectMin?: number; expectMax?: number }) {
  const start = Date.now()
  const t = await runTriage({ message: c.message, conversationId: "test" })
  const ms = Date.now() - start
  let ok = true
  if (c.expectMin && t.urgency_level < c.expectMin) ok = false
  if (c.expectMax && t.urgency_level > c.expectMax) ok = false
  const icon = ok ? "PASS" : "FAIL"
  console.log(
    `[${icon}] ${c.id.padEnd(7)} TRIAGE    (${String(ms).padStart(5)}ms) level=${t.urgency_level} emerg=${t.is_emergency} evidence=${t.evidence.length}`,
  )
  if (!ok) {
    console.log(`         ↳ msg: "${c.message}"`)
    console.log(`         ↳ expected min=${c.expectMin ?? "-"} max=${c.expectMax ?? "-"} got=${t.urgency_level}`)
    console.log(`         ↳ reason: ${t.reason}`)
  }
  return { ok, ms }
}

async function main() {
  console.log("─── Sprint 2 pipeline test ───────────────────────")
  const clinicId = await getClinicId()
  console.log(`clinic_id: ${clinicId}\n`)

  let pass = 0
  let fail = 0
  let totalMs = 0

  console.log("── Gatekeeper + routing scenarios ──")
  for (const c of ALL_CASES) {
    const { ok, ms } = await runOne(c, clinicId)
    if (ok) pass++; else fail++
    totalMs += ms
  }

  console.log("\n── Triage stress (Sonnet) ──")
  for (const c of TRIAGE_CASES) {
    const { ok, ms } = await runTriageOne(c)
    if (ok) pass++; else fail++
    totalMs += ms
  }

  console.log("\n─── Summary ───────────────────────────────────────")
  console.log(`Total: ${pass + fail}   Pass: ${pass}   Fail: ${fail}   Time: ${(totalMs / 1000).toFixed(1)}s`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
