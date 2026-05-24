/* global React, AndroidDevice, Avatar, Icon, Typing, Chip, AIBadge, Placeholder, SehatiData */

// ─────────────────────────────────────────────────────────────
// Direction A — "Sand & Sage"
// Minimal warm cream space, sage green primary, clay terracotta accent.
// Closest to user's current direction but unified (no more purple).
// ─────────────────────────────────────────────────────────────
const sasT = {
  bg: '#FAF6EE',
  surface: '#FFFFFF',
  surfaceAlt: '#F2EDE0',
  surfaceDim: '#EEE7D5',
  ink: '#1F1B14',
  inkMute: '#6F665A',
  inkDim: '#A39A8B',
  border: '#E8E0CC',
  borderSoft: '#F0E9D6',
  primary: '#5E7A5E',
  primaryDim: '#D9E1D2',
  primarySoft: '#EAEFE3',
  accent: '#B05E3F',
  accentDim: '#F0D9CB',
  warn: '#C97B2C',
  warnDim: '#F4E1CC',
  danger: '#A8443E',
  dangerDim: '#F2D6D3',
  info: '#3D6478',
  infoDim: '#D6E1E7',
};

const sasShadow = '0 1px 2px rgba(45,30,10,0.04), 0 8px 24px rgba(45,30,10,0.06)';
const sasShadowSm = '0 1px 2px rgba(45,30,10,0.05)';

// ─────────────────── shared phone bits ───────────────────
function SaSPhoneHeader({ title, sub, right, color = sasT.ink, bg = sasT.bg, back = false }) {
  return (
    <div style={{
      background: bg, padding: '10px 16px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${sasT.borderSoft}`,
    }}>
      {back && <Icon name="arrow_back" size={22} color={color} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color, lineHeight: 1.2 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function SaSBottomNav({ active = 'home' }) {
  const items = [
    { id: 'home', icon: 'home', label: 'Beranda' },
    { id: 'chat', icon: 'chat_bubble', label: 'Chat' },
    { id: 'book', icon: 'event_available', label: 'Booking' },
    { id: 'me', icon: 'person', label: 'Profil' },
  ];
  return (
    <div style={{
      display: 'flex', borderTop: `1px solid ${sasT.borderSoft}`,
      background: sasT.surface, padding: '6px 4px 8px',
    }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <div key={it.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, padding: '6px 4px',
            color: on ? sasT.primary : sasT.inkDim,
          }}>
            <Icon name={it.icon} size={22} filled={on} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 400 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────── 1) Phone — Home ───────────────────
function SaSPhoneHome() {
  return (
    <AndroidDevice width={360} height={720}>
      <div style={{ background: sasT.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* greeting header */}
        <div style={{ padding: '20px 20px 18px', background: sasT.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: sasT.inkMute, letterSpacing: 0.3 }}>Selamat pagi,</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: sasT.ink, marginTop: 2 }}>Bu Sari 🌿</div>
            </div>
            <Avatar initials="SW" size={40} hue={28} />
          </div>
        </div>

        {/* AI welcome card */}
        <div style={{ margin: '0 16px 16px', padding: 16, background: sasT.primarySoft, borderRadius: 16, border: `1px solid ${sasT.primaryDim}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <AIBadge label="Asisten Sehati" bg={sasT.primary} fg="#fff" />
          </div>
          <div style={{ fontSize: 14, color: sasT.ink, lineHeight: 1.4, fontWeight: 500 }}>
            Ada yang bisa saya bantu hari ini, Bu?
          </div>
          <div style={{ fontSize: 12, color: sasT.inkMute, marginTop: 4, lineHeight: 1.5 }}>
            Booking, tanya jam buka, atau konsultasi cepat — kami terhubung 24/7.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['Booking dokter', 'Hasil lab', 'Info BPJS'].map(q => (
              <span key={q} style={{
                padding: '6px 10px', background: sasT.surface, borderRadius: 100,
                border: `1px solid ${sasT.primaryDim}`, fontSize: 11.5, color: sasT.primary, fontWeight: 500,
              }}>{q}</span>
            ))}
          </div>
        </div>

        {/* upcoming */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase' }}>Janji terdekat</div>
            <div style={{ fontSize: 11, color: sasT.primary, fontWeight: 500 }}>Lihat semua</div>
          </div>
          <div style={{ background: sasT.surface, borderRadius: 14, padding: 14, border: `1px solid ${sasT.border}`, boxShadow: sasShadowSm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 48, borderRadius: 10, background: sasT.accentDim,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: sasT.accent,
              }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>JUM</div>
                <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1 }}>15</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: sasT.ink }}>dr. Ratna Kusuma, Sp.OG</div>
                <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 2 }}>10:00 — 10:30 · Ruang 2</div>
              </div>
              <Icon name="chevron_right" size={20} color={sasT.inkDim} />
            </div>
          </div>
        </div>

        {/* quick actions */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Akses cepat</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: 'medical_services', label: 'Cari Dokter', bg: sasT.primarySoft, fg: sasT.primary },
              { icon: 'pill', label: 'Resep & Obat', bg: sasT.accentDim, fg: sasT.accent },
              { icon: 'science', label: 'Hasil Lab', bg: sasT.infoDim, fg: sasT.info },
              { icon: 'health_and_safety', label: 'BPJS', bg: sasT.warnDim, fg: sasT.warn },
            ].map(a => (
              <div key={a.label} style={{
                background: sasT.surface, borderRadius: 12, padding: 12,
                border: `1px solid ${sasT.border}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: a.bg, color: a.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={a.icon} size={18} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: sasT.ink }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* tip */}
        <div style={{ margin: '4px 16px 16px', padding: '12px 14px', background: sasT.surfaceDim, borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="lightbulb" size={16} color={sasT.warn} style={{ marginTop: 1 }} />
          <div style={{ fontSize: 11.5, color: sasT.inkMute, lineHeight: 1.5 }}>
            Tip: jika butuh bantuan cepat, ketik "darurat" — chat langsung diteruskan ke staf klinik.
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <SaSBottomNav active="home" />
      </div>
    </AndroidDevice>
  );
}

// ─────────────────── 2) Phone — Chat (live) ───────────────────
function SaSPhoneChat() {
  const [messages, setMessages] = React.useState([
    { from: 'user', text: 'Selamat pagi 🙏', time: '07:42' },
    { from: 'ai', text: 'Halo Bu Sari! Ada yang bisa Asisten Sehati bantu pagi ini?', time: '07:42', kind: 'rag' },
    { from: 'user', text: 'Anak saya Bima (4 thn) demam 39° sejak tadi malam, sudah dikasih parasetamol tapi belum turun.', time: '07:43' },
  ]);
  const [typing, setTyping] = React.useState(true);
  const [escalated, setEscalated] = React.useState(false);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const t1 = setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, {
        from: 'ai',
        text: 'Demam tinggi pada anak di bawah 5 tahun perlu penanganan oleh tenaga medis. Saya teruskan ke Asisten Dokter Anak ya Bu, mohon tunggu sebentar.',
        time: '07:43', kind: 'escalate',
      }]);
      setTimeout(() => setEscalated(true), 400);
    }, 1800);
    return () => clearTimeout(t1);
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, escalated]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: 'user', text: input, time: '07:44' }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { from: 'ai', text: 'Terima kasih, sudah saya catat. Asdok akan segera membalas.', time: '07:44', kind: 'rag' }]);
    }, 1500);
  };

  return (
    <AndroidDevice width={360} height={720}>
      <div style={{ background: sasT.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ background: sasT.surface, padding: '10px 14px 12px', borderBottom: `1px solid ${sasT.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="arrow_back" size={22} color={sasT.ink} />
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: sasT.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>K</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: sasT.ink }}>Klinik Sehati</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: sasT.inkMute }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sasT.primary }} />
              AI · biasanya jawab dalam 1 menit
            </div>
          </div>
          <Icon name="more_vert" size={22} color={sasT.inkMute} />
        </div>

        {/* messages */}
        <div ref={scrollRef} className="scroll" style={{ flex: 1, padding: '14px 12px 6px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ alignSelf: 'center', fontSize: 10.5, color: sasT.inkDim, padding: '2px 10px', background: sasT.surfaceAlt, borderRadius: 100 }}>Hari ini · 07:42</div>

          {messages.map((m, i) => (
            <SaSMsgBubble key={i} m={m} />
          ))}
          {typing && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '70%', padding: '10px 14px', background: sasT.surface, borderRadius: '16px 16px 16px 4px', border: `1px solid ${sasT.borderSoft}` }}>
              <Typing color={sasT.inkDim} />
            </div>
          )}

          {escalated && (
            <div className="slide-in" style={{
              alignSelf: 'stretch', margin: '8px 0',
              background: sasT.dangerDim, borderRadius: 14, padding: 12,
              border: `1px solid ${sasT.danger}33`,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: sasT.danger, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="emergency" size={16} filled />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: sasT.danger, letterSpacing: 0.2 }}>Diteruskan ke Asdok dr. Budi (Sp.A)</div>
                <div style={{ fontSize: 11.5, color: sasT.ink, marginTop: 3, lineHeight: 1.5 }}>
                  Pertanyaan medis wajib dijawab oleh tenaga klinik (UU Praktik Kedokteran). Estimasi respon: 5 menit.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* composer */}
        <div style={{ padding: '10px 12px 14px', background: sasT.surface, borderTop: `1px solid ${sasT.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: sasT.surfaceDim, borderRadius: 100, padding: '4px 4px 4px 16px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ketik pesan…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: sasT.ink, padding: '6px 0', fontFamily: 'inherit' }}
            />
            <button
              onClick={send}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: sasT.primary, color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="send" size={18} filled />
            </button>
          </div>
        </div>
      </div>
    </AndroidDevice>
  );
}

function SaSMsgBubble({ m }) {
  const isUser = m.from === 'user';
  if (isUser) {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
        <div style={{ background: sasT.primary, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 13, lineHeight: 1.45 }}>{m.text}</div>
        <div style={{ fontSize: 9.5, color: sasT.inkDim, textAlign: 'right', marginTop: 3, paddingRight: 6 }}>{m.time}</div>
      </div>
    );
  }
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '78%' }}>
      <div style={{ background: sasT.surface, color: sasT.ink, borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, lineHeight: 1.45, border: `1px solid ${sasT.borderSoft}` }}>
        {m.text}
      </div>
      <div style={{ fontSize: 9.5, color: sasT.inkDim, marginTop: 3, paddingLeft: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <AIBadge label={m.kind === 'escalate' ? 'Triage' : 'AI'} bg="transparent" fg={sasT.inkMute} />
        {m.time}
      </div>
    </div>
  );
}

Object.assign(window, { SaSPhoneHome, SaSPhoneChat, sasT });
