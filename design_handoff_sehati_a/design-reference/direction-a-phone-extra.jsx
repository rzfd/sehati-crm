/* global React, AndroidDevice, Avatar, Icon, Chip, AIBadge, sasT, SehatiData */

// ─────────────────── 4) Phone — Booking Confirmation / Ticket ───────────────────
function SaSPhoneConfirm() {
  return (
    <AndroidDevice width={360} height={720}>
      <div style={{ background: sasT.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="close" size={22} color={sasT.ink} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: sasT.ink, textAlign: 'center' }}>Booking Berhasil</div>
          <Icon name="share" size={20} color={sasT.inkMute} />
        </div>

        {/* success badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 22px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: sasT.primarySoft, color: sasT.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="check" size={36} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: sasT.ink, marginTop: 14, letterSpacing: -0.2 }}>Janji Anda terkonfirmasi</div>
          <div style={{ fontSize: 12, color: sasT.inkMute, marginTop: 4 }}>No. tiket · SHT-2026-08412</div>
        </div>

        {/* ticket card */}
        <div style={{ margin: '0 16px', background: sasT.surface, borderRadius: 18, border: `1px solid ${sasT.border}`, overflow: 'hidden', boxShadow: '0 4px 12px rgba(45,30,10,0.04)' }}>
          <div style={{ padding: '16px 18px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar initials="RK" hue={142} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: sasT.ink }}>dr. Ratna Kusuma, Sp.OG</div>
                <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 1 }}>Obstetri & Ginekologi</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
              {[
                { l: 'Tanggal', v: 'Jum, 15 Mei 2026' },
                { l: 'Waktu', v: '10:30 — 11:00' },
                { l: 'Ruang', v: 'Poli 2 · Lt. 1' },
                { l: 'Biaya', v: 'Rp 150.000' },
              ].map(r => (
                <div key={r.l}>
                  <div style={{ fontSize: 10, color: sasT.inkMute, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 500 }}>{r.l}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: sasT.ink, marginTop: 3 }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* dashed divider */}
          <div style={{ position: 'relative', height: 18 }}>
            <div style={{ position: 'absolute', left: -8, top: 4, width: 16, height: 16, borderRadius: '50%', background: sasT.bg }} />
            <div style={{ position: 'absolute', right: -8, top: 4, width: 16, height: 16, borderRadius: '50%', background: sasT.bg }} />
            <div style={{ position: 'absolute', left: 14, right: 14, top: 11, height: 1, borderTop: `1.5px dashed ${sasT.border}` }} />
          </div>

          {/* QR */}
          <div style={{ padding: '4px 18px 18px', textAlign: 'center' }}>
            <div style={{
              width: 132, height: 132, margin: '0 auto', borderRadius: 10,
              background: `repeating-linear-gradient(45deg, ${sasT.ink} 0 6px, transparent 6px 8px), repeating-linear-gradient(-45deg, ${sasT.ink} 0 4px, transparent 4px 7px)`,
              border: `8px solid ${sasT.surface}`, boxShadow: `inset 0 0 0 1px ${sasT.border}`,
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: '40% 40%', background: sasT.surface, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: sasT.primary, fontSize: 10 }}>S</div>
            </div>
            <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 8 }}>Tunjukkan QR ini ke resepsionis</div>
          </div>
        </div>

        {/* reminder + actions */}
        <div style={{ padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: sasT.warnDim, borderRadius: 12 }}>
            <Icon name="notifications_active" size={18} color={sasT.warn} />
            <div style={{ flex: 1, fontSize: 11.5, color: sasT.ink, lineHeight: 1.45 }}>
              Pengingat dikirim H-1 & 2 jam sebelum janji.
            </div>
            <div style={{ width: 32, height: 18, borderRadius: 100, background: sasT.warn, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8 }}>
          <button style={{
            padding: '12px 0', background: sasT.surface, color: sasT.ink, border: `1px solid ${sasT.border}`,
            borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="event" size={14} /> Add Calendar
          </button>
          <button style={{
            padding: '12px 0', background: sasT.ink, color: '#fff', border: 'none',
            borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            Buka lokasi <Icon name="map" size={14} />
          </button>
        </div>
      </div>
    </AndroidDevice>
  );
}

// ─────────────────── 5) Phone — Riwayat ───────────────────
function SaSPhoneRiwayat() {
  const [tab, setTab] = React.useState('janji');
  const tabs = [{ id: 'janji', l: 'Janji', n: 12 }, { id: 'lab', l: 'Hasil Lab', n: 4 }, { id: 'resep', l: 'Resep', n: 7 }];

  const items = [
    { d: '15', m: 'Mei', y: '2026', t: '10:30', dr: 'dr. Ratna Kusuma', sub: 'Obstetri · USG kandungan', status: 'akan datang' },
    { d: '02', m: 'Mei', y: '2026', t: '14:00', dr: 'dr. Andi Wijaya', sub: 'Umum · Kontrol darah', status: 'selesai', diag: 'Hipertensi stadium 1' },
    { d: '18', m: 'Apr', y: '2026', t: '09:30', dr: 'dr. Budi Santoso', sub: 'Anak · Vaksin Bima', status: 'selesai', diag: 'Imunisasi MMR' },
    { d: '04', m: 'Apr', y: '2026', t: '15:00', dr: 'dr. Ratna Kusuma', sub: 'Obstetri · Konsul', status: 'selesai' },
    { d: '21', m: 'Mar', y: '2026', t: '11:00', dr: 'dr. Siti Nurbaya', sub: 'PD · Cek tiroid', status: 'selesai' },
  ];

  return (
    <AndroidDevice width={360} height={720}>
      <div style={{ background: sasT.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px 4px' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: sasT.ink, letterSpacing: -0.4 }}>Riwayat</h1>
          <div style={{ fontSize: 12, color: sasT.inkMute, marginTop: 2 }}>Semua janji, lab, & resep Anda</div>
        </div>

        <div style={{ padding: '14px 18px 8px', display: 'flex', gap: 6 }}>
          {tabs.map(t => {
            const on = t.id === tab;
            return (
              <span key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 12,
                background: on ? sasT.ink : sasT.surface,
                color: on ? '#fff' : sasT.inkMute,
                border: `1px solid ${on ? sasT.ink : sasT.border}`,
                fontWeight: 500, cursor: 'pointer',
              }}>{t.l} <span style={{ opacity: on ? 0.7 : 0.6, marginLeft: 2 }}>{t.n}</span></span>
            );
          })}
        </div>

        <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 12px' }}>
          {items.map((it, i) => {
            const upcoming = it.status === 'akan datang';
            return (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'stretch' }}>
                {/* date column */}
                <div style={{
                  width: 50, padding: '8px 0', borderRadius: 10, textAlign: 'center', flexShrink: 0,
                  background: upcoming ? sasT.primarySoft : sasT.surface,
                  color: upcoming ? sasT.primary : sasT.ink,
                  border: `1px solid ${upcoming ? sasT.primaryDim : sasT.border}`,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.5, opacity: 0.7 }}>{it.m.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.1, marginTop: 1 }}>{it.d}</div>
                  <div style={{ fontSize: 9, color: sasT.inkDim, marginTop: 2 }}>{it.t}</div>
                </div>

                {/* details */}
                <div style={{ flex: 1, background: sasT.surface, padding: 12, borderRadius: 12, border: `1px solid ${sasT.border}`, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: sasT.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.dr}</div>
                      <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 2 }}>{it.sub}</div>
                    </div>
                    <Chip
                      bg={upcoming ? sasT.primarySoft : sasT.surfaceDim}
                      fg={upcoming ? sasT.primary : sasT.inkMute}
                    >{upcoming ? '↑ datang' : '✓ selesai'}</Chip>
                  </div>
                  {it.diag && (
                    <div style={{ marginTop: 8, padding: 8, background: sasT.bg, borderRadius: 8, fontSize: 11, color: sasT.inkMute, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="medical_information" size={13} color={sasT.accent} />
                      Diagnosis: <b style={{ color: sasT.ink, fontWeight: 500 }}>{it.diag}</b>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', borderTop: `1px solid ${sasT.borderSoft}`, background: sasT.surface, padding: '6px 4px 8px' }}>
          {[
            { id: 'home', icon: 'home', label: 'Beranda' },
            { id: 'chat', icon: 'chat_bubble', label: 'Chat' },
            { id: 'r', icon: 'history', label: 'Riwayat', on: true },
            { id: 'me', icon: 'person', label: 'Profil' },
          ].map(it => (
            <div key={it.id} style={{ flex: 1, textAlign: 'center', padding: 6, color: it.on ? sasT.primary : sasT.inkDim }}>
              <Icon name={it.icon} size={22} filled={it.on} />
              <div style={{ fontSize: 10.5, fontWeight: it.on ? 600 : 400, marginTop: 2 }}>{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AndroidDevice>
  );
}

// ─────────────────── 6) Phone — Profile ───────────────────
function SaSPhoneProfile() {
  return (
    <AndroidDevice width={360} height={720}>
      <div style={{ background: sasT.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: sasT.ink, letterSpacing: -0.3 }}>Profil</h1>
          <Icon name="settings" size={22} color={sasT.inkMute} />
        </div>

        <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 12px' }}>
          {/* identity card */}
          <div style={{ background: sasT.ink, color: '#fff', borderRadius: 16, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(94,122,94,0.18)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials="SW" hue={28} size={52} ring ringColor="rgba(255,255,255,0.15)" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Sari Wulandari</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Pasien sejak Jan 2024</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                {[
                  { l: 'Kunjungan', v: '24' },
                  { l: 'Janji', v: '1' },
                  { l: 'Poin', v: '1.2k' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{s.v}</div>
                    <div style={{ fontSize: 10, opacity: 0.65, marginTop: 1 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BPJS card */}
          <div style={{ marginTop: 14, padding: 14, background: sasT.surface, border: `1px solid ${sasT.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 30, borderRadius: 4, background: sasT.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>BPJS</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: sasT.ink }}>0001 2345 6789 012</div>
              <div style={{ fontSize: 10.5, color: sasT.inkMute, marginTop: 2 }}>Aktif · Kelas 2</div>
            </div>
            <Icon name="chevron_right" size={18} color={sasT.inkDim} />
          </div>

          {/* Keluarga */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase' }}>Keluarga</div>
              <div style={{ fontSize: 11, color: sasT.primary, fontWeight: 500 }}>+ Tambah</div>
            </div>
            <div style={{ background: sasT.surface, borderRadius: 14, border: `1px solid ${sasT.border}`, overflow: 'hidden' }}>
              {[
                { n: 'Bima Saputra', r: 'Anak · 4 thn', i: 'BS', hue: 18 },
                { n: 'Rendra Saputra', r: 'Suami · 38 thn', i: 'RS', hue: 200 },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderTop: i ? `1px solid ${sasT.borderSoft}` : 'none' }}>
                  <Avatar initials={m.i} hue={m.hue} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: sasT.ink }}>{m.n}</div>
                    <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 2 }}>{m.r}</div>
                  </div>
                  <Icon name="chevron_right" size={16} color={sasT.inkDim} />
                </div>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Pengaturan</div>
            <div style={{ background: sasT.surface, borderRadius: 14, border: `1px solid ${sasT.border}` }}>
              {[
                { i: 'notifications', l: 'Notifikasi', sub: 'Pengingat janji & promo' },
                { i: 'lock', l: 'Keamanan & Login', sub: '2FA aktif · PIN' },
                { i: 'language', l: 'Bahasa', sub: 'Bahasa Indonesia' },
                { i: 'help', l: 'Bantuan & FAQ' },
                { i: 'logout', l: 'Keluar', danger: true },
              ].map((m, i, arr) => (
                <div key={m.l} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderTop: i ? `1px solid ${sasT.borderSoft}` : 'none',
                  color: m.danger ? sasT.danger : sasT.ink,
                }}>
                  <Icon name={m.i} size={18} color={m.danger ? sasT.danger : sasT.inkMute} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.l}</div>
                    {m.sub && <div style={{ fontSize: 10.5, color: sasT.inkMute, marginTop: 1 }}>{m.sub}</div>}
                  </div>
                  {!m.danger && <Icon name="chevron_right" size={16} color={sasT.inkDim} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 10, color: sasT.inkDim, padding: '14px 0' }}>Sehati v2.4.1 · klinik.sehati.id</div>
        </div>

        <div style={{ display: 'flex', borderTop: `1px solid ${sasT.borderSoft}`, background: sasT.surface, padding: '6px 4px 8px' }}>
          {[
            { id: 'home', icon: 'home', label: 'Beranda' },
            { id: 'chat', icon: 'chat_bubble', label: 'Chat' },
            { id: 'r', icon: 'history', label: 'Riwayat' },
            { id: 'me', icon: 'person', label: 'Profil', on: true },
          ].map(it => (
            <div key={it.id} style={{ flex: 1, textAlign: 'center', padding: 6, color: it.on ? sasT.primary : sasT.inkDim }}>
              <Icon name={it.icon} size={22} filled={it.on} />
              <div style={{ fontSize: 10.5, fontWeight: it.on ? 600 : 400, marginTop: 2 }}>{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AndroidDevice>
  );
}

Object.assign(window, { SaSPhoneConfirm, SaSPhoneRiwayat, SaSPhoneProfile });
