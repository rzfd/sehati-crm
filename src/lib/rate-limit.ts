// Token bucket rate limiter in-memory, scoped per process.
// Cocok untuk single-instance deployment (mis. Vercel function serverless dengan
// concurrency lokal). Untuk multi-instance pakai Upstash Redis.

type Bucket = { tokens: number; lastRefill: number }
const buckets = new Map<string, Bucket>()

interface RateLimitOptions {
  capacity:    number   // total tokens dalam bucket
  refillRate:  number   // tokens per detik
}

export interface RateLimitResult {
  ok:        boolean
  remaining: number
  retryAfter?: number   // detik
}

export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
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
    const retryAfter = Math.ceil((1 - b.tokens) / opts.refillRate)
    return { ok: false, remaining: 0, retryAfter }
  }
  b.tokens -= 1
  return { ok: true, remaining: Math.floor(b.tokens) }
}

// Helper untuk pakai dari Next.js API route. Pakai user id atau IP sebagai key.
export function rateLimitKey(req: Request, userId?: string | null, scope = "default"): string {
  if (userId) return `${scope}:user:${userId}`
  const fwd = req.headers.get("x-forwarded-for")
  const ip = fwd?.split(",")[0]?.trim() ?? "anonymous"
  return `${scope}:ip:${ip}`
}

// Periodic cleanup bucket lama (>1 jam stale) untuk avoid memory leak.
// Run on import — server boot.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 60 * 60 * 1000
    for (const [k, v] of buckets) {
      if (v.lastRefill < cutoff) buckets.delete(k)
    }
  }, 10 * 60 * 1000).unref?.()
}
