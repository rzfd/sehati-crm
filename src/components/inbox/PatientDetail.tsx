"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Props {
  patientId:       string
  conversationId:  string
  clinicId:        string
}

interface PatientInfo {
  id:                 string
  name:               string
  phone:              string | null
  date_of_birth:      string | null
  is_new:             boolean
  tags:               string[]
  primary_doctor_id:  string | null
  primary_doctor?:    { name: string; specialty: string } | null
}

interface RecentBooking {
  id:            string
  booking_date:  string
  booking_time:  string
  status:        string
  doctor:        { name: string; specialty: string } | null
}

export function PatientDetail({ patientId, conversationId, clinicId }: Props) {
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const [bookings, setBookings] = useState<RecentBooking[]>([])
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string }[]>([])
  const [showReroute, setShowReroute] = useState(false)
  const [rerouteTo, setRerouteTo] = useState("")
  const [rerouteNotes, setRerouteNotes] = useState("")
  const [rerouting, setRerouting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      const [pRes, bRes, sRes] = await Promise.all([
        supabase
          .from("patients")
          .select("id, name, phone, date_of_birth, is_new, tags, primary_doctor_id, primary_doctor:doctors(name, specialty)")
          .eq("id", patientId)
          .maybeSingle(),
        supabase
          .from("bookings")
          .select("id, booking_date, booking_time, status, doctor:doctors(name, specialty)")
          .eq("patient_id", patientId)
          .order("booking_date", { ascending: false })
          .limit(5),
        supabase
          .from("staff_members")
          .select("id, name, role")
          .eq("clinic_id", clinicId),
      ])
      if (cancelled) return
      setPatient((pRes.data as unknown as PatientInfo) ?? null)
      setBookings(((bRes.data ?? []) as unknown as RecentBooking[]))
      setStaffList(sRes.data ?? [])
    })()
    return () => { cancelled = true }
  }, [patientId, clinicId])

  async function doReroute() {
    if (!rerouteTo) return
    setRerouting(true)
    try {
      await fetch(`/api/conversations/${conversationId}/reroute`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: rerouteTo, notes: rerouteNotes }),
      })
      setShowReroute(false)
      setRerouteTo("")
      setRerouteNotes("")
    } finally {
      setRerouting(false)
    }
  }

  if (!patient) return <div className="p-4 text-sm text-gray-400">Memuat detail pasien…</div>

  return (
    <div className="h-full overflow-y-auto bg-white border-l border-black/[0.08] scrollbar-thin">
      <div className="p-4 space-y-4">
        <header>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-medium text-gray-700">{patient.name}</h2>
            {patient.is_new && <span className="pill pill-blue">Baru</span>}
          </div>
          {patient.phone && <p className="text-xs text-gray-500">📱 {patient.phone}</p>}
          {patient.date_of_birth && (
            <p className="text-xs text-gray-500">🎂 {format(parseISO(patient.date_of_birth), "d MMM yyyy", { locale: idLocale })}</p>
          )}
        </header>

        {patient.primary_doctor && (
          <section>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Dokter utama</p>
            <p className="text-sm text-gray-700">{patient.primary_doctor.name}</p>
            <p className="text-xs text-gray-500">{patient.primary_doctor.specialty}</p>
          </section>
        )}

        {patient.tags.length > 0 && (
          <section>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Tags</p>
            <div className="flex flex-wrap gap-1">
              {patient.tags.map((t) => <span key={t} className="pill pill-gray">{t}</span>)}
            </div>
          </section>
        )}

        <section>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Riwayat janji</p>
          {bookings.length === 0 ? (
            <p className="text-xs text-gray-400">Belum ada.</p>
          ) : (
            <ul className="space-y-1.5">
              {bookings.map((b) => (
                <li key={b.id} className="text-xs">
                  <p className="text-gray-700">
                    {format(parseISO(b.booking_date), "d MMM", { locale: idLocale })} {b.booking_time.slice(0, 5)}
                    <span className="mx-1.5 text-gray-300">•</span>
                    {b.doctor?.name}
                  </p>
                  <span className={cn("pill mt-0.5", bookingPill(b.status))}>{bookingLabel(b.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pt-2 border-t border-black/[0.06] space-y-2">
          {!showReroute ? (
            <button onClick={() => setShowReroute(true)} className="btn-secondary w-full justify-center">
              Reroute ke staff lain
            </button>
          ) : (
            <div className="space-y-2">
              <select
                value={rerouteTo}
                onChange={(e) => setRerouteTo(e.target.value)}
                className="input"
              >
                <option value="">Pilih staff…</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
              <textarea
                value={rerouteNotes}
                onChange={(e) => setRerouteNotes(e.target.value)}
                placeholder="Catatan reroute (opsional)"
                rows={2}
                className="input resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowReroute(false)} className="btn-secondary flex-1 justify-center">Batal</button>
                <button onClick={doReroute} disabled={!rerouteTo || rerouting} className="btn-primary flex-1 justify-center">
                  {rerouting ? "..." : "Reroute"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function bookingLabel(s: string) {
  return { pending: "Menunggu", confirmed: "Terkonfirmasi", completed: "Selesai", no_show: "Tidak hadir", cancelled: "Dibatalkan" }[s] ?? s
}
function bookingPill(s: string) {
  if (s === "confirmed") return "pill-teal"
  if (s === "pending")   return "pill-amber"
  if (s === "no_show" || s === "cancelled") return "pill-red"
  return "pill-gray"
}
