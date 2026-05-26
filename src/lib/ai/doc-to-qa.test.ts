import { describe, it, expect, vi, beforeEach } from "vitest"

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { extractQAFromText } from "./doc-to-qa"

function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
beforeEach(() => createMock.mockReset())

describe("extractQAFromText", () => {
  it("parse pairs valid + buang yang kosong", async () => {
    mockReply({ pairs: [
      { question: "Jam buka?", answer: "08.00–20.00" },
      { question: "", answer: "x" },
      { question: "Terima BPJS?", answer: "Ya" },
    ] })
    const r = await extractQAFromText("dokumen")
    expect(r).toHaveLength(2)
    expect(r[0].question).toBe("Jam buka?")
  })

  it("tak terparse → []", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "bukan json" }] })
    expect(await extractQAFromText("x")).toEqual([])
  })

  it("error API → []", async () => {
    createMock.mockRejectedValueOnce(new Error("boom"))
    expect(await extractQAFromText("x")).toEqual([])
  })
})
