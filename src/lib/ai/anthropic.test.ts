import { describe, it, expect } from "vitest"
import { stripJsonFences, safeParseJson } from "./anthropic"

// Regresi untuk bug routing.ts: model membungkus JSON dalam ```json … ``` →
// JSON.parse mentah meledak. Helper ini harus tahan terhadap fence & prosa.
describe("stripJsonFences / safeParseJson", () => {
  it("strip ```json fence", () => {
    const raw = '```json\n{"doctor_mention":"Sarah"}\n```'
    expect(safeParseJson<{ doctor_mention: string }>(raw)?.doctor_mention).toBe("Sarah")
  })

  it("strip ``` fence tanpa label", () => {
    expect(safeParseJson<{ a: number }>("```\n{\"a\":1}\n```")?.a).toBe(1)
  })

  it("ekstrak objek JSON dari prosa di sekelilingnya", () => {
    const raw = 'Berikut hasilnya: {"category":"faq","confidence":0.9} semoga membantu.'
    expect(safeParseJson<{ category: string }>(raw)?.category).toBe("faq")
  })

  it("JSON polos tetap kebaca", () => {
    expect(safeParseJson<{ ok: boolean }>('{"ok":true}')?.ok).toBe(true)
  })

  it("output tak valid → null (tidak throw)", () => {
    expect(safeParseJson("maaf saya tidak bisa")).toBeNull()
  })

  it("stripJsonFences mengembalikan inti objek", () => {
    expect(stripJsonFences('```json {"x":1} ```')).toBe('{"x":1}')
  })
})
