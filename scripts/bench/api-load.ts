/**
 * Load test HTTP — latency percentiles + throughput + error rate per endpoint.
 * Run: npm run bench:api
 *      npm run bench:api -- --base=http://localhost:3000 --requests=300 --concurrency=30
 *      COOKIE="sb-...=..." npm run bench:api      (untuk endpoint ber-auth)
 *
 * Native fetch, tanpa dependency. Endpoint ber-auth tanpa COOKIE akan kena
 * 401/redirect — itu tetap mengukur latency routing/SSR (dilaporkan sbg error rate).
 * Butuh server jalan (`npm run dev` atau `npm start`) + Supabase aktif untuk
 * endpoint yang query DB.
 */
import { arg, argNum } from "./lib/env"
import { summarize, table, section, c, ms, verdict, beginCapture, emitJson, JSON_MODE } from "./lib/stats"

const BASE        = arg("base") ?? "http://localhost:3000"
const REQUESTS    = argNum("requests", 200)
const CONCURRENCY = argNum("concurrency", 20)
const WARMUP      = argNum("warmup", 5)
const COOKIE      = process.env.COOKIE

interface Target { name: string; method: string; path: string; body?: unknown }
// Default: halaman publik + 1 API. Tambah sendiri sesuai kebutuhan.
const TARGETS: Target[] = [
  { name: "GET /login",        method: "GET", path: "/login" },
  { name: "GET /register",     method: "GET", path: "/register" },
  { name: "GET /api/whoami",   method: "GET", path: "/api/whoami" },
]

interface Result { ms: number; status: number; ok: boolean }

async function once(t: Target): Promise<Result> {
  const t0 = performance.now()
  try {
    const res = await fetch(BASE + t.path, {
      method: t.method,
      headers: {
        ...(COOKIE ? { cookie: COOKIE } : {}),
        ...(t.body ? { "content-type": "application/json" } : {}),
      },
      body: t.body ? JSON.stringify(t.body) : undefined,
      redirect: "manual",
    })
    await res.arrayBuffer() // konsumsi body penuh utk latency akurat
    const dur = performance.now() - t0
    // 2xx & 3xx dianggap sukses (3xx = redirect auth, wajar)
    return { ms: dur, status: res.status, ok: res.status < 400 }
  } catch (e) {
    if (e instanceof Error && /ECONNREFUSED|fetch failed/.test(e.message)) throw e
    return { ms: performance.now() - t0, status: 0, ok: false }
  }
}

async function runTarget(t: Target): Promise<Result[]> {
  // warmup
  for (let i = 0; i < WARMUP; i++) { try { await once(t) } catch (e) { throw e } }

  const results: Result[] = []
  let dispatched = 0
  const wall0 = performance.now()
  async function worker() {
    while (dispatched < REQUESTS) {
      dispatched++
      results.push(await once(t))
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  const wallMs = performance.now() - wall0
  ;(results as Result[] & { wallMs?: number }).wallMs = wallMs
  return Object.assign(results, { wallMs })
}

async function main() {
  beginCapture()
  console.log(c.bold("\n🌐  Sehati CRM — API Load Test"))
  console.log(c.dim(`base=${BASE} · requests/endpoint=${REQUESTS} · concurrency=${CONCURRENCY} · warmup=${WARMUP} · cookie=${COOKIE ? "ada" : "tidak"}`))

  // Cek server hidup dulu
  try {
    await fetch(BASE + "/login", { redirect: "manual" })
  } catch {
    console.error(c.red(`\n✗ Tidak bisa connect ke ${BASE}. Jalankan server dulu: npm run dev (atau npm start).`))
    process.exit(1)
  }

  const rows = [["Endpoint", "ok%", "req/s", "p50", "p95", "p99", "max"]]
  const verdicts: string[] = []
  const endpoints: Record<string, unknown>[] = []
  for (const t of TARGETS) {
    const res = await runTarget(t)
    const wallMs = (res as Result[] & { wallMs: number }).wallMs
    const lat = summarize(res.map((r) => r.ms))
    const okCount = res.filter((r) => r.ok).length
    const okRate = okCount / res.length
    const rps = (res.length / wallMs) * 1000
    rows.push([
      t.name,
      `${(okRate * 100).toFixed(0)}%`,
      rps.toFixed(0),
      ms(lat.p50), ms(lat.p95), ms(lat.p99), ms(lat.max),
    ])
    // distribusi status
    const codes = res.reduce<Record<number, number>>((a, r) => { a[r.status] = (a[r.status] ?? 0) + 1; return a }, {})
    verdicts.push(`  ${t.name.padEnd(20)} p95=${ms(lat.p95).padStart(7)} ${verdict(lat.p95, 100, 400)}  ${c.dim("status " + JSON.stringify(codes))}`)
    endpoints.push({ name: t.name, okRate, rps, latency: lat, statusCodes: codes })
  }

  section("Hasil per endpoint")
  table(rows)
  section("Verdict (p95)")
  verdicts.forEach((v) => console.log(v))
  console.log(c.dim("\nCatatan: 401/3xx pada endpoint ber-auth itu normal tanpa COOKIE — set COOKIE=... untuk uji jalur ter-autentikasi.\n"))

  if (JSON_MODE) emitJson({
    tool: "bench:api", timestamp: new Date().toISOString(),
    base: BASE, requests: REQUESTS, concurrency: CONCURRENCY, warmup: WARMUP, cookie: !!COOKIE,
    endpoints,
  })
}

main().catch((e) => {
  if (e instanceof Error && /ECONNREFUSED|fetch failed/.test(e.message)) {
    console.error(c.red(`\n✗ Server di ${BASE} tidak merespons. Start dulu: npm run dev.`))
  } else console.error(e)
  process.exit(1)
})
