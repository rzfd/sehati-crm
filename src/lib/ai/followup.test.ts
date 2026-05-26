import { describe, it, expect, vi, beforeEach } from "vitest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { draftFollowUp } from "./followup"

function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
beforeEach(() => createMock.mockReset())

describe("draftFollowUp", () => {
  it("kembalikan pesan follow-up", async () => {
    mockReply({ message: "Terima kasih sudah berkunjung. Semoga sehat selalu!" })
    const r = await draftFollowUp({ doctorName: "Andi", specialty: "Umum" })
    expect(r).toContain("Terima kasih")
  })

  it("tak terparse → null", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "bukan json" }] })
    expect(await draftFollowUp({})).toBeNull()
  })

  it("error API → null", async () => {
    createMock.mockRejectedValueOnce(new Error("boom"))
    expect(await draftFollowUp({})).toBeNull()
  })
})
