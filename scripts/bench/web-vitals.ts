/**
 * Web vitals per halaman — TTFB / FCP / LCP / DOMContentLoaded / load.
 * Run: npm run bench:web
 *      npm run bench:web -- --runs=15 --paths=/login,/register
 *      npm run bench:web -- --base=http://localhost:3000
 *
 * Pakai Playwright (sudah devDependency). Butuh chromium terpasang:
 *   npx playwright install chromium
 * Butuh server jalan. Default uji halaman tanpa-auth (login/register/dst) karena
 * halaman ber-auth redirect ke /login saat Supabase tak aktif. Override via --paths.
 */
import { arg, argNum } from "./lib/env"
import { summarize, table, section, c, ms, verdict, beginCapture, emitJson, JSON_MODE } from "./lib/stats"

const BASE  = arg("base") ?? "http://localhost:3000"
const RUNS  = argNum("runs", 10)
const PATHS = (arg("paths") ?? "/login,/register,/forgot-password,/reset-password")
  .split(",").map((p) => p.trim()).filter(Boolean)

interface Vitals { ttfb: number; fcp: number; lcp: number; dcl: number; load: number }

async function main() {
  beginCapture()
  let chromium: (typeof import("@playwright/test"))["chromium"]
  try {
    ;({ chromium } = await import("@playwright/test"))
  } catch {
    console.error(c.red("✗ Playwright tidak tersedia. Install: npm i -D @playwright/test && npx playwright install chromium"))
    process.exit(1)
  }

  console.log(c.bold("\n📊  Sehati CRM — Web Vitals"))
  console.log(c.dim(`base=${BASE} · runs/page=${RUNS} · paths=${PATHS.join(", ")}`))

  let browser
  try {
    browser = await chromium.launch()
  } catch (e) {
    console.error(c.red("✗ Gagal launch chromium. Jalankan: npx playwright install chromium"))
    console.error(c.dim(e instanceof Error ? e.message : String(e)))
    process.exit(1)
  }

  // cek server
  try {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await p.goto(BASE + PATHS[0], { waitUntil: "domcontentloaded", timeout: 8000 })
    await ctx.close()
  } catch {
    console.error(c.red(`\n✗ Server di ${BASE} tidak merespons. Start dulu: npm run dev.`))
    await browser.close()
    process.exit(1)
  }

  const collected: Record<string, Vitals[]> = {}

  for (const path of PATHS) {
    collected[path] = []
    for (let i = 0; i < RUNS; i++) {
      const ctx = await browser.newContext()        // context baru = cache bersih (cold)
      const page = await ctx.newPage()
      try {
        await page.goto(BASE + path, { waitUntil: "load", timeout: 15000 })
        // beri waktu LCP settle
        await page.waitForTimeout(250)
        const v = await page.evaluate<Vitals>(() => {
          const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
          const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0] as PerformanceEntry | undefined
          const lcpList = performance.getEntriesByType("largest-contentful-paint") as PerformanceEntry[]
          const lcp = lcpList.length ? lcpList[lcpList.length - 1].startTime : 0
          return {
            ttfb: nav ? nav.responseStart : 0,
            fcp:  fcpEntry ? fcpEntry.startTime : 0,
            lcp,
            dcl:  nav ? nav.domContentLoadedEventEnd : 0,
            load: nav ? nav.loadEventEnd : 0,
          }
        })
        collected[path].push(v)
      } catch {
        // skip run gagal
      } finally {
        await ctx.close()
      }
    }
  }
  await browser.close()

  section("Web vitals per halaman (median p50 / p95)")
  const rows = [["Halaman", "n", "TTFB p50/p95", "FCP p50/p95", "LCP p50/p95", "Load p50/p95"]]
  const verdicts: string[] = []
  const pages: Record<string, unknown>[] = []
  for (const path of PATHS) {
    const vs = collected[path]
    if (!vs.length) { rows.push([path, "0", "—", "—", "—", "—"]); pages.push({ path, n: 0 }); continue }
    const col = (key: keyof Vitals) => summarize(vs.map((v) => v[key]))
    const ttfb = col("ttfb"), fcp = col("fcp"), lcp = col("lcp"), load = col("load")
    const pair = (s: ReturnType<typeof summarize>) => `${ms(s.p50)}/${ms(s.p95)}`
    rows.push([path, String(vs.length), pair(ttfb), pair(fcp), pair(lcp), pair(load)])
    // verdict pakai LCP (Core Web Vitals: <2.5s good, <4s perlu perbaikan)
    verdicts.push(`  ${path.padEnd(20)} LCP p95=${ms(lcp.p95).padStart(8)}  ${verdict(lcp.p95, 2500, 4000)}`)
    pages.push({ path, n: vs.length, ttfb, fcp, lcp, load })
  }
  table(rows)
  section("Verdict (LCP — Core Web Vitals)")
  verdicts.forEach((v) => console.log(v))
  console.log(c.dim("\nCatatan: angka paling realistis dari production build (`npm run build && npm start`); dev server jauh lebih lambat krn kompilasi on-demand.\n"))

  if (JSON_MODE) emitJson({
    tool: "bench:web", timestamp: new Date().toISOString(),
    base: BASE, runs: RUNS, paths: PATHS, pages,
  })
}

main().catch((e) => { console.error(e); process.exit(1) })
