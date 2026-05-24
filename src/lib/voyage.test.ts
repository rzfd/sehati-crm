import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock global fetch → tidak ada call Voyage sungguhan. Embedding = fungsi panjang teks.
let fetchCalls = 0
beforeEach(() => {
  fetchCalls = 0
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
    fetchCalls++
    const body = JSON.parse(init.body as string) as { input: string[] }
    return {
      ok: true,
      status: 200,
      json: async () => ({ data: body.input.map((t) => ({ embedding: [t.length, 0.1, 0.2] })) }),
    } as unknown as Response
  }))
})

describe("voyage embedding cache", () => {
  it("embedText: call kedua untuk teks sama tidak memanggil fetch lagi", async () => {
    const { embedText } = await import("./voyage")
    const q = `halo-${Math.random()}`
    await embedText(q, "query")
    expect(fetchCalls).toBe(1)
    await embedText(q, "query")
    expect(fetchCalls).toBe(1) // cache hit
  })

  it("input_type berbeda = cache entry berbeda", async () => {
    const { embedText } = await import("./voyage")
    const q = `beda-${Math.random()}`
    await embedText(q, "query")
    await embedText(q, "document")
    expect(fetchCalls).toBe(2)
  })

  it("embedBatch hanya fetch item yang belum tercache", async () => {
    const { embedText, embedBatch } = await import("./voyage")
    const a = `a-${Math.random()}`, b = `b-${Math.random()}`
    await embedText(a, "document")          // cache a
    fetchCalls = 0
    const res = await embedBatch([a, b], "document")
    expect(fetchCalls).toBe(1)              // hanya b yang di-fetch
    expect(res).toHaveLength(2)
    expect(res[0]).toEqual([a.length, 0.1, 0.2])
  })
})
