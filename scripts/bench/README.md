# Sehati CRM — Benchmark Suite

Tiga dimensi benchmark, semua **tanpa dependency baru** (native `fetch` + Playwright yang sudah ada).

| Script | Mengukur | Butuh |
|--------|----------|-------|
| `npm run bench:ai`  | **Akurasi + latency** pipeline AI (keyword/gatekeeper/triage/routing). Percentile p50/p95/p99, akurasi klasifikasi, recall emergency (safety). | `ANTHROPIC_API_KEY` (stage live). Keyword stage gratis & offline. **Tidak** butuh Supabase/Voyage. |
| `npm run bench:api` | **Latency percentiles + throughput (req/s) + error rate** per endpoint HTTP. | Server jalan (`npm run dev`/`start`). Supabase aktif untuk endpoint DB. |
| `npm run bench:web` | **Web vitals** (TTFB/FCP/LCP/load) per halaman, percentiles. | Server jalan + chromium (`npx playwright install chromium`). |

## Quick start

```bash
# 1. Akurasi + kecepatan AI (paling cocok untuk "percentile + accuracy + speed")
npm run bench:ai
npm run bench:ai -- --stages=keyword              # gratis, offline, instan
npm run bench:ai -- --delay=500                   # jeda antar call AI (ms)

# 2. Load test API (server harus hidup)
npm run dev          # terminal lain
npm run bench:api -- --requests=300 --concurrency=30
COOKIE="sb-...=..." npm run bench:api             # uji endpoint ber-auth

# 3. Web vitals (server harus hidup)
npm run bench:web -- --runs=15 --paths=/login,/register
```

## Cara baca hasil

- **Percentile**: `p50` = median, `p95`/`p99` = ekor lambat (yang dirasakan user paling buruk). Selalu lihat p95, bukan rata-rata.
- **Akurasi**: `emergency recall` = metrik utama keselamatan — HARUS 100% (tidak boleh ada keluhan darurat lolos dari keyword filter / triage).
- **Verdict**: ● cepat / ● sedang / ● lambat berdasar threshold p95 per stage.

## Catatan biaya & limit

- `bench:ai` stage live memanggil Anthropic (~$0.01–0.04/run; triage=Sonnet lebih mahal). Tidak memanggil Voyage, jadi bebas limit 3 RPM.
- Untuk angka web/API realistis: `npm run build && npm start` lalu bench (bukan dev server).
- Kalau Supabase di-pause, endpoint/halaman yang query DB akan error/redirect — itu wajar, bench tetap mengukur latency jalur tersebut.

## JSON mode (CI / regression gating)

Tambah flag `--json` ke script manapun → output jadi satu objek JSON (semua log human dibungkam), cocok untuk disimpan & dibandingkan antar-commit.

```bash
npm run bench:ai  -- --json > bench-ai.json
npm run bench:api -- --json > bench-api.json
npm run bench:web -- --json > bench-web.json
```

Contoh gating sederhana (gagal kalau safety end-to-end < 100% atau p95 gatekeeper naik):

```bash
node -e '
  const r = require("./bench-ai.json");
  const safe = r.triage?.safetyEndToEnd?.rate ?? 1;
  const p95  = r.latency?.gatekeeper?.p95 ?? 0;
  if (safe < 1)      { console.error("SAFETY REGRESSION", safe); process.exit(1); }
  if (p95  > 2500)   { console.error("LATENCY REGRESSION", p95);  process.exit(1); }
  console.log("OK");
'
```

Struktur JSON: `bench:ai` → `{ keyword, gatekeeper, triage, routing, latency }` (akurasi sbg `{correct,total,rate}`, latency sbg summary p50/p90/p95/p99/mean/stddev). `bench:api` → `{ endpoints:[{name,okRate,rps,latency,statusCodes}] }`. `bench:web` → `{ pages:[{path,n,ttfb,fcp,lcp,load}] }`.

## Menambah target

- API: edit `TARGETS` di `api-load.ts`.
- Web: pakai `--paths=`.
- Fixtures akurasi AI: edit `fixtures.ts` (tambah pasangan pesan→label).
