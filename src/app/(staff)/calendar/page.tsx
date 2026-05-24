"use client"

import { useCurrentUser } from "@/hooks/useCurrentUser"
import { BookingCalendar } from "@/components/booking/BookingCalendar"

export default function StaffCalendarPage() {
  const { staff, loading } = useCurrentUser()

  if (loading) return <div className="p-6 text-sm text-ink-muted">Memuat…</div>
  if (!staff) return <div className="p-6 text-sm text-ink-muted">Hanya staff yang bisa akses kalender.</div>

  return <BookingCalendar clinicId={staff.clinic_id} />
}
