import { describe, it, expect, vi, beforeEach } from "vitest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { generateInsight, type InsightMetrics } from "./dashboard-insight"

const M: InsightMetrics = {
  total_conversations: 40, ai_handled_pct: 62, urgent_count: 2, open_count: 5,
  hit_rate: 0.7, kb_coverage: 0.5, time_saved_minutes: 120, anomalies: [],
}
function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
beforeEach(() => createMock.mockReset())

describe("generateInsight", () => {
  it("kembalikan teks insight", async () => {
    mockReply({ insight: "AI menangani 62% chat, menghemat 120 menit staff." })
    expect(await generateInsight(M)).toContain("62%")
  })

  it("tak terparse → null", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "bukan json" }] })
    expect(await generateInsight(M)).toBeNull()
  })

  it("error API → null", async () => {
    createMock.mockRejectedValueOnce(new Error("boom"))
    expect(await generateInsight(M)).toBeNull()
  })
})
