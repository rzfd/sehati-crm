import { describe, it, expect, vi, beforeEach } from "vitest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { summarizeConversation } from "./conversation-summary"

function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
beforeEach(() => createMock.mockReset())

describe("summarizeConversation", () => {
  it("parse ringkasan + aksi", async () => {
    mockReply({ summary: "Pasien menanyakan jam buka.", next_action: "reply", reason: "info" })
    const r = await summarizeConversation("Pasien: jam buka?")
    expect(r?.summary).toContain("jam buka")
    expect(r?.next_action).toBe("reply")
  })

  it("aksi invalid → default reply", async () => {
    mockReply({ summary: "x", next_action: "ngawur", reason: "" })
    expect((await summarizeConversation("t"))?.next_action).toBe("reply")
  })

  it("tak terparse → null", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "bukan json" }] })
    expect(await summarizeConversation("t")).toBeNull()
  })
})
