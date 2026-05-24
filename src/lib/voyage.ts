import crypto from "node:crypto"
import { AI_CONFIG } from "@/lib/constants"

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings"

// Voyage retrieval input_type: stored content = "document", search query = "query".
// PENTING: dokumen tersimpan & query saat retrieve harus konsisten — kalau diubah,
// re-embed semuanya (npm run reembed:kb).
export type VoyageInputType = "query" | "document"

interface VoyageResponse {
  data: { embedding: number[] }[]
}

// ── Embedding cache (in-memory LRU sederhana) ──────────────
// Hemat call Voyage (limit 3 RPM free tier) + latency untuk teks identik.
const CACHE_MAX = 5_000
const cache = new Map<string, number[]>()
function cacheKey(text: string, it?: VoyageInputType): string {
  return `${it ?? "none"}:${crypto.createHash("sha256").update(text).digest("hex")}`
}
function cacheGet(text: string, it?: VoyageInputType): number[] | undefined {
  const k = cacheKey(text, it)
  const v = cache.get(k)
  if (v) { cache.delete(k); cache.set(k, v) } // LRU touch
  return v
}
function cacheSet(text: string, it: VoyageInputType | undefined, vec: number[]): void {
  const k = cacheKey(text, it)
  cache.set(k, vec)
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string)
}

// ── Fetch dengan retry/backoff + timeout ───────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function callVoyage(input: string[], inputType?: VoyageInputType): Promise<number[][]> {
  const MAX_ATTEMPTS = 3
  const TIMEOUT_MS = 15_000
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(VOYAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VOYAGE_API_KEY!}`,
        },
        body: JSON.stringify({ input, model: AI_CONFIG.EMBEDDING_MODEL, ...(inputType ? { input_type: inputType } : {}) }),
        signal: ctrl.signal,
      })
      if (res.status === 429 || res.status >= 500) {
        // Retryable: backoff eksponensial + jitter (limit 3 RPM = perlu sabar)
        if (attempt < MAX_ATTEMPTS) { await sleep(attempt * 1500 + Math.random() * 500); continue }
      }
      if (!res.ok) throw new Error(`Voyage AI error ${res.status}: ${await res.text()}`)
      const data = (await res.json()) as VoyageResponse
      return data.data.map((d) => d.embedding)
    } catch (err) {
      lastErr = err
      if (attempt < MAX_ATTEMPTS) { await sleep(attempt * 1000 + Math.random() * 300); continue }
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Voyage AI request failed")
}

export async function embedText(text: string, inputType?: VoyageInputType): Promise<number[]> {
  const cached = cacheGet(text, inputType)
  if (cached) return cached
  const [vec] = await callVoyage([text], inputType)
  cacheSet(text, inputType, vec)
  return vec
}

export async function embedBatch(texts: string[], inputType?: VoyageInputType): Promise<number[][]> {
  // Pisahkan cache hit vs miss; hanya panggil Voyage untuk yang miss.
  const out: (number[] | undefined)[] = texts.map((t) => cacheGet(t, inputType))
  const missIdx = out.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)
  if (missIdx.length > 0) {
    const vecs = await callVoyage(missIdx.map((i) => texts[i]), inputType)
    missIdx.forEach((idx, k) => {
      out[idx] = vecs[k]
      cacheSet(texts[idx], inputType, vecs[k])
    })
  }
  return out as number[][]
}

// Diekspor untuk test.
export const _embeddingCache = cache
