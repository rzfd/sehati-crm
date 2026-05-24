/**
 * Benchmark AKURASI + KECEPATAN pipeline AI.
 * Run: npm run bench:ai            (semua stage live, butuh ANTHROPIC_API_KEY)
 *      npm run bench:ai -- --delay=500   (jeda antar call, ms)
 *      npm run bench:ai -- --stages=keyword,gatekeeper   (subset)
 *
 * Stage:
 *  - keyword   : deterministik, GRATIS, offline. Selalu jalan.
 *  - gatekeeper: Haiku. Akurasi kategori + aksi.
 *  - triage    : Sonnet. Akurasi urgency + deteksi emergency (safety-critical).
 *  - routing   : Haiku. Deteksi dokter dari pesan booking.
 *
 * Tidak menyentuh Supabase / Voyage (jadi aman walau DB di-pause & bebas 3RPM).
 * Estimasi biaya: ~$0.01–0.04 per run penuh (Haiku murah, Sonnet sedikit).
 */
import { loadEnv, arg, argNum, sleep } from "./lib/env"
loadEnv()

import { FIXTURES } from "./fixtures"
import { summarize, latencyRow, LATENCY_HEADER, table, section, c, pct, verdict, ms, beginCapture, emitJson, JSON_MODE, ratio } from "./lib/stats"
import { checkKeywordFilter } from "../../src/lib/ai/keyword-filter"
import { runGatekeeper } from "../../src/lib/ai/gatekeeper"
import { runTriage } from "../../src/lib/ai/triage"
import { runRouting } from "../../src/lib/ai/routing"

const STAGES = (arg("stages") ?? "keyword,gatekeeper,triage,routing").split(",").map((s) => s.trim())
const DELAY  = argNum("delay", 250)
const hasKey = !!process.env.ANTHROPIC_API_KEY

interface Timed<T> { value?: T; ok: boolean; ms: number; err?: string }
async function timed<T>(fn: () => Promise<T> | T): Promise<Timed<T>> {
  const t0 = performance.now()
  try {
    const value = await fn()
    return { value, ok: true, ms: performance.now() - t0 }
  } catch (e) {
    return { ok: false, ms: performance.now() - t0, err: e instanceof Error ? e.message : String(e) }
  }
}

function acc(correct: number, total: number) {
  return total === 0 ? "—" : `${pct(correct / total)} (${correct}/${total})`
}

async function main() {
  beginCapture()
  const report: Record<string, unknown> = {
    tool: "bench:ai", timestamp: new Date().toISOString(),
    fixtures: FIXTURES.length, stages: STAGES, hasKey,
  }
  console.log(c.bold("\n🏥  Sehati CRM — AI Pipeline Benchmark (accuracy + latency)"))
  console.log(c.dim(`fixtures: ${FIXTURES.length} · stages: ${STAGES.join(", ")} · delay: ${DELAY}ms · key: ${hasKey ? "ada" : "TIDAK ADA"}`))

  const lat: Record<string, number[]> = {}
  const push = (k: string, x: Timed<unknown>) => { (lat[k] ??= []).push(x.ms) }
  const kwUrgent = new Set<string>()  // fixture id yang tertangkap keyword layer (utk safety end-to-end)

  // ── 1. KEYWORD FILTER (gratis, offline) ──
  if (STAGES.includes("keyword")) {
    section("Layer 1 — Keyword Filter (deterministik, gratis)")
    let correct = 0, emCaught = 0, emTotal = 0
    for (const f of FIXTURES) {
      const r = await timed(() => checkKeywordFilter(f.message))
      push("keyword", r)
      const got = r.value!.kind
      if (got === f.expect.keyword) correct++
      if (got === "urgent") kwUrgent.add(f.id)
      if (f.expect.emergency) { emTotal++; if (got === "urgent") emCaught++ }
    }
    console.log(`  Akurasi kind            : ${acc(correct, FIXTURES.length)}`)
    console.log(`  Emergency recall (L1)   : ${acc(emCaught, emTotal)}  ${c.dim("— paraphrase di luar blocklist sengaja diserahkan ke triage (defense-in-depth)")}`)
    report.keyword = { kindAccuracy: ratio(correct, FIXTURES.length), emergencyRecallL1: ratio(emCaught, emTotal) }
  }

  if (!hasKey) {
    console.log(c.yellow("\n⚠  ANTHROPIC_API_KEY tidak ada — stage live (gatekeeper/triage/routing) dilewati."))
  } else {
    // ── 2. GATEKEEPER (Haiku) ──
    if (STAGES.includes("gatekeeper")) {
      section("Layer 2 — Gatekeeper (Haiku) — klasifikasi kategori & aksi")
      let catOk = 0, catN = 0, actOk = 0, actN = 0, errs = 0
      for (const f of FIXTURES) {
        if (f.expect.keyword === "staff_escape") continue
        const r = await timed(() => runGatekeeper({ message: f.message, conversationId: "bench", clinicId: "bench", patientId: "bench" }))
        push("gatekeeper", r)
        if (!r.ok) { errs++; await sleep(DELAY); continue }
        if (f.expect.category) { catN++; if (r.value!.category === f.expect.category) catOk++ }
        if (f.expect.action)   { actN++; if (r.value!.action === f.expect.action) actOk++ }
        await sleep(DELAY)
      }
      console.log(`  Akurasi kategori : ${acc(catOk, catN)}`)
      console.log(`  Akurasi aksi     : ${acc(actOk, actN)}`)
      if (errs) console.log(c.red(`  errors: ${errs}`))
      report.gatekeeper = { category: ratio(catOk, catN), action: ratio(actOk, actN), errors: errs }
    }

    // ── 3. TRIAGE (Sonnet) — safety-critical ──
    if (STAGES.includes("triage")) {
      section("Layer — Triage (Sonnet) — urgency & deteksi emergency")
      let exact = 0, near = 0, n = 0, errs = 0
      let tp = 0, fp = 0, fn = 0  // confusion untuk is_emergency (triage saja)
      let e2eCaught = 0, e2eTotal = 0  // safety end-to-end: keyword OR triage
      for (const f of FIXTURES) {
        if (f.expect.urgency == null) continue
        const r = await timed(() => runTriage({ message: f.message, conversationId: "bench" }))
        push("triage", r)
        if (!r.ok) { errs++; await sleep(DELAY); continue }
        n++
        const u = r.value!.urgency_level
        if (u === f.expect.urgency) exact++
        if (Math.abs(u - f.expect.urgency) <= 1) near++
        const predEm = r.value!.is_emergency
        const trueEm = !!f.expect.emergency
        if (predEm && trueEm) tp++
        else if (predEm && !trueEm) fp++
        else if (!predEm && trueEm) fn++
        if (trueEm) { e2eTotal++; if (predEm || kwUrgent.has(f.id)) e2eCaught++ }
        await sleep(DELAY)
      }
      const recall = tp + fn === 0 ? NaN : tp / (tp + fn)
      const prec   = tp + fp === 0 ? NaN : tp / (tp + fp)
      console.log(`  Urgency exact      : ${acc(exact, n)}`)
      console.log(`  Urgency ±1 band    : ${acc(near, n)}`)
      console.log(`  Emergency recall (triage): ${pct(recall)}  ${c.dim(`(tp=${tp} fn=${fn})`)}`)
      console.log(`  Emergency precision      : ${pct(prec)}  ${c.dim(`(fp=${fp})`)}`)
      // ── METRIK SAFETY UTAMA: end-to-end (keyword OR triage) ──
      console.log(`  ${c.bold("⚑ Safety end-to-end")}      : ${acc(e2eCaught, e2eTotal)}  ${e2eCaught === e2eTotal ? c.green("✓ semua darurat tertangkap sistem") : c.red("✗ ADA DARURAT LOLOS SEMUA LAYER")}`)
      if (errs) console.log(c.red(`  errors: ${errs}`))
      report.triage = {
        urgencyExact: ratio(exact, n), urgencyWithin1: ratio(near, n),
        emergencyRecall: Number.isFinite(recall) ? recall : null,
        emergencyPrecision: Number.isFinite(prec) ? prec : null,
        safetyEndToEnd: ratio(e2eCaught, e2eTotal), errors: errs,
      }
    }

    // ── 4. ROUTING (Haiku) ──
    if (STAGES.includes("routing")) {
      section("Layer — Routing (Haiku) — deteksi dokter dari pesan")
      let ok = 0, n = 0, errs = 0
      for (const f of FIXTURES) {
        if (!f.expect.routeDoctor) continue
        const r = await timed(() => runRouting(f.message))
        push("routing", r)
        if (!r.ok) { errs++; await sleep(DELAY); continue }
        n++
        const hay = `${r.value!.doctor_mention ?? ""} ${r.value!.recommended_doctor ?? ""}`.toLowerCase()
        if (hay.includes(f.expect.routeDoctor.toLowerCase())) ok++
        await sleep(DELAY)
      }
      console.log(`  Deteksi dokter   : ${acc(ok, n)}`)
      if (errs) console.log(c.red(`  errors: ${errs}`))
      report.routing = { doctorDetection: ratio(ok, n), errors: errs }
    }
  }

  // ── Latency summary ──
  section("Latency per stage (ms)")
  const rows = [LATENCY_HEADER]
  const thresholds: Record<string, [number, number]> = {
    keyword: [1, 5], gatekeeper: [800, 2000], triage: [1500, 4000], routing: [800, 2000],
  }
  const latency: Record<string, ReturnType<typeof summarize>> = {}
  for (const stage of ["keyword", "gatekeeper", "triage", "routing"]) {
    if (!lat[stage]?.length) continue
    const s = summarize(lat[stage])
    latency[stage] = s
    rows.push(latencyRow(stage, s))
  }
  table(rows)
  console.log("")
  for (const stage of ["keyword", "gatekeeper", "triage", "routing"]) {
    if (!lat[stage]?.length) continue
    const s = latency[stage]
    const [g, w] = thresholds[stage] ?? [1000, 3000]
    console.log(`  ${stage.padEnd(11)} p95=${ms(s.p95).padStart(7)}  ${verdict(s.p95, g, w)}`)
  }
  console.log(c.dim("\nCatatan: keyword offline & gratis; gatekeeper/routing=Haiku; triage=Sonnet (lebih lambat & mahal, by design untuk high-stakes).\n"))

  report.latency = latency
  if (JSON_MODE) emitJson(report)
}

main().catch((e) => { console.error(e); process.exit(1) })
