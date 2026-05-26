import { describe, it, expect, vi, beforeEach } from "vitest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { classifyAnalyticsQuestion } from "./analytics-intent"

function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
beforeEach(() => createMock.mockReset())

describe("classifyAnalyticsQuestion", () => {
  it("map ke intent + periode valid", async () => {
    mockReply({ intent: "new_patients", period: "30d" })
    const r = await classifyAnalyticsQuestion("berapa pasien baru bulan ini")
    expect(r.intent).toBe("new_patients")
    expect(r.period).toBe("30d")
  })

  it("intent/periode invalid → unknown + 30d", async () => {
    mockReply({ intent: "harga_saham", period: "ngawur" })
    const r = await classifyAnalyticsQuestion("?")
    expect(r.intent).toBe("unknown")
    expect(r.period).toBe("30d")
  })

  it("error API → unknown", async () => {
    createMock.mockRejectedValueOnce(new Error("boom"))
    expect((await classifyAnalyticsQuestion("?")).intent).toBe("unknown")
  })
})
