import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock client Anthropic; pertahankan helper asli (extractText/safeParseJson/HAIKU).
// vi.hoisted → createMock tersedia di dalam factory vi.mock yang di-hoist.
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock("./anthropic", async (importActual) => {
  const actual = await importActual<typeof import("./anthropic")>()
  return { ...actual, anthropic: { messages: { create: createMock } } }
})

import { runGatekeeper } from "./gatekeeper"

function mockReply(obj: Record<string, unknown>) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify(obj) }] })
}
const req = { message: "x", conversationId: "c", clinicId: "k", patientId: "p" }

beforeEach(() => createMock.mockReset())

describe("runGatekeeper — escalation rules", () => {
  it("medical SELALU escalate (hard safety rule), walau confidence tinggi", async () => {
    mockReply({ category: "medical", confidence: 0.99, reason: "gejala" })
    const r = await runGatekeeper(req)
    expect(r.action).toBe("escalate")
    expect(r.category).toBe("medical")
  })

  it("urgent & complaint juga escalate", async () => {
    mockReply({ category: "urgent", confidence: 0.9, reason: "" })
    expect((await runGatekeeper(req)).action).toBe("escalate")
    mockReply({ category: "complaint", confidence: 0.9, reason: "" })
    expect((await runGatekeeper(req)).action).toBe("escalate")
  })

  it("faq confidence tinggi → auto_reply", async () => {
    mockReply({ category: "faq", confidence: 0.95, reason: "" })
    expect((await runGatekeeper(req)).action).toBe("auto_reply")
  })

  it("faq confidence rendah → escalate (confidence gate)", async () => {
    mockReply({ category: "faq", confidence: 0.4, reason: "" })
    expect((await runGatekeeper(req)).action).toBe("escalate")
  })

  it("booking → booking_request", async () => {
    mockReply({ category: "booking", confidence: 0.95, reason: "" })
    expect((await runGatekeeper(req)).action).toBe("booking_request")
  })

  it("output tak terparse → escalate aman (fail-safe)", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "maaf bukan json" }] })
    const r = await runGatekeeper(req)
    expect(r.action).toBe("escalate")
  })

  it("error API → escalate aman", async () => {
    createMock.mockRejectedValueOnce(new Error("boom"))
    expect((await runGatekeeper(req)).action).toBe("escalate")
  })
})
