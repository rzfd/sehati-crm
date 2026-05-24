// Statistik & helper tabel untuk benchmark suite.
// Tidak ada dependency eksternal — semua native.

export interface Summary {
  n:      number
  min:    number
  p50:    number
  p90:    number
  p95:    number
  p99:    number
  max:    number
  mean:   number
  stddev: number
}

/** Persentil linear-interpolated. `sorted` harus ascending. p dalam 0..100. */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN
  if (sorted.length === 1) return sorted[0]
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export function summarize(values: number[]): Summary {
  const xs = [...values].sort((a, b) => a - b)
  const n = xs.length
  if (n === 0) return { n: 0, min: NaN, p50: NaN, p90: NaN, p95: NaN, p99: NaN, max: NaN, mean: NaN, stddev: NaN }
  const sum = xs.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / n
  return {
    n,
    min:    xs[0],
    p50:    percentile(xs, 50),
    p90:    percentile(xs, 90),
    p95:    percentile(xs, 95),
    p99:    percentile(xs, 99),
    max:    xs[n - 1],
    mean,
    stddev: Math.sqrt(variance),
  }
}

export const ms = (n: number) => (Number.isFinite(n) ? `${n.toFixed(0)}ms` : "—")
export const pct = (n: number) => (Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "—")

// ── JSON output mode (untuk CI / diffing / regression gating) ──
// Aktif via flag `--json`. Saat aktif, semua output human (console.log) dibungkam
// dan hanya satu objek JSON yang dicetak di akhir lewat emitJson().
export const JSON_MODE = process.argv.includes("--json")
let _origLog: typeof console.log | null = null
export function beginCapture(): void {
  if (JSON_MODE && !_origLog) {
    _origLog = console.log
    console.log = () => {}
  }
}
export function emitJson(obj: unknown): void {
  if (_origLog) { console.log = _origLog; _origLog = null }
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n")
}
/** {correct,total,rate} — bentuk metrik akurasi yang konsisten utk JSON. */
export const ratio = (correct: number, total: number) => ({
  correct, total, rate: total === 0 ? null : correct / total,
})

// ── Pewarnaan ANSI (mati otomatis kalau bukan TTY / NO_COLOR) ──
const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const wrap = (code: string) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s)
export const c = {
  bold:  wrap("1"),
  dim:   wrap("2"),
  green: wrap("32"),
  yellow:wrap("33"),
  red:   wrap("31"),
  cyan:  wrap("36"),
}

/** Cetak tabel rata kolom. rows[0] dianggap header. */
export function table(rows: (string | number)[][]): void {
  const str = rows.map((r) => r.map((x) => String(x)))
  const widths = str[0].map((_, col) => Math.max(...str.map((r) => r[col].length)))
  str.forEach((r, i) => {
    const line = r.map((cell, col) => cell.padEnd(widths[col])).join("  ")
    if (i === 0) console.log(c.bold(line))
    else console.log(line)
  })
}

/** Baris latency dari Summary untuk dipakai di tabel. */
export function latencyRow(label: string, s: Summary): string[] {
  return [label, String(s.n), ms(s.p50), ms(s.p95), ms(s.p99), ms(s.mean), ms(s.max)]
}
export const LATENCY_HEADER = ["Stage / Endpoint", "n", "p50", "p95", "p99", "mean", "max"]

export function section(title: string): void {
  console.log("\n" + c.bold(c.cyan("━━ " + title + " ━━")))
}

/** Verdict warna berdasar threshold p95 (ms). */
export function verdict(p95: number, good: number, warn: number): string {
  if (!Number.isFinite(p95)) return c.dim("n/a")
  if (p95 <= good) return c.green("● cepat")
  if (p95 <= warn) return c.yellow("● sedang")
  return c.red("● lambat")
}
