import { describe, it, expect } from "vitest"
import { checkRateLimit, rateLimitKey } from "./rate-limit"

// Tanpa env Upstash → pakai token bucket in-memory.
describe("checkRateLimit — in-memory fallback", () => {
  it("mengizinkan sampai kapasitas lalu memblokir", async () => {
    const key = `test:${Math.random()}`
    const opts = { capacity: 3, refillRate: 0.001 } // refill sangat lambat
    expect((await checkRateLimit(key, opts)).ok).toBe(true)
    expect((await checkRateLimit(key, opts)).ok).toBe(true)
    expect((await checkRateLimit(key, opts)).ok).toBe(true)
    const blocked = await checkRateLimit(key, opts)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it("key berbeda punya bucket terpisah", async () => {
    const o = { capacity: 1, refillRate: 0.001 }
    expect((await checkRateLimit(`a:${Math.random()}`, o)).ok).toBe(true)
    expect((await checkRateLimit(`b:${Math.random()}`, o)).ok).toBe(true)
  })
})

describe("rateLimitKey", () => {
  it("pakai userId kalau ada", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4" } })
    expect(rateLimitKey(req, "u1", "chat")).toBe("chat:user:u1")
  })
  it("fallback ke IP dari x-forwarded-for", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } })
    expect(rateLimitKey(req, null, "chat")).toBe("chat:ip:1.2.3.4")
  })
})
