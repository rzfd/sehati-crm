"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/shared/Avatar"

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

  if (!patient) return <div className="p-4 text-body-md text-ink-dim">Memuat detail pasien…</div>

  return (
    <div className="h-full overflow-y-auto bg-surface scrollbar-thin">
      <div className="p-4 space-y-5">
        <header className="flex flex-col items-center text-center pb-4 border-b border-border-soft">
          <Avatar name={patient.name} size="xl" status="online" />
          <div className="flex items-center gap-2 mt-2">
            <h2 className="text-headline-sm text-ink">{patient.name}</h2>
            {patient.is_new && <span className="pill-info">Baru</span>}
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-body-sm text-ink-muted">
            {patient.phone && (
              <span className="flex items-center gap-1"><span className="material-symbols-rounded text-[14px]">call</span>{patient.phone}</span>
            )}
            {patient.date_of_birth && (
              <span className="flex items-center gap-1"><span className="material-symbols-rounded text-[14px]">cake</span>{format(parseISO(patient.date_of_birth), "d MMM yyyy", { locale: idLocale })}</span>
            )}
          </div>
        </header>

        {patient.primary_doctor && (
          <section>
            <p className="eyebrow mb-1.5">Dokter Utama</p>
            <div className="card p-3">
              <p className="text-card-title text-ink">{patient.primary_doctor.name}</p>
              <p className="text-body-sm text-ink-muted">{patient.primary_doctor.specialty}</p>
            </div>
          </section>
        )}

        {patient.tags.length > 0 && (
          <section>
            <p className="eyebrow mb-1.5">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {patient.tags.map((t) => <span key={t} className="pill-gray">{t}</span>)}
            </div>
          </section>
        )}

        <section>
          <p className="eyebrow mb-1.5">Riwayat Janji</p>
          {bookings.length === 0 ? (
            <p className="text-body-sm text-ink-dim">Belum ada.</p>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b.id} className="card p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-body-md text-ink">
                      {format(parseISO(b.booking_date), "d MMM", { locale: idLocale })} · {b.booking_time.slice(0, 5)}
                    </p>
                    <p className="text-body-sm text-ink-muted truncate">{b.doctor?.name}</p>
                  </div>
                  <span className={`${bookingPill(b.status)} shrink-0`}>{bookingLabel(b.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pt-2 border-t border-border-soft space-y-2">
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
  if (s === "confirmed") return "pill-sukses"
  if (s === "pending")   return "pill-warning"
  if (s === "no_show" || s === "cancelled") return "pill-danger"
  return "pill-gray"
}
