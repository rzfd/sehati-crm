import { describe, it, expect } from "vitest"
import { scoreNoShowRisk } from "./no-show-risk"

describe("scoreNoShowRisk", () => {
  it("riwayat no-show tinggi → high", () => {
    expect(scoreNoShowRisk({ pastNoShows: 3, pastTotal: 4, isNew: false, leadDays: 2 }).level).toBe("high")
  })

  it("pasien baru + dijadwalkan jauh hari → medium ke atas", () => {
    const r = scoreNoShowRisk({ pastNoShows: 0, pastTotal: 0, isNew: true, leadDays: 10 })
    expect(["medium", "high"]).toContain(r.level)
  })

  it("riwayat hadir bersih → low", () => {
    expect(scoreNoShowRisk({ pastNoShows: 0, pastTotal: 5, isNew: false, leadDays: 1 }).level).toBe("low")
  })

  it("score di-cap maksimum 1", () => {
    expect(scoreNoShowRisk({ pastNoShows: 10, pastTotal: 10, isNew: true, leadDays: 30 }).score).toBeLessThanOrEqual(1)
  })
})
