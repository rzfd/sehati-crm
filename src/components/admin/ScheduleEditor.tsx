"use client"

import { useEffect, useState } from "react"

interface Schedule {
  id:                    string
  doctor_id:             string
  day_of_week:           number
  start_time:            string
  end_time:              string
  slot_duration_minutes: number
  max_patients:          number
}

interface Exception {
  id:         string
  date:       string
  kind:       "full_day" | "partial"
  start_time: string | null
  end_time:   string | null
  reason:     string | null
}

interface Props {
  doctorId:   string
  doctorName: string
  onClose:    () => void
}

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

export function ScheduleEditor({ doctorId, doctorName, onClose }: Props) {
  const [schedules, setSchedules]   = useState<Schedule[]>([])
  const [exceptions, setExceptions] = useState<Exception[]>([])
  const [tab, setTab]               = useState<"regular" | "exception">("regular")
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [day, setDay]       = useState(1)
  const [start, setStart]   = useState("09:00")
  const [end, setEnd]       = useState("17:00")
  const [duration, setDur]  = useState(30)
  const [saving, setSaving] = useState(false)

  const [excDate, setExcDate]     = useState("")
  const [excKind, setExcKind]     = useState<"full_day" | "partial">("full_day")
  const [excStart, setExcStart]   = useState("12:00")
  const [excEnd, setExcEnd]       = useState("13:00")
  const [excReason, setExcReason] = useState("")

  async function load() {
    setLoading(true)
    const [sRes, eRes] = await Promise.all([
      fetch(`/api/doctors/${doctorId}/schedules`),
      fetch(`/api/doctors/${doctorId}/exceptions`),
    ])
    if (sRes.ok) setSchedules(await sRes.json())
    else setError("Gagal memuat schedule.")
    if (eRes.ok) setExceptions(await eRes.json())
    setLoading(false)
  }

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { load() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [doctorId])

  async function add() {
    setSaving(true); setError(null)
    try {
      const res = await fetch(`/api/doctors/${doctorId}/schedules`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: day, start_time: start, end_time: end, slot_duration_minutes: duration,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal simpan."); return
      }
      load()
    } finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm("Hapus jadwal ini?")) return
    await fetch(`/api/doctors/${doctorId}/schedules/${id}`, { method: "DELETE" })
    load()
  }

  async function addException(e: React.FormEvent) {
    e.preventDefault()
    if (!excDate) { setError("Pilih tanggal."); return }
    setSaving(true); setError(null)
    try {
      const body: Record<string, unknown> = { date: excDate, kind: excKind, reason: excReason }
      if (excKind === "partial") { body.start_time = excStart; body.end_time = excEnd }
      const res = await fetch(`/api/doctors/${doctorId}/exceptions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal simpan."); return
      }
      setExcDate(""); setExcReason("")
      load()
    } finally { setSaving(false) }
  }

  async function removeException(id: string) {
    if (!confirm("Hapus exception ini?")) return
    await fetch(`/api/doctors/${doctorId}/exceptions/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 modal-backdrop z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 modal-content w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-base font-medium text-gray-700">Jadwal — {doctorName}</h2>
          <p className="text-xs text-gray-500">Jadwal mingguan + exception (cuti/libur).</p>
        </div>

        <div className="flex gap-1.5 text-xs border-b border-black/[0.06]">
          <button
            onClick={() => setTab("regular")}
            className={`pb-2 px-2 ${tab === "regular" ? "border-b-2 border-purple-500 text-purple-500 font-medium" : "text-gray-500"}`}
          >
            Jadwal mingguan
          </button>
          <button
            onClick={() => setTab("exception")}
            className={`pb-2 px-2 ${tab === "exception" ? "border-b-2 border-purple-500 text-purple-500 font-medium" : "text-gray-500"}`}
          >
            Exception ({exceptions.length})
          </button>
        </div>

        {tab === "regular" ? (
          <>
            <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
              {loading ? (
                <p className="text-xs text-gray-400">Memuat…</p>
              ) : schedules.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada jadwal.</p>
              ) : (
                schedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-md px-3 py-2">
                    <div className="text-xs">
                      <span className="font-medium text-gray-700">{DAYS[s.day_of_week]}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-600">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-500">slot {s.slot_duration_minutes} mnt</span>
                    </div>
                    <button onClick={() => remove(s.id)} className="text-[11px] text-red-500 hover:text-red-700">Hapus</button>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-black/[0.06] pt-3 space-y-2">
              <p className="text-xs font-medium text-gray-700">Tambah jadwal baru</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-500 mb-0.5">Hari</label>
                  <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="input text-xs">
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Mulai</label>
                  <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="input text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Selesai</label>
                  <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="input text-xs" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-500 mb-0.5">Slot durasi (menit)</label>
                  <input type="number" min={10} max={120} step={5} value={duration} onChange={(e) => setDur(Number(e.target.value))} className="input text-xs" />
                </div>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-2 py-1.5">{error}</p>}
              <button onClick={add} disabled={saving} className="btn-purple w-full justify-center text-xs">
                {saving ? "..." : "+ Tambah jadwal"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
              {exceptions.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada exception.</p>
              ) : (
                exceptions.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 bg-amber-50 rounded-md px-3 py-2">
                    <div className="text-xs flex-1 min-w-0">
                      <span className="font-medium text-amber-700">{e.date}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-700">
                        {e.kind === "full_day" ? "Cuti sehari" : `Cuti ${e.start_time?.slice(0,5)} - ${e.end_time?.slice(0,5)}`}
                      </span>
                      {e.reason && <p className="text-[10px] text-gray-500 truncate">{e.reason}</p>}
                    </div>
                    <button onClick={() => removeException(e.id)} className="text-[11px] text-red-500 hover:text-red-700">Hapus</button>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={addException} className="border-t border-black/[0.06] pt-3 space-y-2">
              <p className="text-xs font-medium text-gray-700">Tambah exception</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Tanggal</label>
                  <input type="date" value={excDate} onChange={(e) => setExcDate(e.target.value)} className="input text-xs" required />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Tipe</label>
                  <select value={excKind} onChange={(e) => setExcKind(e.target.value as "full_day" | "partial")} className="input text-xs">
                    <option value="full_day">Cuti sehari</option>
                    <option value="partial">Cuti sebagian</option>
                  </select>
                </div>
                {excKind === "partial" && (
                  <>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Mulai</label>
                      <input type="time" value={excStart} onChange={(e) => setExcStart(e.target.value)} className="input text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Selesai</label>
                      <input type="time" value={excEnd} onChange={(e) => setExcEnd(e.target.value)} className="input text-xs" />
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Alasan (opsional)</label>
                <input value={excReason} onChange={(e) => setExcReason(e.target.value)} placeholder="Mis. Cuti tahunan" className="input text-xs" />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-2 py-1.5">{error}</p>}
              <button type="submit" disabled={saving} className="btn-purple w-full justify-center text-xs">
                {saving ? "..." : "+ Tambah exception"}
              </button>
            </form>
          </>
        )}

        <button onClick={onClose} className="btn-secondary w-full justify-center">Tutup</button>
      </div>
    </div>
  )
}
