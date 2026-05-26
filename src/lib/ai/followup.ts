import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"

// Prompt di-inline (khusus follow-up) — sengaja non-medis.
const FOLLOWUP_SYSTEM = `Kamu menulis pesan follow-up pasca-kunjungan untuk pasien klinik Indonesia (dikirim atas nama klinik).

Aturan:
- Ramah & singkat (1-2 kalimat): ucapan terima kasih + ajakan ringan menjadwalkan kontrol BILA diperlukan.
- JANGAN beri saran medis, diagnosis, obat, atau menanyakan gejala. Murni administratif/relasional.
- Bahasa Indonesia.
- Output HANYA JSON valid, tanpa code fence.

Format respons (JSON saja):
{"message":"<pesan follow-up>"}`

// Draft pesan follow-up pasca-kunjungan (Haiku, non-medis). null kalau gagal.
export async function draftFollowUp(ctx: { doctorName?: string | null; specialty?: string | null }): Promise<string | null> {
  const dr = ctx.doctorName ? `dr. ${ctx.doctorName}` : "dokter"
  const userContent = `Kunjungan pasien dengan ${dr}${ctx.specialty ? ` (${ctx.specialty})` : ""}. Tulis pesan follow-up pasca-kunjungan.`
  try {
    const res = await anthropic.messages.create({
      model:      HAIKU,
      max_tokens: 200,
      system:     FOLLOWUP_SYSTEM,
      messages:   [{ role: "user", content: userContent }],
    })
    const parsed = safeParseJson<{ message: string }>(extractText(res.content))
    if (parsed && typeof parsed.message === "string" && parsed.message.trim()) return parsed.message.trim()
    return null
  } catch (err) {
    console.error("[followup] error:", err)
    return null
  }
}
