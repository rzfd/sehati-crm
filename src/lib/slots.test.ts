import { describe, it, expect } from "vitest"
import { enumerateSlots, toMinutes } from "./slots"

describe("toMinutes", () => {
  it("converts HH:MM[:SS] to minutes from midnight", () => {
    expect(toMinutes("09:30:00")).toBe(570)
    expect(toMinutes("00:00")).toBe(0)
    expect(toMinutes("18:00:00")).toBe(1080)
  })
})

describe("enumerateSlots", () => {
  it("generates slots across a window at the given duration", () => {
    expect(enumerateSlots([{ start_time: "09:00:00", end_time: "10:00:00", slot_duration_minutes: 30 }]))
      .toEqual(["09:00:00", "09:30:00"])
  })

  it("excludes the end boundary", () => {
    expect(enumerateSlots([{ start_time: "09:00:00", end_time: "09:30:00", slot_duration_minutes: 30 }]))
      .toEqual(["09:00:00"])
  })

  it("merges multiple windows in order", () => {
    expect(enumerateSlots([
      { start_time: "09:00:00", end_time: "09:30:00", slot_duration_minutes: 30 },
      { start_time: "13:00:00", end_time: "14:00:00", slot_duration_minutes: 30 },
    ])).toEqual(["09:00:00", "13:00:00", "13:30:00"])
  })

  it("returns empty for no windows", () => {
    expect(enumerateSlots([])).toEqual([])
  })
})
