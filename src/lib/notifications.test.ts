import { describe, it, expect } from "vitest"
import { notificationContent, type NotificationType } from "./notifications"

describe("notificationContent", () => {
  it("staff_reply uses the staff name and links to chat", () => {
    const c = notificationContent("staff_reply", { staffName: "Bu Sari" })
    expect(c.title).toMatch(/balasan/i)
    expect(c.body).toContain("Bu Sari")
    expect(c.link).toBe("/chat")
  })

  it("staff_reply falls back to 'Tim klinik' without a name", () => {
    expect(notificationContent("staff_reply", {}).body).toMatch(/tim klinik/i)
  })

  it("booking_confirmed includes doctor + time and links to history", () => {
    const c = notificationContent("booking_confirmed", {
      doctorName: "Andi", date: "2026-05-28", time: "14:00:00",
    })
    expect(c.title).toMatch(/dikonfirmasi/i)
    expect(c.body).toContain("dr. Andi")
    expect(c.body).toContain("14:00")
    expect(c.link).toBe("/history")
  })

  it("booking_reminder mentions 'besok'", () => {
    const c = notificationContent("booking_reminder", { doctorName: "Budi", time: "09:30:00" })
    expect(c.body).toMatch(/besok/i)
    expect(c.body).toContain("09:30")
  })

  it("every type yields non-empty title/body/link", () => {
    const types: NotificationType[] = [
      "staff_reply", "booking_confirmed", "booking_cancelled", "booking_completed",
      "booking_reminder", "booking_rescheduled", "broadcast",
    ]
    for (const t of types) {
      const c = notificationContent(t)
      expect(c.title.length).toBeGreaterThan(0)
      expect(c.body.length).toBeGreaterThan(0)
      expect(c.link.length).toBeGreaterThan(0)
    }
  })
})
