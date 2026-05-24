import { describe, it, expect } from "vitest"
import { percentile, summarize, ratio } from "./stats"

describe("percentile", () => {
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  it("p50 = median", () => expect(percentile(xs, 50)).toBeCloseTo(5.5))
  it("p0 / p100 = min / max", () => {
    expect(percentile(xs, 0)).toBe(1)
    expect(percentile(xs, 100)).toBe(10)
  })
  it("array kosong → NaN", () => expect(Number.isNaN(percentile([], 95))).toBe(true))
})

describe("summarize", () => {
  it("hitung n/min/max/mean", () => {
    const s = summarize([10, 20, 30])
    expect(s.n).toBe(3)
    expect(s.min).toBe(10)
    expect(s.max).toBe(30)
    expect(s.mean).toBeCloseTo(20)
  })
})

describe("ratio", () => {
  it("rate = correct/total; total 0 → null", () => {
    expect(ratio(3, 4).rate).toBeCloseTo(0.75)
    expect(ratio(0, 0).rate).toBeNull()
  })
})
