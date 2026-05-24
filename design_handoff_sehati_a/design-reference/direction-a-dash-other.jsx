/* global React, Avatar, Icon, Chip, AIBadge, sasT, SehatiData, SaSDashShell */

// ─────────────────── Dashboard 2 · Kalender ───────────────────
function SaSDashCalendar() {
  const days = ['SEN 11', 'SEL 12', 'RAB 13', 'KAM 14', 'JUM 15', 'SAB 16', 'MIN 17'];
  const hours = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

  // event positions (day index, start hour decimal, duration hours, dr id, patient, status)
  const events = [
    { day: 0, start: 9, dur: 0.5, dr: 'dr1', p: 'Putri Maharani', status: 'confirmed' },
    { day: 0, start: 14.5, dur: 1, dr: 'dr3', p: 'Bima Saputra', status: 'urgent' },
    { day: 1, start: 10, dur: 0.5, dr: 'dr1', p: 'Lina M.', status: 'confirmed' },
    { day: 2, start: 8.5, dur: 0.75, dr: 'dr2', p: 'Ahmad Fauzi', status: 'confirmed' },
    { day: 2, start: 13, dur: 1, dr: 'dr1', p: 'Rina A.', status: 'confirmed' },
    { day: 3, start: 11, dur: 0.5, dr: 'dr3', p: 'Dewi Anggraini', status: 'confirmed' },
    { day: 4, start: 10, dur: 1, dr: 'dr1', p: 'Sari W.', status: 'confirmed' },
    { day: 4, start: 13.5, dur: 0.5, dr: 'dr2', p: 'Almas', status: 'pending' },
    { day: 4, start: 15, dur: 0.5, dr: 'dr1', p: 'Pak Hadi', status: 'confirmed' },
    { day: 5, start: 9, dur: 1, dr: 'dr2', p: 'Indra T.', status: 'confirmed' },
    { day: 6, start: 13, dur: 1, dr: 'dr1', p: 'Bu Tati', status: 'confirmed' },
  ];

  const drColor = (id) => {
    if (id === 'dr1') return { bg: sasT.primary, soft: sasT.primarySoft, dark: '#3F5A40' };
    if (id === 'dr2') return { bg: sasT.info, soft: sasT.infoDim, dark: '#264350' };
    if (id === 'dr3') return { bg: sasT.accent, soft: sasT.accentDim, dark: '#7A3E26' };
    return { bg: sasT.warn, soft: sasT.warnDim, dark: '#7A4711' };
  };

  const HOUR_H = 46;
  const TOP_H = 36;

  return (
    <SaSDashShell active="kalender" screenTitle="Kalender" persona={{ name: 'Baril Setiawan', role: 'Asisten Dokter', initials: 'BA', hue: 350 }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: sasT.bg }}>
        {/* page header */}
        <div style={{ padding: '20px 28px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: sasT.ink, letterSpacing: -0.3 }}>Kalender</h2>
            <div style={{ fontSize: 12.5, color: sasT.inkMute, marginTop: 4 }}>11 Mei – 17 Mei 2026 · 28 janji minggu ini</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 8, overflow: 'hidden' }}>
              {['Hari', 'Minggu', 'Bulan'].map((v, i) => (
                <button key={v} style={{
                  padding: '6px 14px', fontSize: 12, fontFamily: 'inherit',
                  background: i === 1 ? sasT.ink : 'transparent',
                  color: i === 1 ? '#fff' : sasT.ink,
                  border: 'none', cursor: 'pointer', fontWeight: i === 1 ? 600 : 400,
                }}>{v}</button>
              ))}
            </div>
            <button style={{ padding: '6px 12px', background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>← Minggu lalu</button>
            <button style={{ padding: '6px 12px', background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: sasT.primary, fontWeight: 600 }}>Hari ini</button>
            <button style={{ padding: '6px 12px', background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Minggu depan →</button>
            <button style={{ padding: '7px 14px', background: sasT.ink, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="add" size={14} /> Janji baru
            </button>
          </div>
        </div>

        {/* doctor legend */}
        <div style={{ padding: '0 28px 14px', display: 'flex', gap: 16, alignItems: 'center' }}>
          {SehatiData.doctors.slice(0, 3).map(d => {
            const c = drColor(d.id);
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: sasT.inkMute }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.bg }} />
                {d.name}
              </div>
            );
          })}
          <div style={{ marginLeft: 'auto', fontSize: 11, color: sasT.inkDim, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AIBadge label="AI" bg={sasT.surfaceAlt} fg={sasT.inkMute} />
            3 slot rekomendasi untuk pasien antri
          </div>
        </div>

        {/* grid */}
        <div style={{ flex: 1, margin: '0 28px 24px', background: sasT.surface, borderRadius: 14, border: `1px solid ${sasT.border}`, boxShadow: '0 1px 3px rgba(45,30,10,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* day header */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: `1px solid ${sasT.borderSoft}`, background: sasT.bg }}>
            <div />
            {days.map((d, i) => {
              const today = i === 3;
              return (
                <div key={d} style={{
                  padding: '10px 12px', borderLeft: `1px solid ${sasT.borderSoft}`,
                  background: today ? sasT.primarySoft : 'transparent',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: today ? sasT.primary : sasT.inkMute, letterSpacing: 0.5 }}>{d.split(' ')[0]}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: today ? sasT.primary : sasT.ink, marginTop: 2 }}>{d.split(' ')[1]}</div>
                </div>
              );
            })}
          </div>

          {/* body */}
          <div className="scroll" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', position: 'relative' }}>
              {/* hour column */}
              <div>
                {hours.map(h => (
                  <div key={h} style={{ height: HOUR_H, borderBottom: `1px solid ${sasT.borderSoft}`, padding: '4px 8px', fontSize: 10, color: sasT.inkDim, textAlign: 'right' }}>
                    {h}:00
                  </div>
                ))}
              </div>
              {/* day columns */}
              {days.map((d, di) => (
                <div key={d} style={{ borderLeft: `1px solid ${sasT.borderSoft}`, position: 'relative', background: di === 3 ? 'rgba(94,122,94,0.025)' : 'transparent' }}>
                  {hours.map(h => (
                    <div key={h} style={{ height: HOUR_H, borderBottom: `1px solid ${sasT.borderSoft}` }} />
                  ))}
                  {events.filter(e => e.day === di).map((e, i) => {
                    const c = drColor(e.dr);
                    const top = (e.start - 7) * HOUR_H + 2;
                    const h = e.dur * HOUR_H - 4;
                    const urgent = e.status === 'urgent';
                    return (
                      <div key={i} style={{
                        position: 'absolute', left: 4, right: 4, top, height: h,
                        background: urgent ? sasT.danger : c.bg,
                        color: '#fff',
                        borderRadius: 6, padding: '4px 7px', fontSize: 10.5, fontWeight: 500,
                        overflow: 'hidden', cursor: 'pointer',
                        boxShadow: `inset 3px 0 0 ${urgent ? '#7A2926' : c.dark}`,
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 11 }}>{Math.floor(e.start)}:{String((e.start % 1) * 60).padStart(2, '0')} · {e.p}</div>
                        <div style={{ opacity: 0.85, fontSize: 9.5, marginTop: 1 }}>
                          {urgent ? '🔴 ' : ''}{SehatiData.doctors.find(d => d.id === e.dr).spec}
                        </div>
                      </div>
                    );
                  })}
                  {/* current-time line on today */}
                  {di === 3 && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: (10.7 - 7) * HOUR_H, height: 2, background: sasT.accent, zIndex: 2 }}>
                      <div style={{ position: 'absolute', left: -4, top: -3, width: 8, height: 8, borderRadius: '50%', background: sasT.accent }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SaSDashShell>
  );
}

// ─────────────────── Dashboard 3 · Knowledge Base ───────────────────
function SaSDashKB() {
  const [activeTab, setActiveTab] = React.useState('qa');
  const qaList = [
    { q: 'Apakah klinik menerima BPJS?', tags: ['bpjs', 'info'], status: 'aktif', hits: 142 },
    { q: 'Jam buka klinik hari Minggu?', tags: ['jam-buka', 'info'], status: 'aktif', hits: 98 },
    { q: 'Cara booking dokter spesialis kandungan', tags: ['booking', 'obgyn'], status: 'aktif', hits: 81 },
    { q: 'Berapa biaya konsultasi umum?', tags: ['biaya', 'info'], status: 'aktif', hits: 76 },
    { q: 'Apakah ada layanan vaksin anak?', tags: ['anak', 'vaksin'], status: 'aktif', hits: 64 },
    { q: 'Lokasi parkir klinik', tags: ['lokasi'], status: 'draft', hits: 0 },
  ];

  return (
    <SaSDashShell active="qa" screenTitle="Q&A Baru" persona={{ name: 'Rizka Sari', role: 'Admin', initials: 'RA', hue: 350 }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: sasT.bg }}>
        <div style={{ padding: '20px 28px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: sasT.inkMute, marginBottom: 4 }}>Knowledge Base · Q&A</div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: sasT.ink, letterSpacing: -0.3 }}>Q&A pairs untuk RAG</h2>
            <div style={{ fontSize: 12.5, color: sasT.inkMute, marginTop: 4 }}>
              Pasangan tanya-jawab yang di-embed dengan Voyage AI untuk grounded auto-reply.
            </div>
          </div>
          <button style={{
            padding: '9px 16px', background: sasT.ink, color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="add" size={14} /> Q&A Baru
          </button>
        </div>

        {/* KPI strip */}
        <div style={{ padding: '16px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { l: 'Q&A aktif', v: '142', sub: '+8 minggu ini', icon: 'forum', tint: sasT.primary, tintBg: sasT.primarySoft },
            { l: 'Dokumen', v: '38', sub: '6.2k chunks', icon: 'description', tint: sasT.info, tintBg: sasT.infoDim },
            { l: 'Retrieval acc.', v: '94%', sub: '↑ 2.1% 30 hari', icon: 'check_circle', tint: sasT.primary, tintBg: sasT.primarySoft },
            { l: 'KB Gaps', v: '7', sub: 'menunggu jawaban', icon: 'manage_search', tint: sasT.warn, tintBg: sasT.warnDim },
          ].map(k => (
            <div key={k.l} style={{ background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: sasT.inkMute, letterSpacing: 0.3, fontWeight: 500 }}>{k.l}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, color: sasT.ink, marginTop: 4, letterSpacing: -0.5, fontFamily: '"Poppins", system-ui' }}>{k.v}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: k.tintBg, color: k.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={k.icon} size={18} />
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: sasT.inkMute, marginTop: 6 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* main split */}
        <div style={{ flex: 1, padding: '18px 28px 24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, minHeight: 0 }}>
          {/* qa list */}
          <div style={{ background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${sasT.borderSoft}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="search" size={16} color={sasT.inkMute} />
              <span style={{ fontSize: 12, color: sasT.inkDim, flex: 1 }}>Cari pertanyaan, tag…</span>
              <span style={{ fontSize: 11, color: sasT.inkMute }}>Sort: Hits ↓</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }} className="scroll">
              {qaList.map((q, i) => (
                <div key={i} style={{ padding: '13px 16px', borderBottom: i < qaList.length - 1 ? `1px solid ${sasT.borderSoft}` : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: q.status === 'aktif' ? sasT.primarySoft : sasT.surfaceDim, color: q.status === 'aktif' ? sasT.primary : sasT.inkDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="quiz" size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: sasT.ink }}>{q.q}</div>
                    <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                      {q.tags.map(t => <Chip key={t} bg={sasT.surfaceDim} fg={sasT.inkMute}>#{t}</Chip>)}
                      <Chip bg={q.status === 'aktif' ? sasT.primarySoft : sasT.warnDim} fg={q.status === 'aktif' ? sasT.primary : sasT.warn}>{q.status}</Chip>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: sasT.ink }}>{q.hits}</div>
                    <div style={{ fontSize: 9.5, color: sasT.inkDim, letterSpacing: 0.3 }}>hits 30hr</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <div style={{ background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <AIBadge label="RAG Preview" bg={sasT.primary} fg="#fff" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: sasT.ink, marginTop: 4 }}>Coba simulasi retrieval</div>
              <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 3 }}>Cek apakah Q&A ini terambil saat pasien tanya hal serupa.</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <input
                  defaultValue="apakah klinik terima BPJS untuk anak?"
                  style={{ flex: 1, padding: '9px 12px', border: `1px solid ${sasT.border}`, borderRadius: 8, fontSize: 12.5, color: sasT.ink, fontFamily: 'inherit', background: sasT.bg, outline: 'none' }}
                />
                <button style={{ padding: '9px 14px', background: sasT.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cari di KB</button>
              </div>
              <div style={{ marginTop: 14, padding: 12, background: sasT.primarySoft, borderRadius: 10, border: `1px solid ${sasT.primaryDim}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: sasT.primary, letterSpacing: 0.4, textTransform: 'uppercase' }}>Top match · 0.91</span>
                  <Icon name="check_circle" size={14} color={sasT.primary} filled />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: sasT.ink, marginTop: 6 }}>"Apakah klinik menerima BPJS?"</div>
                <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 4, lineHeight: 1.5 }}>
                  Ya, klinik Sehati menerima BPJS untuk semua poli umum dan spesialis. Wajib bawa kartu BPJS aktif & rujukan FKTP (kecuali emergency)…
                </div>
              </div>
              <div style={{ marginTop: 8, padding: 10, background: sasT.surfaceDim, borderRadius: 10, opacity: 0.85 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.4, textTransform: 'uppercase' }}>Match · 0.62</span>
                </div>
                <div style={{ fontSize: 12, color: sasT.inkMute, marginTop: 4 }}>"Berapa biaya konsultasi umum?"</div>
              </div>
            </div>

            <div style={{ flex: 1, background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 14, padding: 18, minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: sasT.ink }}>KB Gaps · butuh jawaban</div>
                <span style={{ fontSize: 11, color: sasT.warn, fontWeight: 500 }}>7 baru</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { q: 'Apakah klinik buka di hari libur nasional?', n: 8 },
                  { q: 'Cara reschedule appointment via WhatsApp', n: 6 },
                  { q: 'Pembayaran via QRIS apakah bisa?', n: 4 },
                ].map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: sasT.bg, borderRadius: 8, border: `1px solid ${sasT.borderSoft}` }}>
                    <Icon name="help_outline" size={14} color={sasT.warn} />
                    <div style={{ flex: 1, fontSize: 12, color: sasT.ink }}>{g.q}</div>
                    <Chip bg={sasT.warnDim} fg={sasT.warn}>{g.n}× ditanya</Chip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SaSDashShell>
  );
}

Object.assign(window, { SaSDashCalendar, SaSDashKB });
