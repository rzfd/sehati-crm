/**
 * Seed script — Sprint 0 dummy data
 * Run: npm run seed
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import fs from "fs"
import path from "path"

// Load .env.local (Node 18 compatible — no --env-file flag needed)
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!(key in process.env)) process.env[key] = val
  }
}

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../src/types/database"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Helpers ───────────────────────────────────────────────
function rand<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split("T")[0]
}

// ── Data fixtures ─────────────────────────────────────────
const PATIENT_NAMES = [
  "Bu Sari Dewi","Pak Budi Santoso","Bu Rina Wati","Pak Andi Kusuma","Bu Dewi Lestari",
  "Pak Hendra Wijaya","Bu Fitri Handayani","Pak Rizky Pratama","Bu Yuni Astuti","Pak Dodi Firmansyah",
  "Bu Mega Putri","Pak Fajar Nugroho","Bu Lina Susanti","Pak Arif Rahman","Bu Sinta Maharani",
  "Pak Teguh Setiawan","Bu Novia Anggraini","Pak Deni Kurniawan","Bu Ayu Puspita","Pak Rudi Hermawan",
  "Bu Tuti Rahayu","Pak Agus Wibowo","Bu Indah Permata","Pak Bambang Supriyadi","Bu Ratna Sari",
  "Pak Wahyu Hidayat","Bu Citra Pertiwi","Pak Eko Prasetyo","Bu Mira Anindita","Pak Bayu Nugroho",
  "Bu Laras Wulandari","Pak Dimas Saputra","Bu Retno Wijayanti","Pak Surya Atmaja","Bu Kartika Dewi",
  "Pak Hadi Pranoto","Bu Vina Mustika","Pak Ferry Kusuma","Bu Susi Rahmawati","Pak Irwan Maulana",
  "Bu Dian Permatasari","Pak Galih Setyawan","Bu Nita Anggraeni","Pak Rian Fauzi","Bu Maya Putri",
  "Pak Yusuf Hakim","Bu Ani Sulistyowati","Pak Doni Prasetyo","Bu Rini Cahyani","Pak Andri Susilo",
]

const DOCTOR_DATA = [
  { name: "dr. Andi Wijaya", specialty: "Umum", title: "dr." },
  { name: "dr. Siti Nurbaya, Sp.PD", specialty: "Penyakit Dalam", title: "dr." },
  { name: "dr. Budi Santoso, Sp.A", specialty: "Anak", title: "dr." },
  { name: "dr. Ratna Kusuma, Sp.OG", specialty: "Obgyn", title: "dr." },
  { name: "dr. Hendra Gunawan, Sp.B", specialty: "Bedah", title: "dr." },
]

const STAFF_DATA = [
  { name: "Rizka Admin", role: "admin" as const },
  { name: "Pak Yanto Manager", role: "manager" as const },
  { name: "Bu Tini Resepsionis", role: "receptionist" as const },
  { name: "Bu Dita CS", role: "cs" as const },
  { name: "Susi Asdok", role: "doctor_assistant" as const },
]

const KB_QA = [
  { q: "Jam buka klinik kapan?", a: "Klinik Sehati buka Senin–Sabtu pukul 08.00–20.00 WIB dan Minggu 08.00–14.00 WIB.", tags: ["info","jam-buka"] },
  { q: "Bagaimana cara booking janji?", a: "Anda bisa booking melalui aplikasi Sehati, pilih menu Booking, pilih dokter dan jadwal yang tersedia.", tags: ["booking"] },
  { q: "Apakah klinik menerima BPJS?", a: "Ya, kami menerima BPJS Kesehatan untuk poli umum. Untuk spesialis, silakan cek ketersediaan di resepsionis.", tags: ["bpjs","asuransi"] },
  { q: "Berapa biaya konsultasi dokter umum?", a: "Biaya konsultasi dokter umum Rp 75.000. Untuk dokter spesialis mulai Rp 150.000 tergantung spesialisasi.", tags: ["biaya"] },
  { q: "Di mana lokasi klinik?", a: "Klinik Sehati berlokasi di Jl. Kesehatan No. 123, Jakarta Selatan. Dekat halte busway Fatmawati.", tags: ["lokasi"] },
  { q: "Apakah ada layanan home visit?", a: "Saat ini kami belum menyediakan layanan home visit. Silakan kunjungi klinik atau hubungi kami untuk informasi lebih lanjut.", tags: ["layanan"] },
  { q: "Berapa lama antrian dokter biasanya?", a: "Rata-rata waktu tunggu adalah 15–30 menit. Kami sarankan booking terlebih dahulu untuk mengurangi waktu tunggu.", tags: ["antrian","booking"] },
  { q: "Apakah bisa reschedule janji?", a: "Bisa, reschedule bisa dilakukan melalui aplikasi atau menghubungi resepsionis minimal 2 jam sebelum jadwal.", tags: ["reschedule","booking"] },
  { q: "Dokter spesialis apa saja yang tersedia?", a: "Kami memiliki dokter Penyakit Dalam, Anak, Kebidanan & Kandungan (Obgyn), dan Bedah.", tags: ["dokter","spesialis"] },
  { q: "Apakah ada fasilitas parkir?", a: "Ya, tersedia parkir gratis untuk 50 kendaraan roda 4 dan area parkir motor.", tags: ["fasilitas","parkir"] },
  { q: "Bagaimana cara daftar pasien baru?", a: "Pasien baru bisa mendaftar langsung di resepsionis dengan membawa KTP. Proses pendaftaran ±10 menit.", tags: ["pasien-baru","registrasi"] },
  { q: "Apakah klinik melayani pasien darurat?", a: "Untuk kondisi darurat, segera hubungi IGD rumah sakit terdekat. Kami bukan fasilitas IGD.", tags: ["darurat","emergency"] },
  { q: "Ada pembayaran dengan kartu kredit?", a: "Kami menerima pembayaran tunai, kartu debit, kartu kredit (Visa/Mastercard), dan transfer bank.", tags: ["pembayaran"] },
  { q: "Berapa lama hasil lab keluar?", a: "Hasil laboratorium rutin tersedia dalam 2–4 jam. Untuk pemeriksaan khusus bisa 1–2 hari kerja.", tags: ["laboratorium","hasil"] },
  { q: "Apakah ada klinik gigi?", a: "Ya, kami memiliki poli gigi yang buka Senin–Jumat. Tersedia scaling, tambal, dan cabut gigi.", tags: ["gigi","poli-gigi"] },
  { q: "Bagaimana prosedur rujukan BPJS?", a: "Rujukan BPJS diproses oleh dokter umum kami. Pastikan membawa kartu BPJS aktif dan KTP saat konsultasi.", tags: ["bpjs","rujukan"] },
  { q: "Apakah ada layanan vaksinasi?", a: "Ya, kami menyediakan vaksinasi dewasa dan anak. Silakan hubungi resepsionis untuk jadwal dan ketersediaan vaksin.", tags: ["vaksin","imunisasi"] },
  { q: "Biaya USG berapa?", a: "Biaya USG abdomen Rp 200.000, USG kandungan Rp 250.000. Perlu booking terlebih dahulu.", tags: ["usg","biaya"] },
  { q: "Apakah dokter spesialis perlu surat rujukan?", a: "Untuk pasien umum tidak perlu rujukan. Untuk pasien BPJS wajib membawa surat rujukan dari faskes tingkat 1.", tags: ["rujukan","spesialis"] },
  { q: "Jam praktek dokter spesialis kapan?", a: "Jadwal dokter spesialis bervariasi. Cek di aplikasi Sehati atau hubungi resepsionis untuk jadwal terkini.", tags: ["jadwal","spesialis"] },
  { q: "Bagaimana cara batalkan janji?", a: "Pembatalan bisa melalui aplikasi menu Booking > Riwayat > Batalkan, atau hubungi kami minimal 1 jam sebelumnya.", tags: ["batal","booking"] },
  { q: "Apakah ada dokter anak?", a: "Ya, kami memiliki dr. Budi Santoso, Sp.A yang praktik Senin, Rabu, dan Jumat.", tags: ["dokter-anak","spesialis"] },
  { q: "Cara cek hasil lab online?", a: "Hasil lab bisa dilihat di aplikasi Sehati menu Riwayat > Hasil Pemeriksaan setelah dokter mengupload.", tags: ["lab","hasil","online"] },
  { q: "Apakah bisa konsultasi via chat?", a: "Saat ini konsultasi via chat dibantu oleh asisten AI untuk informasi umum. Untuk konsultasi medis, kunjungi klinik.", tags: ["konsultasi","chat"] },
  { q: "Biaya rawat luka berapa?", a: "Biaya perawatan luka ringan mulai Rp 50.000 tergantung tingkat keparahan dan bahan habis pakai.", tags: ["biaya","luka"] },
  { q: "Apakah ada dokter kandungan?", a: "Ya, dr. Ratna Kusuma, Sp.OG praktik Selasa dan Kamis pukul 09.00–15.00.", tags: ["kandungan","obgyn"] },
  { q: "Cara daftar member klinik?", a: "Daftar member melalui aplikasi Sehati atau resepsionis. Member mendapat diskon 10% untuk layanan tertentu.", tags: ["member","daftar"] },
  { q: "Apakah klinik punya apotek?", a: "Ya, apotek Sehati tersedia di lantai 1 dan buka mengikuti jam operasional klinik.", tags: ["apotek"] },
  { q: "Berapa biaya tes COVID?", a: "Rapid antigen Rp 75.000. Untuk PCR kami rujuk ke lab rekanan.", tags: ["covid","tes"] },
  { q: "Dokter umum ada berapa?", a: "Kami memiliki 3 dokter umum yang bergiliran setiap hari untuk memastikan selalu ada dokter yang bertugas.", tags: ["dokter-umum"] },
  { q: "Apakah ada klinik kecantikan?", a: "Kami memiliki layanan estetika dasar seperti facial dan perawatan kulit ringan.", tags: ["kecantikan","estetika"] },
  { q: "Bagaimana jika tidak ada slot kosong?", a: "Jika slot penuh, Anda bisa masuk daftar tunggu di aplikasi. Kami akan notifikasi jika ada pembatalan.", tags: ["slot","antrian"] },
  { q: "Biaya cek darah lengkap?", a: "Paket cek darah lengkap Rp 150.000 meliputi hemoglobin, leukosit, trombosit, hematokrit.", tags: ["lab","darah","biaya"] },
  { q: "Apakah menerima asuransi swasta?", a: "Ya, kami menerima beberapa asuransi swasta. Silakan tunjukkan kartu asuransi saat pendaftaran.", tags: ["asuransi"] },
  { q: "Ada layanan fisioterapi?", a: "Saat ini kami belum memiliki poli fisioterapi. Kami dapat merujuk ke klinik fisioterapi rekanan.", tags: ["fisioterapi"] },
  { q: "Cara update data pasien?", a: "Update data bisa dilakukan di aplikasi menu Profil > Edit, atau minta bantuan resepsionis.", tags: ["data","profil"] },
  { q: "Apakah ada program vaksin anak?", a: "Ya, jadwal vaksin anak mengikuti program imunisasi nasional. Hubungi kami untuk jadwal vaksin.", tags: ["vaksin","anak"] },
  { q: "Berapa lama masa berlaku surat keterangan sehat?", a: "Surat keterangan sehat berlaku sesuai kebutuhan yang Anda minta, biasanya 1–3 bulan.", tags: ["surat-sehat"] },
  { q: "Apakah ada layanan medical check-up?", a: "Ya, paket MCU tersedia mulai Rp 350.000. Termasuk pemeriksaan fisik, EKG, dan lab dasar.", tags: ["mcu","check-up"] },
  { q: "Bagaimana proses pengambilan obat di apotek?", a: "Bawa resep dokter ke apotek kami. Waktu tunggu obat biasanya 10–15 menit.", tags: ["apotek","obat"] },
  { q: "Apakah ada diskon untuk lansia?", a: "Pasien usia 60+ mendapat diskon 15% untuk konsultasi dokter umum dengan menunjukkan KTP.", tags: ["lansia","diskon"] },
  { q: "Cara konfirmasi booking?", a: "Konfirmasi booking otomatis via notifikasi aplikasi. Anda juga bisa cek di menu Booking > Jadwal Saya.", tags: ["konfirmasi","booking"] },
  { q: "Apakah buka di hari libur nasional?", a: "Sebagian hari libur nasional kami tetap buka dengan jadwal terbatas. Cek pengumuman di aplikasi.", tags: ["libur","jadwal"] },
  { q: "Bagaimana cara bayar via transfer?", a: "Transfer ke BCA 1234567890 a/n Klinik Sehati. Konfirmasi via WhatsApp resepsionis setelah transfer.", tags: ["transfer","pembayaran"] },
  { q: "Biaya konsultasi anak?", a: "Konsultasi dokter spesialis anak Rp 175.000. BPJS dapat digunakan dengan surat rujukan.", tags: ["biaya","anak"] },
  { q: "Apakah ada layanan EKG?", a: "Ya, pemeriksaan EKG tersedia Rp 100.000. Termasuk dalam paket MCU.", tags: ["ekg"] },
  { q: "Jam berapa buka Sabtu?", a: "Sabtu buka pukul 08.00–17.00 WIB. Tidak semua dokter spesialis praktik di Sabtu.", tags: ["sabtu","jam-buka"] },
  { q: "Apakah bisa minta surat rujukan?", a: "Surat rujukan dikeluarkan oleh dokter sesuai indikasi medis, bukan atas permintaan pasien.", tags: ["rujukan"] },
  { q: "Ada pelayanan konsultasi gizi?", a: "Kami memiliki konsultasi gizi dengan dietisian setiap Rabu dan Jumat.", tags: ["gizi","nutrisi"] },
  { q: "Berapa biaya khitan?", a: "Khitan laser Rp 800.000, khitan konvensional Rp 400.000. Perlu booking dan konsultasi terlebih dahulu.", tags: ["khitan","biaya"] },
]

const SAMPLE_MESSAGES = [
  ["Selamat pagi, saya mau tanya jam buka klinik", "Selamat pagi! Klinik buka Senin–Sabtu 08.00–20.00 WIB. Ada yang bisa dibantu?"],
  ["Mau booking dengan dr. Andi", "Baik, untuk booking dengan dr. Andi silakan pilih jadwal yang tersedia di aplikasi ya."],
  ["Berapa biaya konsultasi?", "Biaya konsultasi dokter umum Rp 75.000. Untuk spesialis mulai Rp 150.000."],
  ["Saya ingin tahu hasil lab saya", "Hasil lab bisa dicek di menu Riwayat > Hasil Pemeriksaan di aplikasi."],
  ["Apakah menerima BPJS?", "Ya, kami menerima BPJS untuk poli umum. Untuk spesialis silakan konfirmasi ke resepsionis."],
]

// ── Main seed function ────────────────────────────────────
async function seed() {
  console.log("🌱 Starting seed...")

  // 1. Clinic
  const { data: clinic, error: ce } = await supabase
    .from("clinics")
    .insert({ name: "Klinik Sehati", address: "Jl. Kesehatan No. 123, Jakarta Selatan", phone: "021-12345678" })
    .select().single()
  if (ce) throw new Error(`Clinic: ${ce.message}`)
  console.log(`✅ Clinic: ${clinic.name}`)

  // 2. Doctors (5)
  const { data: doctors, error: de } = await supabase
    .from("doctors")
    .insert(DOCTOR_DATA.map(d => ({ ...d, clinic_id: clinic.id })))
    .select()
  if (de) throw new Error(`Doctors: ${de.message}`)
  console.log(`✅ Doctors: ${doctors?.length}`)

  // 3. Doctor schedules
  const schedules = doctors!.flatMap((doc) =>
    [1, 2, 3, 4, 5].map((day) => ({
      doctor_id: doc.id,
      day_of_week: day,
      start_time: "08:00",
      end_time: "16:00",
      slot_duration_minutes: 30,
      max_patients: 20,
    }))
  )
  const { error: se } = await supabase.from("doctor_schedules").insert(schedules)
  if (se) throw new Error(`Schedules: ${se.message}`)
  console.log(`✅ Schedules: ${schedules.length}`)

  // 4. Staff members (5)
  const { data: staff, error: ste } = await supabase
    .from("staff_members")
    .insert(STAFF_DATA.map((s, i) => ({
      ...s,
      clinic_id: clinic.id,
      linked_doctor_id: s.role === "doctor_assistant" ? doctors![0].id : null,
    })))
    .select()
  if (ste) throw new Error(`Staff: ${ste.message}`)
  console.log(`✅ Staff: ${staff?.length}`)

  // 5. Patients (50)
  const { data: patients, error: pe } = await supabase
    .from("patients")
    .insert(
      PATIENT_NAMES.map((name, i) => ({
        clinic_id: clinic.id,
        name,
        phone: `08${String(Math.floor(Math.random() * 9e9 + 1e9))}`,
        date_of_birth: randDate(new Date("1960-01-01"), new Date("2005-12-31")),
        primary_doctor_id: rand(doctors!).id,
        is_new: i > 35,
        tags: rand([["Pasien baru"], ["Follow-up"], ["VIP"], [], []]),
      }))
    )
    .select()
  if (pe) throw new Error(`Patients: ${pe.message}`)
  console.log(`✅ Patients: ${patients?.length}`)

  // 6. Conversations (30) + messages
  const statuses = ["open", "open", "open", "resolved", "archived"] as const
  const categories = ["faq", "booking", "medical", "complaint", "faq", "booking"] as const

  for (let i = 0; i < 30; i++) {
    const patient = rand(patients!)
    const status  = rand(statuses)
    const category = rand(categories)

    const { data: conv, error: cve } = await supabase
      .from("conversations")
      .insert({
        clinic_id:        clinic.id,
        patient_id:       patient.id,
        assigned_to:      rand(staff!).id,
        routed_to_doctor: Math.random() > 0.5 ? rand(doctors!).id : null,
        status,
        category,
        urgency_level:    category === "medical" ? 3 : category === "complaint" ? 2 : 1,
        ai_handled:       category === "faq",
      })
      .select().single()
    if (cve) { console.warn(`Conv ${i} error: ${cve.message}`); continue }

    const msgPair = rand(SAMPLE_MESSAGES)
    await supabase.from("messages").insert([
      { conversation_id: conv.id, sender_type: "patient", sender_id: patient.id, content: msgPair[0] },
      {
        conversation_id: conv.id,
        sender_type: category === "faq" ? "ai_bot" : "staff",
        sender_id: staff![0].id,
        content: msgPair[1],
        metadata: category === "faq" ? { action: "auto_reply", confidence: 0.85, kb_sources: [] } : null,
      },
    ])
  }
  console.log("✅ Conversations: 30 + messages")

  // 7. KB Q&A (50 pairs — use our 50 items)
  const { error: kbe } = await supabase.from("kb_qa_pairs").insert(
    KB_QA.map((qa) => ({
      clinic_id:  clinic.id,
      question:   qa.q,
      answer:     qa.a,
      tags:       qa.tags,
      status:     "published" as const,
      created_by: staff![0].id,
    }))
  )
  if (kbe) throw new Error(`KB QA: ${kbe.message}`)
  console.log(`✅ KB Q&A pairs: ${KB_QA.length}`)

  // 8. Sample bookings (10)
  const bookingStatuses = ["pending","confirmed","completed"] as const
  for (let i = 0; i < 10; i++) {
    await supabase.from("bookings").insert({
      clinic_id:    clinic.id,
      patient_id:   rand(patients!).id,
      doctor_id:    rand(doctors!).id,
      booking_date: randDate(new Date(), new Date(Date.now() + 30 * 86400000)),
      booking_time: rand(["09:00","10:00","11:00","13:00","14:00","15:00"]),
      status:       rand(bookingStatuses),
    })
  }
  console.log("✅ Bookings: 10")

  console.log("\n🎉 Seed selesai!")
  console.log(`   Clinic ID: ${clinic.id}`)
}

seed().catch((err) => { console.error("❌ Seed error:", err); process.exit(1) })
