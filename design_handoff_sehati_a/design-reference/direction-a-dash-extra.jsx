/* global React, Avatar, Icon, Chip, AIBadge, sasT, SehatiData, SaSDashShell */

// Tiny sparkline / chart helpers --------------------------------
function SaSSpark({ data, color = sasT.primary, w = 110, h = 36 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polygon points={area} fill={color} opacity={0.14} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SaSBars({ data, color = sasT.primary, height = 70 }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              height: `${(d.v / max) * 100}%`,
              background: d.hl ? color : sasT.surfaceAlt,
            }} />
          </div>
          <div style={{ fontSize: 9, color: sasT.inkDim, fontWeight: 500 }}>{d.l}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────── Dash · Overview (Manager) ───────────────────
function SaSDashOverview() {
  const week = [{ l: 'Sen', v: 142 }, { l: 'Sel', v: 168 }, { l: 'Rab', v: 154 }, { l: 'Kam', v: 184, hl: true }, { l: 'Jum', v: 132 }, { l: 'Sab', v: 96 }, { l: 'Min', v: 38 }];
  const aiFeed = [
    { kind: 'escalate', who: 'Sari W.', what: 'auto-escalated → dr. Budi (Sp.A)', when: '2 mnt', color: sasT.danger },
    { kind: 'reply', who: 'Putri M.', what: 'AI menjawab via RAG · BPJS info', when: '8 mnt', color: sasT.primary },
    { kind: 'routing', who: 'Lina M.', what: 'di-routing ke CS · reschedule', when: '12 mnt', color: sasT.info },
    { kind: 'gap', who: 'KB Gap', what: '"QRIS payment" ditanya 4×', when: '30 mnt', color: sasT.warn },
    { kind: 'book', who: 'Rina A.', what: 'booking dr. Ratna Sen 18 Mei', when: '42 mnt', color: sasT.accent },
  ];

  return (
    <SaSDashShell active="overview" screenTitle="Overview" persona={{ name: 'Pak Hartono', role: 'Manager', initials: 'PH', hue: 200 }}>
      <div style={{ height: '100%', overflowY: 'auto', background: sasT.bg }} className="scroll">
        <div style={{ padding: '24px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: sasT.ink, letterSpacing: -0.4 }}>Selamat pagi, Pak Hartono</h2>
              <div style={{ fontSize: 12.5, color: sasT.inkMute, marginTop: 5 }}>Kamis, 14 Mei 2026 · Klinik Pusat berjalan normal — AI menangani 65% pesan secara otomatis.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Hari ini', '7 hari', '30 hari', 'Custom'].map((p, i) => (
                <span key={p} style={{
                  padding: '6px 12px', borderRadius: 100, fontSize: 11.5, fontWeight: 500,
                  background: i === 1 ? sasT.ink : sasT.surface,
                  color: i === 1 ? '#fff' : sasT.inkMute,
                  border: `1px solid ${i === 1 ? sasT.ink : sasT.border}`,
                  cursor: 'pointer',
                }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { l: 'Pesan masuk', v: '184', d: '+18% vs kemarin', dColor: sasT.primary, data: [120, 134, 142, 154, 168, 132, 184], icon: 'forum' },
            { l: 'Auto-resolved', v: '65.7%', d: '+4.1% · 121 pesan', dColor: sasT.primary, data: [54, 58, 60, 62, 63, 64, 65], icon: 'auto_awesome' },
            { l: 'Diteruskan ke staf', v: '12', d: '6.5% dari total', dColor: sasT.inkMute, data: [16, 14, 18, 22, 14, 12, 12], icon: 'forward' },
            { l: 'Respons rata-rata', v: '38d', d: '−8d vs minggu lalu', dColor: sasT.primary, data: [62, 58, 52, 48, 45, 42, 38], icon: 'timer' },
          ].map(k => (
            <div key={k.l} style={{ background: sasT.surface, borderRadius: 14, padding: 16, border: `1px solid ${sasT.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, color: sasT.inkMute, fontWeight: 500 }}>{k.l}</div>
                <Icon name={k.icon} size={16} color={sasT.inkDim} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: sasT.ink, letterSpacing: -0.6 }}>{k.v}</div>
                <SaSSpark data={k.data} w={88} h={32} />
              </div>
              <div style={{ fontSize: 10.5, color: k.dColor, marginTop: 4, fontWeight: 500 }}>{k.d}</div>
            </div>
          ))}
        </div>

        {/* split — volume + AI feature health */}
        <div style={{ padding: '18px 28px 0', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          <div style={{ background: sasT.surface, borderRadius: 14, padding: 18, border: `1px solid ${sasT.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: sasT.ink }}>Volume mingguan</h3>
                <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 3 }}>Pesan masuk vs auto-resolved · 7 hari terakhir</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: sasT.inkMute }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: sasT.primary }} /> Auto</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: sasT.surfaceAlt }} /> Total</span>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <SaSBars data={week} height={160} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '8px 12px', background: sasT.primarySoft, borderRadius: 8, fontSize: 11.5, color: sasT.primary }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <AIBadge label="Insight" bg={sasT.primary} fg="#fff" />
                Pesan naik 18% di Kamis — kemungkinan dampak campaign "Vaksin Anak".
              </span>
              <span style={{ fontWeight: 600 }}>Lihat detail →</span>
            </div>
          </div>

          <div style={{ background: sasT.surface, borderRadius: 14, padding: 18, border: `1px solid ${sasT.border}` }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: sasT.ink }}>Kesehatan fitur AI</h3>
            <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 3, marginBottom: 14 }}>6 modul · status real-time</div>
            {[
              { l: 'Gatekeeper', v: '99.8%', sub: 'safety filter', ok: true },
              { l: 'RAG retrieval', v: '94%', sub: 'top-1 accuracy', ok: true },
              { l: 'Doctor routing', v: '97%', sub: 'match rate', ok: true },
              { l: 'Smart reply', v: '4.6/5', sub: 'CS rating', ok: true },
              { l: 'Auto-tag', v: '91%', sub: 'precision', ok: true },
              { l: 'Triage urgency', v: '0.92', sub: 'recall · ↑ 3%', warn: true },
            ].map((m, i, arr) => (
              <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i ? `1px solid ${sasT.borderSoft}` : 'none' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.warn ? sasT.warn : sasT.primary }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: sasT.ink }}>{m.l}</div>
                  <div style={{ fontSize: 10.5, color: sasT.inkMute, marginTop: 1 }}>{m.sub}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: m.warn ? sasT.warn : sasT.ink }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* live AI feed + category breakdown */}
        <div style={{ padding: '14px 28px 28px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          <div style={{ background: sasT.surface, borderRadius: 14, padding: 18, border: `1px solid ${sasT.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: sasT.ink }}>Aktivitas AI live</h3>
              <span style={{ fontSize: 11, color: sasT.inkMute, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sasT.primary, animation: 'pulse-dot 1.5s infinite' }} />
                live
              </span>
            </div>
            <div style={{ position: 'relative', paddingLeft: 18 }}>
              <div style={{ position: 'absolute', left: 4, top: 6, bottom: 6, width: 1, background: sasT.borderSoft }} />
              {aiFeed.map((a, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
                  <span style={{ position: 'absolute', left: -18, top: 4, width: 9, height: 9, borderRadius: '50%', background: a.color, boxShadow: `0 0 0 3px ${sasT.surface}` }} />
                  <div style={{ fontSize: 12, color: sasT.ink, lineHeight: 1.5 }}>
                    <b>{a.who}</b> <span style={{ color: sasT.inkMute }}>{a.what}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: sasT.inkDim, marginTop: 2 }}>{a.when} lalu</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: sasT.surface, borderRadius: 14, padding: 18, border: `1px solid ${sasT.border}` }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: sasT.ink }}>Kategori pesan</h3>
            <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 3 }}>Auto-tag oleh Haiku · 7 hari</div>
            {/* horizontal bars */}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { l: 'Booking & jadwal', v: 38, color: sasT.primary },
                { l: 'Info klinik', v: 28, color: sasT.info },
                { l: 'Medis · konsul', v: 18, color: sasT.accent },
                { l: 'Lab & hasil', v: 9, color: sasT.warn },
                { l: 'BPJS · asuransi', v: 7, color: sasT.inkMute },
              ].map(c => (
                <div key={c.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: sasT.ink, marginBottom: 5 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <i style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                      {c.l}
                    </span>
                    <b style={{ fontWeight: 600 }}>{c.v}%</b>
                  </div>
                  <div style={{ height: 6, borderRadius: 100, background: sasT.surfaceAlt, overflow: 'hidden' }}>
                    <div style={{ width: `${c.v * 2}%`, height: '100%', background: c.color, borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SaSDashShell>
  );
}

// ─────────────────── Dash · Pasien detail ───────────────────
function SaSDashPasien() {
  const [tab, setTab] = React.useState('riwayat');
  const tabs = [
    { id: 'riwayat', l: 'Riwayat Kunjungan', n: 24 },
    { id: 'chat', l: 'Chat WA', n: 142 },
    { id: 'lab', l: 'Hasil Lab', n: 8 },
    { id: 'resep', l: 'Resep', n: 12 },
    { id: 'catatan', l: 'Catatan Dokter', n: 6 },
  ];

  const visits = [
    { d: '02 Mei 2026', dr: 'dr. Andi Wijaya', spec: 'Umum', diag: 'Hipertensi st. 1', status: 'selesai' },
    { d: '18 Apr 2026', dr: 'dr. Budi Santoso', spec: 'Anak (untuk Bima)', diag: 'Imunisasi MMR', status: 'selesai' },
    { d: '04 Apr 2026', dr: 'dr. Ratna Kusuma', spec: 'Obstetri', diag: 'Konsul rutin', status: 'selesai' },
    { d: '21 Mar 2026', dr: 'dr. Siti Nurbaya', spec: 'PD', diag: 'Cek fungsi tiroid', status: 'selesai' },
    { d: '15 Feb 2026', dr: 'dr. Andi Wijaya', spec: 'Umum', diag: 'Demam, ISPA', status: 'selesai' },
  ];

  return (
    <SaSDashShell active="pasien" screenTitle="Pasien / Sari Wulandari" persona={{ name: 'Rizka Sari', role: 'Customer Service', initials: 'RS', hue: 350 }}>
      <div style={{ height: '100%', display: 'flex', background: sasT.bg }}>
        {/* main */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', minWidth: 0 }} className="scroll">
          {/* patient header */}
          <div style={{ background: sasT.surface, borderRadius: 16, padding: 22, border: `1px solid ${sasT.border}`, display: 'flex', alignItems: 'center', gap: 18 }}>
            <Avatar initials="SW" hue={28} size={72} ring ringColor={sasT.bg} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: sasT.ink, letterSpacing: -0.3 }}>Sari Wulandari</h2>
                <Chip bg={sasT.primarySoft} fg={sasT.primary}>● Pasien aktif</Chip>
                <Chip bg={sasT.surfaceDim} fg={sasT.inkMute}>BPJS Kelas 2</Chip>
              </div>
              <div style={{ fontSize: 12, color: sasT.inkMute, marginTop: 6, display: 'flex', gap: 14 }}>
                <span>♀ 32 thn · 14 Sep 1993</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: sasT.inkDim, alignSelf: 'center' }} />
                <span>+62 812-3456-7890</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: sasT.inkDim, alignSelf: 'center' }} />
                <span>sari.w@gmail.com</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: sasT.inkDim, alignSelf: 'center' }} />
                <span>Pasien sejak Jan 2024</span>
              </div>
            </div>
            <button style={{ padding: '8px 14px', background: sasT.surfaceDim, border: `1px solid ${sasT.border}`, borderRadius: 8, fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, color: sasT.ink }}>
              <Icon name="chat" size={14} /> Buka chat
            </button>
            <button style={{ padding: '8px 14px', background: sasT.ink, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="event_available" size={14} /> Buat janji
            </button>
          </div>

          {/* quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            {[
              { l: 'Total kunjungan', v: '24', sub: 'sejak Jan 2024' },
              { l: 'Terakhir', v: '02 Mei', sub: 'dr. Andi · Umum' },
              { l: 'Anggota keluarga', v: '2', sub: 'Bima, Rendra' },
              { l: 'Alergi', v: '—', sub: 'tidak diketahui', warn: true },
            ].map(s => (
              <div key={s.l} style={{ background: sasT.surface, borderRadius: 12, padding: '12px 14px', border: `1px solid ${sasT.border}` }}>
                <div style={{ fontSize: 11, color: sasT.inkMute, fontWeight: 500 }}>{s.l}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: s.warn ? sasT.warn : sasT.ink, marginTop: 4, letterSpacing: -0.3 }}>{s.v}</div>
                <div style={{ fontSize: 10.5, color: sasT.inkDim, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 22, borderBottom: `1px solid ${sasT.border}` }}>
            {tabs.map(t => {
              const on = t.id === tab;
              return (
                <div key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '10px 14px 11px', borderBottom: `2px solid ${on ? sasT.ink : 'transparent'}`,
                  color: on ? sasT.ink : sasT.inkMute, fontSize: 12.5, fontWeight: on ? 600 : 500,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {t.l}
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', background: on ? sasT.ink : sasT.surfaceAlt, color: on ? '#fff' : sasT.inkMute, borderRadius: 100 }}>{t.n}</span>
                </div>
              );
            })}
          </div>

          {/* visit timeline */}
          <div style={{ marginTop: 18, background: sasT.surface, borderRadius: 14, padding: 4, border: `1px solid ${sasT.border}` }}>
            {visits.map((v, i, arr) => (
              <div key={i} style={{
                padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'center',
                borderBottom: i < arr.length - 1 ? `1px solid ${sasT.borderSoft}` : 'none',
              }}>
                <div style={{ width: 60, fontSize: 11, color: sasT.inkMute, fontWeight: 500 }}>{v.d}</div>
                <div style={{ width: 1, height: 32, background: sasT.borderSoft }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: sasT.ink }}>{v.dr}</div>
                  <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 2 }}>{v.spec} · <span style={{ color: sasT.ink, fontWeight: 500 }}>{v.diag}</span></div>
                </div>
                <Chip bg={sasT.primarySoft} fg={sasT.primary}>✓ {v.status}</Chip>
                <Icon name="chevron_right" size={18} color={sasT.inkDim} />
              </div>
            ))}
          </div>
        </div>

        {/* right rail */}
        <div style={{ width: 320, borderLeft: `1px solid ${sasT.borderSoft}`, padding: '24px 22px', overflowY: 'auto', background: sasT.bg }} className="scroll">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <AIBadge label="AI Summary" bg={sasT.primary} fg="#fff" />
          </div>
          <div style={{ fontSize: 13.5, color: sasT.ink, lineHeight: 1.55, padding: 14, background: sasT.primarySoft, borderRadius: 12, border: `1px solid ${sasT.primaryDim}` }}>
            Pasien rutin (24 kunjungan, 16 bln). Riwayat <b>hipertensi st.1</b> sejak Feb 2026 — kontrol bulanan dengan dr. Andi. Tidak ada alergi terdaftar — <span style={{ color: sasT.warn }}>perlu konfirmasi</span>. Komunikasi via WA, responsif. Sentimen chat: positif.
          </div>

          <div style={{ marginTop: 18, fontSize: 11, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Resep aktif</div>
          <div style={{ background: sasT.surface, borderRadius: 12, border: `1px solid ${sasT.border}`, padding: 12 }}>
            {[
              { n: 'Amlodipine 5mg', d: '1x sehari · pagi', expires: '28 Mei' },
              { n: 'Vit. B-Complex', d: '1x sehari · sesudah makan', expires: '15 Jun' },
            ].map((r, i) => (
              <div key={r.n} style={{ padding: '8px 0', borderTop: i ? `1px solid ${sasT.borderSoft}` : 'none' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: sasT.ink }}>{r.n}</div>
                <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 2 }}>{r.d}</div>
                <div style={{ fontSize: 10, color: sasT.warn, marginTop: 4 }}>↻ habis {r.expires}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, fontSize: 11, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Janji mendatang</div>
          <div style={{ background: sasT.surface, borderRadius: 12, border: `1px solid ${sasT.border}`, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 50, borderRadius: 10, background: sasT.accentDim, color: sasT.accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>JUM</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>15</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: sasT.ink }}>dr. Ratna Kusuma</div>
              <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 2 }}>10:30 · USG kandungan</div>
            </div>
          </div>
        </div>
      </div>
    </SaSDashShell>
  );
}

// ─────────────────── Dash · Dokter ───────────────────
function SaSDashDokter() {
  return (
    <SaSDashShell active="dokter" screenTitle="Manajemen Dokter" persona={{ name: 'Rizka Sari', role: 'Admin', initials: 'RA', hue: 350 }}>
      <div style={{ height: '100%', overflowY: 'auto', background: sasT.bg, padding: '24px 28px' }} className="scroll">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: sasT.ink, letterSpacing: -0.3 }}>Dokter</h2>
            <div style={{ fontSize: 12.5, color: sasT.inkMute, marginTop: 4 }}>5 dokter aktif · digunakan oleh AI doctor routing untuk arahkan pasien.</div>
          </div>
          <button style={{
            padding: '9px 16px', background: sasT.ink, color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}><Icon name="add" size={14} /> Tambah Dokter</button>
        </div>

        {/* filter row */}
        <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 100, width: 320 }}>
            <Icon name="search" size={16} color={sasT.inkDim} />
            <span style={{ fontSize: 12, color: sasT.inkDim }}>Cari nama atau spesialisasi…</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['Semua', 'Online', 'Off duty'].map((f, i) => (
              <span key={f} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 11.5, fontWeight: 500, background: i === 0 ? sasT.ink : sasT.surface, color: i === 0 ? '#fff' : sasT.inkMute, border: `1px solid ${i === 0 ? sasT.ink : sasT.border}` }}>{f}</span>
            ))}
          </div>
        </div>

        {/* doctors grid */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {SehatiData.doctors.map((d, i) => {
            const online = i % 2 === 0;
            return (
              <div key={d.id} style={{ background: sasT.surface, borderRadius: 14, padding: 18, border: `1px solid ${sasT.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar initials={d.initials} hue={d.hue} size={48} ring ringColor={sasT.surface} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: sasT.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 2 }}>{d.spec}</div>
                  </div>
                  <Chip bg={online ? sasT.primarySoft : sasT.surfaceDim} fg={online ? sasT.primary : sasT.inkMute}>
                    ● {online ? 'online' : 'off duty'}
                  </Chip>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${sasT.borderSoft}` }}>
                  {[
                    { l: 'Janji', v: 24 + i * 3 },
                    { l: 'Match', v: `${92 + i}%` },
                    { l: 'Respon', v: `${4 + i}m` },
                  ].map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: sasT.ink, letterSpacing: -0.2 }}>{s.v}</div>
                      <div style={{ fontSize: 9.5, color: sasT.inkMute, letterSpacing: 0.4, fontWeight: 500, marginTop: 1 }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* schedule chips */}
                <div style={{ marginTop: 14, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum'].map((day, j) => {
                    const has = j === 0 || j === 2 || j === 4;
                    return (
                      <span key={day} style={{
                        padding: '3px 9px', fontSize: 10.5, fontWeight: 500, borderRadius: 100,
                        background: has ? sasT.primarySoft : 'transparent',
                        color: has ? sasT.primary : sasT.inkDim,
                        border: has ? 'none' : `1px solid ${sasT.borderSoft}`,
                      }}>{day}</span>
                    );
                  })}
                </div>

                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, padding: '7px 0', background: 'transparent', border: `1px solid ${sasT.border}`, borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: sasT.ink, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                  <button style={{ flex: 1, padding: '7px 0', background: 'transparent', border: `1px solid ${sasT.border}`, borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: sasT.ink, cursor: 'pointer', fontFamily: 'inherit' }}>Jadwal</button>
                  <button style={{ width: 32, padding: 0, background: 'transparent', border: `1px solid ${sasT.border}`, borderRadius: 8, color: sasT.inkMute, cursor: 'pointer' }}><Icon name="more_horiz" size={14} /></button>
                </div>
              </div>
            );
          })}
          {/* AI routing card */}
          <div style={{ background: sasT.primarySoft, borderRadius: 14, padding: 18, border: `1px solid ${sasT.primaryDim}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AIBadge label="Doctor Routing" bg={sasT.primary} fg="#fff" />
            </div>
            <h3 style={{ margin: '12px 0 4px', fontSize: 14, fontWeight: 600, color: sasT.ink }}>AI mengarahkan ke dokter yang tepat</h3>
            <div style={{ fontSize: 11.5, color: sasT.inkMute, lineHeight: 1.55 }}>
              Sonnet mencocokkan pesan pasien dengan spesialisasi, jadwal & beban kerja dokter. Atur prioritas routing di sini.
            </div>
            <div style={{ flex: 1 }} />
            <button style={{
              marginTop: 14, padding: '9px 0', background: sasT.primary, color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>Atur Routing Rules <Icon name="arrow_forward" size={13} /></button>
          </div>
        </div>
      </div>
    </SaSDashShell>
  );
}

Object.assign(window, { SaSDashOverview, SaSDashPasien, SaSDashDokter });
