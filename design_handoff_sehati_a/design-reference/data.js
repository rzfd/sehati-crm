// Shared mock data — Bahasa Indonesia
window.SehatiData = {
  doctors: [
    { id: 'dr1', name: 'dr. Ratna Kusuma, Sp.OG', spec: 'Obgyn', initials: 'RK', hue: 142 },
    { id: 'dr2', name: 'dr. Andi Wijaya', spec: 'Umum', initials: 'AW', hue: 28 },
    { id: 'dr3', name: 'dr. Budi Santoso, Sp.A', spec: 'Anak', initials: 'BS', hue: 18 },
    { id: 'dr4', name: 'dr. Siti Nurbaya, Sp.PD', spec: 'Penyakit Dalam', initials: 'SN', hue: 200 },
    { id: 'dr5', name: 'dr. Hendra Gunawan, Sp.B', spec: 'Bedah', initials: 'HG', hue: 80 },
  ],
  inbox: [
    {
      id: 'm1', name: 'Sari Wulandari', initials: 'SW',
      preview: 'Dok, anak saya demam 39° sejak tadi malam, perlu ke IGD?',
      time: '2 mnt', unread: true, urgency: 'urgent', category: 'Medis', escalated: true,
      ai: 'Auto-escalated · UU Praktik Kedokteran',
      messages: [
        { from: 'user', text: 'Selamat pagi, saya Sari', time: '07:42' },
        { from: 'user', text: 'Anak saya, Bima (4 thn), demam 39° sejak tadi malam.', time: '07:42' },
        { from: 'user', text: 'Sudah dikasih parasetamol tapi belum turun. Perlu ke IGD?', time: '07:43' },
        { from: 'ai', text: 'Halo Bu Sari — saya tidak bisa memberi diagnosis medis. Saya teruskan pertanyaan Ibu ke Asisten Dokter Anak. Mohon tunggu sebentar 🙏', time: '07:43', kind: 'escalate' },
      ],
    },
    {
      id: 'm2', name: 'Putri Maharani', initials: 'PM',
      preview: 'Mau booking dr. Ratna minggu depan, masih ada slot Senin pagi?',
      time: '8 mnt', unread: true, urgency: 'normal', category: 'Booking',
      ai: 'Tag · booking · obgyn',
      messages: [
        { from: 'user', text: 'Mau booking dr. Ratna minggu depan, masih ada slot Senin pagi?', time: '07:36' },
        { from: 'ai', text: 'Halo Bu Putri 👋 dr. Ratna Senin 18 Mei masih ada slot:\n• 09:00 — 09:30\n• 10:30 — 11:00\nMau saya bookingkan yang mana?', time: '07:36', kind: 'rag' },
      ],
    },
    {
      id: 'm3', name: 'Bayu Saputra', initials: 'BS',
      preview: 'Jam buka klinik hari Minggu jam berapa ya?',
      time: '14 mnt', unread: false, urgency: 'low', category: 'Info',
      ai: 'Auto-reply · jam buka',
      messages: [
        { from: 'user', text: 'Jam buka klinik hari Minggu jam berapa ya?', time: '07:30' },
        { from: 'ai', text: 'Klinik buka hari Minggu pukul 08:00 – 14:00. Untuk emergency, hubungi 0812-3456-7890.', time: '07:30', kind: 'rag' },
      ],
    },
    {
      id: 'm4', name: 'Ahmad Fauzi', initials: 'AF',
      preview: 'Apakah klinik menerima BPJS untuk pemeriksaan umum?',
      time: '32 mnt', unread: false, urgency: 'low', category: 'Info',
      ai: 'Auto-reply · BPJS',
    },
    {
      id: 'm5', name: 'Lina Marlina', initials: 'LM',
      preview: 'Mau reschedule appointment ke hari Jumat sore',
      time: '1 jam', unread: false, urgency: 'normal', category: 'Booking',
      ai: 'Routing · CS',
    },
    {
      id: 'm6', name: 'Dewi Anggraini', initials: 'DA',
      preview: 'Hasil lab kapan bisa diambil ya?',
      time: '2 jam', unread: false, urgency: 'normal', category: 'Lab',
      ai: 'Routing · Asdok',
    },
  ],
  smartReplies: [
    { tone: 'Empatik', text: 'Ibu Sari, kami mengerti khawatirnya. Demam 39° pada anak 4 tahun memang perlu perhatian. Asdok dr. Budi akan menjawab dalam 5 menit. Sambil menunggu, pastikan Bima tetap minum air hangat ya.' },
    { tone: 'Profesional', text: 'Terima kasih informasinya. Saya teruskan ke Asdok dr. Budi Santoso (Sp.A). Estimasi respon: 5 menit. Jika kondisi memburuk sebelum itu, mohon segera ke IGD terdekat.' },
    { tone: 'Singkat', text: 'Diteruskan ke Asdok dr. Budi. Respon ±5 menit. Jika makin parah, langsung ke IGD ya Bu.' },
  ],
  schedule: [
    { day: 1, start: '10:00', end: '10:30', dr: 'dr1', patient: 'Putri M.' },
    { day: 0, start: '15:00', end: '16:00', dr: 'dr3', patient: 'Bima Saputra' },
    { day: 4, start: '10:00', end: '11:00', dr: 'dr1', patient: 'Rina A.' },
    { day: 4, start: '14:30', end: '15:00', dr: 'dr2', patient: 'Almas' },
    { day: 4, start: '15:00', end: '15:30', dr: 'dr1', patient: 'Pak Hadi' },
    { day: 6, start: '13:00', end: '14:00', dr: 'dr1', patient: 'Bu Tati' },
  ],
  kbStats: { qa: 142, docs: 38, gaps: 7, retrievalAcc: 0.94 },
  kpis: {
    msgToday: 184, autoResolved: 121, escalated: 12, bookings: 34,
    avgResponse: '38 dtk', satisfaction: 4.6,
  },
};
