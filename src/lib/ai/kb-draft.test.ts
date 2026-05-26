import { describe, it, expect, vi, beforeEach } from "vitest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { draftKbAnswer } from "./kb-draft"

function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
beforeEach(() => createMock.mockReset())

describe("draftKbAnswer", () => {
  it("parse draft normal", async () => {
    mockReply({ answer: "Klinik buka 08.00–20.00.", needs_human_info: false, note: "" })
    const r = await draftKbAnswer("jam buka?")
    expect(r.answer).toContain("08.00")
    expect(r.needs_human_info).toBe(false)
  })

  it("flag needs_human_info untuk data spesifik", async () => {
    mockReply({ answer: "Biaya konsul [isi oleh staff: tarif].", needs_human_info: true, note: "isi tarif" })
    const r = await draftKbAnswer("biaya konsul?")
    expect(r.needs_human_info).toBe(true)
    expect(r.note).toBeTruthy()
  })

  it("output tak terparse → fail-safe needs_human_info", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "bukan json" }] })
    expect((await draftKbAnswer("x")).needs_human_info).toBe(true)
  })

  it("error API → fail-safe", async () => {
    createMock.mockRejectedValueOnce(new Error("boom"))
    expect((await draftKbAnswer("x")).needs_human_info).toBe(true)
  })
})
