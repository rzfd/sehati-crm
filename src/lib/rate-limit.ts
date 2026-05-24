// Rate limiter: pakai Upstash Redis (fixed-window) kalau env tersedia — aman untuk
// multi-instance/serverless. Kalau tidak, fallback ke token-bucket in-memory
// (cukup untuk single-container Docker / dev). API async.

type Bucket = { tokens: number; lastRefill: number }
const buckets = new Map<string, Bucket>()

interface RateLimitOptions {
  capacity:    number   // total request dalam window
  refillRate:  number   // tokens per detik (in-memory) → window ≈ capacity/refillRate detik
}

export interface RateLimitResult {
  ok:        boolean
  remaining: number
  retryAfter?: number   // detik
}

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const useRedis = !!(UPSTASH_URL && UPSTASH_TOKEN)

// ── In-memory token bucket (fallback) ──────────────────────
function inMemory(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  let b = buckets.get(key)
  if (!b) {
    b = { tokens: opts.capacity, lastRefill: now }
    buckets.set(key, b)
  } else {
    const elapsed = (now - b.lastRefill) / 1000
    b.tokens = Math.min(opts.capacity, b.tokens + elapsed * opts.refillRate)
    b.lastRefill = now
  }
  if (b.tokens < 1) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((1 - b.tokens) / opts.refillRate) }
  }
  b.tokens -= 1
  return { ok: true, remaining: Math.floor(b.tokens) }
}

// ── Upstash Redis fixed-window ─────────────────────────────
async function redisCmd(parts: string[]): Promise<number> {
  const url = `${UPSTASH_URL}/${parts.map(encodeURIComponent).join("/")}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const data = (await res.json()) as { result: number }
  return data.result
}

async function redisFixedWindow(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const bucket = `rl:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`
  const count = await redisCmd(["incr", bucket])
  if (count === 1) await redisCmd(["expire", bucket, String(windowSec)])
  if (count > limit) return { ok: false, remaining: 0, retryAfter: windowSec }
  return { ok: true, remaining: limit - count }
}

export async function checkRateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  if (useRedis) {
    try {
      const windowSec = Math.max(1, Math.round(opts.capacity / opts.refillRate))
      return await redisFixedWindow(key, opts.capacity, windowSec)
    } catch {
      // Infra Redis error → jangan blok user; fallback ke in-memory.
      return inMemory(key, opts)
    }
  }
  return inMemory(key, opts)
}

// Helper key: pakai user id atau IP.
export function rateLimitKey(req: Request, userId?: string | null, scope = "default"): string {
  if (userId) return `${scope}:user:${userId}`
  const fwd = req.headers.get("x-forwarded-for")
  const ip = fwd?.split(",")[0]?.trim() ?? "anonymous"
  return `${scope}:ip:${ip}`
}

// Cleanup bucket in-memory stale (>1 jam).
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 60 * 60 * 1000
    for (const [k, v] of buckets) {
      if (v.lastRefill < cutoff) buckets.delete(k)
    }
  }, 10 * 60 * 1000).unref?.()
}
