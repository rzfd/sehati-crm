/**
 * Seed Knowledge Base dengan banyak Q&A klinik realistis (Bahasa Indonesia).
 * Run: npm run seed:kb
 *
 * Embedding di-batch dalam SATU request Voyage (embedBatch) → hindari limit 3 RPM.
 * Re-runnable: hapus dulu Q&A bertag 'demo-seed' sebelum insert ulang.
 * Konten murni operasional/informasi — tidak ada saran medis spesifik.
 *
 * Requires: VOYAGE_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import { loadEnv } from "./bench/lib/env"
loadEnv()

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../src/types/database"
import { embedBatch } from "../src/lib/voyage"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface QA { q: string; a: string; tags: string[] }

const QA: QA[] = [
  // ── Jam & operasional ──
  { q: "Apakah klinik buka hari ini?", a: "Klinik Sehati buka Senin–Sabtu pukul 08.00–21.00 WIB dan Minggu 09.00–15.00 WIB. Pada hari libur nasional klinik tutup, kecuali rujukan darurat.", tags: ["jam-buka", "operasional"] },
  { q: "Jam berapa klinik buka dan tutup?", a: "Jam operasional kami Senin–Sabtu 08.00–21.00 WIB dan Minggu 09.00–15.00 WIB.", tags: ["jam-buka", "operasional"] },
  { q: "Apakah klinik buka di hari Minggu dan tanggal merah?", a: "Klinik buka Minggu pukul 09.00–15.00 WIB dengan layanan terbatas. Pada tanggal merah/libur nasional klinik tutup.", tags: ["jam-buka"] },
  { q: "Adakah dokter yang jaga sekarang?", a: "Selalu ada dokter umum yang bertugas selama jam operasional. Untuk dokter spesialis, silakan cek jadwal praktik di menu Booking.", tags: ["dokter", "jadwal"] },
  { q: "Apakah klinik buka 24 jam atau punya IGD?", a: "Klinik tidak buka 24 jam dan tidak memiliki IGD. Untuk keadaan darurat di luar jam operasional, segera ke IGD rumah sakit terdekat atau hubungi 119.", tags: ["darurat", "operasional"] },

  // ── Pendaftaran & booking ──
  { q: "Bagaimana cara mendaftar atau membuat janji?", a: "Buka menu Booking di aplikasi, pilih dokter, tanggal, dan jam yang tersedia, lalu konfirmasi. Anda juga bisa mendaftar langsung di loket klinik.", tags: ["booking", "pendaftaran"] },
  { q: "Apakah bisa booking online lewat aplikasi?", a: "Bisa. Pemesanan jadwal tersedia 24 jam lewat menu Booking di aplikasi Sehati.", tags: ["booking"] },
  { q: "Apakah harus janji dulu atau bisa langsung datang (walk-in)?", a: "Keduanya bisa. Namun kami sarankan booking online agar tidak menunggu lama saat ramai.", tags: ["booking", "pendaftaran"] },
  { q: "Bagaimana cara membatalkan janji?", a: "Buka menu Riwayat, pilih janji yang ingin dibatalkan, lalu tekan Batalkan. Mohon batalkan minimal 2 jam sebelum jadwal.", tags: ["booking"] },
  { q: "Apakah jadwal janji bisa diganti (reschedule)?", a: "Bisa. Batalkan janji lama melalui menu Riwayat, lalu buat janji baru pada slot waktu yang tersedia.", tags: ["booking"] },

  // ── BPJS & asuransi ──
  { q: "Apakah klinik menerima BPJS Kesehatan?", a: "Ya, Klinik Sehati melayani peserta BPJS Kesehatan untuk layanan tingkat pertama. Mohon bawa kartu BPJS yang masih aktif saat berkunjung.", tags: ["bpjs", "asuransi"] },
  { q: "Bagaimana prosedur berobat menggunakan BPJS?", a: "Pastikan klinik ini terdaftar sebagai fasilitas kesehatan tingkat pertama (FKTP) Anda, lalu tunjukkan kartu BPJS aktif di loket pendaftaran.", tags: ["bpjs"] },
  { q: "Asuransi apa saja yang diterima klinik?", a: "Kami menerima BPJS Kesehatan dan beberapa asuransi swasta seperti Mandiri Inhealth, AXA, Allianz, dan Prudential. Silakan konfirmasi ke loket untuk detail kerja sama.", tags: ["asuransi"] },
  { q: "Apakah bisa klaim asuransi swasta?", a: "Untuk asuransi rekanan, klaim dapat dilakukan secara cashless. Untuk asuransi lain, kami menyediakan kuitansi resmi untuk proses reimbursement.", tags: ["asuransi"] },

  // ── Biaya ──
  { q: "Berapa biaya konsultasi dokter umum?", a: "Biaya konsultasi dokter umum mulai dari Rp50.000. Pasien BPJS yang aktif tidak dikenakan biaya konsultasi.", tags: ["biaya"] },
  { q: "Berapa biaya konsultasi dokter spesialis?", a: "Biaya konsultasi dokter spesialis berkisar Rp150.000–Rp300.000 tergantung jenis spesialisasi.", tags: ["biaya"] },
  { q: "Berapa biaya pemeriksaan laboratorium?", a: "Biaya lab bervariasi per jenis pemeriksaan; sebagai contoh cek darah lengkap mulai Rp90.000. Tersedia paket lab — tanyakan ke petugas.", tags: ["biaya", "lab"] },
  { q: "Apakah ada biaya pendaftaran atau administrasi?", a: "Untuk pasien umum dikenakan biaya administrasi pendaftaran sebesar Rp20.000.", tags: ["biaya"] },

  // ── Lokasi & kontak ──
  { q: "Di mana lokasi atau alamat klinik?", a: "Klinik Sehati berlokasi di Jl. Kesehatan No. 10, Jakarta Selatan. Peta lokasi dapat dilihat di menu Profil aplikasi.", tags: ["lokasi"] },
  { q: "Bagaimana cara menghubungi klinik?", a: "Hubungi kami di nomor 021-12345678 atau melalui fitur chat di aplikasi ini pada jam operasional.", tags: ["kontak"] },
  { q: "Apakah tersedia tempat parkir?", a: "Tersedia area parkir mobil dan motor gratis untuk pasien klinik.", tags: ["lokasi", "fasilitas"] },

  // ── Layanan & poli ──
  { q: "Layanan apa saja yang tersedia di klinik?", a: "Kami melayani poli umum, anak, penyakit dalam, gigi, dan kandungan, serta didukung laboratorium dan farmasi.", tags: ["layanan"] },
  { q: "Apakah ada poli gigi?", a: "Ya, poli gigi tersedia. Silakan cek jadwal dokter gigi di menu Booking.", tags: ["layanan", "gigi"] },
  { q: "Apakah ada poli anak dengan dokter spesialis?", a: "Ya, poli anak tersedia dengan dokter spesialis anak (Sp.A). Cek jadwalnya di menu Booking.", tags: ["layanan", "anak"] },
  { q: "Apakah klinik melayani imunisasi anak?", a: "Ya, kami melayani imunisasi dasar dan lanjutan sesuai jadwal yang dianjurkan Kemenkes.", tags: ["imunisasi", "anak"] },
  { q: "Apakah ada layanan medical check-up (MCU)?", a: "Ya, tersedia paket MCU dasar dan lengkap. Kami sarankan melakukan booking terlebih dahulu agar pemeriksaan lebih cepat.", tags: ["mcu", "layanan"] },
  { q: "Apakah ada layanan vaksinasi untuk dewasa?", a: "Ya, tersedia vaksinasi dewasa seperti influenza dan hepatitis sesuai ketersediaan stok. Hubungi klinik untuk konfirmasi.", tags: ["vaksin", "layanan"] },
  { q: "Apakah klinik punya apotek atau farmasi?", a: "Ya, farmasi klinik buka selama jam operasional untuk menebus resep dokter.", tags: ["farmasi", "obat"] },

  // ── Prosedur & hasil ──
  { q: "Berapa lama hasil laboratorium keluar?", a: "Sebagian hasil lab sederhana selesai dalam 1–2 jam, sedangkan pemeriksaan tertentu memerlukan 1–3 hari kerja. Hasil dapat diambil di klinik atau dikirim secara digital.", tags: ["lab", "hasil"] },
  { q: "Bagaimana cara mengambil hasil pemeriksaan?", a: "Hasil dapat diambil di loket dengan menunjukkan bukti pendaftaran, atau diakses melalui aplikasi bila layanan digital tersedia.", tags: ["hasil"] },
  { q: "Apakah perlu puasa sebelum cek darah?", a: "Beberapa pemeriksaan seperti gula darah puasa memerlukan puasa 8–10 jam sebelumnya. Petugas akan menginformasikan persiapannya saat Anda booking.", tags: ["lab", "persiapan"] },
  { q: "Apakah bisa meminta surat keterangan sehat?", a: "Bisa. Surat keterangan sehat diterbitkan setelah pemeriksaan oleh dokter. Silakan datang pada jam praktik.", tags: ["surat", "layanan"] },

  // ── Obat & resep ──
  { q: "Apakah bisa menebus resep di klinik?", a: "Bisa. Tunjukkan resep Anda ke farmasi klinik selama jam operasional untuk penebusan obat.", tags: ["obat", "farmasi"] },
  { q: "Bagaimana jika obat rutin saya habis?", a: "Untuk obat rutin, silakan konsultasikan dengan dokter untuk resep ulang. Sebagian obat memerlukan pemeriksaan ulang sebelum diresepkan kembali.", tags: ["obat", "resep"] },
  { q: "Apakah klinik menyediakan obat racikan?", a: "Ya, farmasi kami melayani pembuatan obat racikan sesuai resep dokter.", tags: ["obat", "farmasi"] },

  // ── Umum ──
  { q: "Apakah konsultasi online tersedia?", a: "Ya, Anda dapat melakukan konsultasi awal melalui chat di aplikasi. Untuk pemeriksaan fisik, Anda tetap perlu datang ke klinik.", tags: ["konsultasi", "online"] },
  { q: "Apakah pasien anak harus didampingi?", a: "Ya, pasien anak wajib didampingi oleh orang tua atau wali saat pemeriksaan.", tags: ["anak"] },
  { q: "Dokumen apa yang perlu dibawa saat berkunjung?", a: "Bawalah KTP, kartu BPJS atau asuransi bila ada, serta hasil pemeriksaan sebelumnya bila relevan.", tags: ["pendaftaran"] },
  { q: "Apakah klinik melayani kontrol rutin penyakit kronis?", a: "Ya, kami melayani kontrol rutin seperti hipertensi dan diabetes. Kami sarankan kontrol dengan dokter yang sama agar riwayat terpantau.", tags: ["kontrol", "layanan"] },
  { q: "Apakah data medis saya aman dan rahasia?", a: "Data Anda disimpan secara rahasia sesuai kebijakan privasi klinik dan hanya dapat diakses oleh tenaga medis yang berwenang.", tags: ["privasi"] },
]

async function main() {
  console.log(`\n🌱  Seed KB — ${QA.length} Q&A\n`)

  // Resolve clinic + author
  const { data: clinic, error: clinicErr } = await supabase.from("clinics").select("id, name").limit(1).maybeSingle()
  if (clinicErr || !clinic) { console.error("✗ Tidak ada clinic. Jalankan setup dulu.", clinicErr); process.exit(1) }
  const { data: staff } = await supabase
    .from("staff_members").select("id").eq("clinic_id", clinic.id).in("role", ["admin", "manager"]).limit(1).maybeSingle()
  const createdBy = staff?.id ?? null
  console.log(`clinic: ${clinic.name} (${clinic.id}) · author: ${createdBy ?? "—"}`)

  // Re-runnable: hapus seed lama
  const { error: delErr, count } = await supabase
    .from("kb_qa_pairs").delete({ count: "exact" }).eq("clinic_id", clinic.id).contains("tags", ["demo-seed"])
  if (delErr) console.warn("  (warn) gagal hapus seed lama:", delErr.message)
  else if (count) console.log(`  hapus ${count} seed lama`)

  // Embed semua sekaligus (1 request Voyage)
  console.log("  embedding (batched)…")
  const contents = QA.map((x) => `Q: ${x.q}\nA: ${x.a}`)
  const embeddings = await embedBatch(contents, "document")
  if (embeddings.length !== QA.length) { console.error(`✗ embedding count mismatch: ${embeddings.length}/${QA.length}`); process.exit(1) }

  // Insert
  const rows = QA.map((x, i) => ({
    clinic_id:  clinic.id,
    question:   x.q,
    answer:     x.a,
    tags:       [...x.tags, "demo-seed"],
    status:     "published" as const,
    embedding:  embeddings[i],
    created_by: createdBy,
  }))
  const { error: insErr, count: insCount } = await supabase
    .from("kb_qa_pairs").insert(rows, { count: "exact" })
  if (insErr) { console.error("✗ insert gagal:", insErr); process.exit(1) }

  console.log(`\n✅ ${insCount ?? rows.length} Q&A published ke KB.`)
  console.log(`   Coba di chat pasien: "Apakah klinik buka hari ini?" / "adakah dokter yang jaga"\n`)
}

main().catch((e) => { console.error(e); process.exit(1) })
