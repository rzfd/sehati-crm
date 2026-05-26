// Heuristik risiko no-show (bukan LLM — ringan & deterministik).
export interface NoShowFactors {
  pastNoShows: number
  pastTotal:   number // jumlah booking historis yang sudah ada outcome-nya
  isNew:       boolean
  leadDays:    number // jarak hari dari sekarang ke tanggal booking
}

export interface NoShowRisk {
  score:   number // 0-1
  level:   "low" | "medium" | "high"
  reasons: string[]
}

export function scoreNoShowRisk(f: NoShowFactors): NoShowRisk {
  let score = 0
  const reasons: string[] = []

  if (f.pastTotal > 0) {
    const rate = f.pastNoShows / f.pastTotal
    if (rate >= 0.5)            { score += 0.5; reasons.push("riwayat no-show tinggi") }
    else if (f.pastNoShows > 0) { score += 0.3; reasons.push("pernah tidak hadir") }
  } else if (!f.isNew) {
    score += 0.1; reasons.push("riwayat kehadiran belum ada")
  }
  if (f.isNew)         { score += 0.2;  reasons.push("pasien baru") }
  if (f.leadDays >= 7) { score += 0.15; reasons.push("dijadwalkan jauh hari") }

  score = Math.min(1, score)
  const level = score >= 0.5 ? "high" : score >= 0.25 ? "medium" : "low"
  return { score, level, reasons }
}
