import { describe, it, expect, vi, beforeEach } from "vitest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { composeBroadcast } from "./broadcast-compose"

function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
beforeEach(() => createMock.mockReset())

describe("composeBroadcast", () => {
  it("parse judul + isi", async () => {
    mockReply({ title: "Promo Vaksin Flu", body: "Diskon 20% sampai akhir bulan. Booking sekarang!" })
    const r = await composeBroadcast("promo vaksin flu lansia diskon 20%")
    expect(r.title).toContain("Vaksin")
    expect(r.body).toContain("20%")
  })

  it("output tak terparse → kosong (fail-safe)", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "bukan json" }] })
    const r = await composeBroadcast("x")
    expect(r.title).toBe("")
    expect(r.body).toBe("")
  })

  it("error API → kosong", async () => {
    createMock.mockRejectedValueOnce(new Error("boom"))
    const r = await composeBroadcast("x")
    expect(r.title).toBe("")
  })
})
