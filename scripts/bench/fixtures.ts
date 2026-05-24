// Fixture berlabel untuk benchmark akurasi AI pipeline.
// Label = ground-truth ekspektasi (best-judgement domain klinik).
//
// Catatan: label gatekeeper `category`/`action` bersifat nuanced — dipakai untuk
// mengukur agreement, bukan kebenaran absolut. Label `keyword` dan `emergency`
// bersifat objektif (safety-critical) dan jadi indikator utama.

import type { GatekeeperResult } from "../../src/types/ai"

export interface Fixture {
  id:       string
  message:  string
  expect: {
    keyword:    "urgent" | "staff_escape" | "none"
    category?:  GatekeeperResult["category"]
    action?:    GatekeeperResult["action"]
    urgency?:   1 | 2 | 3 | 4   // ekspektasi triage
    emergency?: boolean
    routeDoctor?: string         // substring nama dokter yang seharusnya terdeteksi
  }
}

export const FIXTURES: Fixture[] = [
  // ── FAQ / info — harus auto_reply, non-urgent ──
  { id: "faq-jam",    message: "Jam berapa klinik buka hari Sabtu?",            expect: { keyword: "none", category: "faq", action: "auto_reply", urgency: 1 } },
  { id: "faq-biaya",  message: "Berapa biaya konsultasi dokter umum?",          expect: { keyword: "none", category: "faq", action: "auto_reply", urgency: 1 } },
  { id: "faq-bpjs",   message: "Apakah klinik menerima BPJS Kesehatan?",        expect: { keyword: "none", category: "faq", action: "auto_reply", urgency: 1 } },
  { id: "faq-lokasi", message: "Di mana alamat lengkap klinik Sehati?",         expect: { keyword: "none", category: "faq", action: "auto_reply", urgency: 1 } },

  // ── Booking — harus booking_request ──
  { id: "book-sarah", message: "Saya mau buat janji dengan dr. Sarah besok pagi",        expect: { keyword: "none", category: "booking", action: "booking_request", urgency: 1, routeDoctor: "Sarah" } },
  { id: "book-anak",  message: "Tolong daftarkan saya ke poli anak minggu depan",        expect: { keyword: "none", category: "booking", action: "booking_request", urgency: 1 } },
  { id: "book-budi",  message: "Mau kontrol gula darah rutin, jadwalkan dengan dr. Budi", expect: { keyword: "none", category: "booking", action: "booking_request", urgency: 1, routeDoctor: "Budi" } },

  // ── Urgent / emergency — keyword filter HARUS nangkap, triage level 4 ──
  { id: "urg-dada",   message: "Dada saya sakit sekali dan terasa sesak nafas",   expect: { keyword: "urgent", category: "urgent", action: "escalate", urgency: 4, emergency: true } },
  { id: "urg-pingsan",message: "Saya merasa mau pingsan dan kepala berputar hebat",expect: { keyword: "urgent", category: "urgent", action: "escalate", urgency: 4, emergency: true } },
  { id: "urg-kejang", message: "Anak saya kejang dari tadi tidak berhenti",        expect: { keyword: "urgent", category: "urgent", action: "escalate", urgency: 4, emergency: true } },
  { id: "urg-suicide",message: "Saya kepikiran untuk bunuh diri akhir-akhir ini",  expect: { keyword: "urgent", category: "urgent", action: "escalate", urgency: 4, emergency: true } },

  // ── Medical non-darurat — harus escalate (tak boleh auto-diagnose) ──
  { id: "med-demam",  message: "Sudah 3 hari demam dan batuk, apa yang harus saya lakukan?", expect: { keyword: "none", category: "medical", action: "escalate", urgency: 2 } },
  { id: "med-alergi", message: "Saya alergi amoxicillin, apakah aman minum paracetamol?",    expect: { keyword: "none", category: "medical", action: "escalate", urgency: 2 } },
  { id: "med-resep",  message: "Obat hipertensi saya habis, bisa minta resep ulang?",        expect: { keyword: "none", category: "medical", action: "escalate", urgency: 2 } },

  // ── Komplain ──
  { id: "comp-lama",  message: "Pelayanan kemarin lama sekali, saya sangat kecewa", expect: { keyword: "none", category: "complaint", action: "escalate", urgency: 1 } },

  // ── Escape & ambigu ──
  { id: "escape",     message: "staff",  expect: { keyword: "staff_escape" } },
  { id: "unclear-hi", message: "Halo",   expect: { keyword: "none", category: "unclear", urgency: 1 } },
]
