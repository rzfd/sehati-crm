/* global React, Avatar, Icon, Chip, AIBadge, Placeholder, sasT, SehatiData */

// Shared dashboard shell (left sidebar + main)
function SaSDashShell({ active, persona, screenTitle, children }) {
  const navOps = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'inbox', icon: 'inbox', label: 'Inbox', count: 12 },
    { id: 'kalender', icon: 'calendar_month', label: 'Kalender' },
    { id: 'pasien', icon: 'group', label: 'Pasien' },
  ];
  const navKB = [
    { id: 'kb', icon: 'auto_stories', label: 'Knowledge Base' },
    { id: 'qa', icon: 'forum', label: 'Q&A' },
    { id: 'docs', icon: 'description', label: 'Dokumen' },
    { id: 'gaps', icon: 'manage_search', label: 'KB Gaps', count: 7 },
  ];
  const navMgmt = [
    { id: 'dokter', icon: 'medical_services', label: 'Dokter' },
    { id: 'staff', icon: 'badge', label: 'Staff' },
    { id: 'klinik', icon: 'business', label: 'Klinik' },
    { id: 'audit', icon: 'history', label: 'Audit Log' },
  ];

  const renderNav = (label, items) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: sasT.inkDim, letterSpacing: 0.6, textTransform: 'uppercase', padding: '4px 14px 6px' }}>{label}</div>
      {items.map(it => {
        const on = it.id === active;
        return (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', margin: '1px 8px', borderRadius: 8,
            background: on ? sasT.surface : 'transparent',
            color: on ? sasT.ink : sasT.inkMute,
            fontWeight: on ? 600 : 400, fontSize: 13,
            cursor: 'pointer', position: 'relative',
          }}>
            {on && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, background: sasT.primary, borderRadius: 2 }} />}
            <Icon name={it.icon} size={18} filled={on} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.count != null && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', background: on ? sasT.primary : sasT.surfaceAlt, color: on ? '#fff' : sasT.inkMute, borderRadius: 100 }}>{it.count}</span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ width: 1280, height: 800, background: sasT.bg, color: sasT.ink, display: 'flex', overflow: 'hidden', fontSize: 13 }}>
      {/* sidebar */}
      <div style={{ width: 224, background: sasT.surfaceDim, borderRight: `1px solid ${sasT.borderSoft}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: sasT.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>S</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: sasT.ink, letterSpacing: -0.2 }}>Sehati</div>
            <div style={{ fontSize: 10, color: sasT.inkMute, letterSpacing: 0.4 }}>Klinik Pusat · Jakarta</div>
          </div>
        </div>

        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ padding: 10, background: sasT.surface, borderRadius: 10, border: `1px solid ${sasT.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar initials={persona.initials} hue={persona.hue} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: sasT.ink, lineHeight: 1.2 }}>{persona.name}</div>
              <div style={{ fontSize: 10, color: sasT.inkMute, marginTop: 1 }}>{persona.role}</div>
            </div>
            <Icon name="expand_more" size={16} color={sasT.inkMute} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }} className="scroll">
          {renderNav('Operasional', navOps)}
          {renderNav('Knowledge Base', navKB)}
          {renderNav('Manajemen', navMgmt)}
        </div>

        <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${sasT.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: sasT.inkMute }}>
          <Icon name="bolt" size={14} color={sasT.primary} />
          AI status · OK
          <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: sasT.primary }} />
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* top bar */}
        <div style={{ height: 56, padding: '0 24px', borderBottom: `1px solid ${sasT.borderSoft}`, display: 'flex', alignItems: 'center', gap: 16, background: sasT.bg }}>
          <div style={{ fontSize: 11, color: sasT.inkMute, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Klinik Pusat</span>
            <Icon name="chevron_right" size={14} />
            <span style={{ color: sasT.ink, fontWeight: 500 }}>{screenTitle}</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', background: sasT.surface, border: `1px solid ${sasT.border}`,
            borderRadius: 100, width: 280,
          }}>
            <Icon name="search" size={16} color={sasT.inkDim} />
            <span style={{ fontSize: 12, color: sasT.inkDim }}>Cari pasien, dokter, pesan…</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: sasT.inkDim, padding: '1px 6px', border: `1px solid ${sasT.border}`, borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: sasT.inkMute }}>
            <div style={{ position: 'relative' }}>
              <Icon name="notifications" size={20} />
              <span style={{ position: 'absolute', top: -2, right: -3, width: 8, height: 8, borderRadius: '50%', background: sasT.accent, border: `2px solid ${sasT.bg}` }} />
            </div>
            <Icon name="help" size={20} />
          </div>
        </div>

        {/* page */}
        <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────── Dashboard 1 · Inbox ───────────────────
function SaSDashInbox() {
  const [activeMsg, setActiveMsg] = React.useState('m1');
  const [selectedTone, setSelectedTone] = React.useState(0);
  const data = SehatiData;
  const msg = data.inbox.find(m => m.id === activeMsg);
  const dr = data.doctors.find(d => d.id === 'dr3');

  const urgencyColors = {
    urgent: { bg: sasT.dangerDim, fg: sasT.danger, label: 'Darurat' },
    normal: { bg: sasT.infoDim, fg: sasT.info, label: 'Normal' },
    low: { bg: sasT.surfaceAlt, fg: sasT.inkMute, label: 'Rendah' },
  };

  return (
    <SaSDashShell active="inbox" screenTitle="Inbox" persona={{ name: 'Rizka Sari', role: 'Customer Service', initials: 'RS', hue: 350 }}>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* inbox list */}
        <div style={{ width: 320, borderRight: `1px solid ${sasT.borderSoft}`, background: sasT.bg, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: sasT.ink }}>Inbox</h2>
              <span style={{ fontSize: 11, color: sasT.inkMute }}>184 hari ini</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { l: 'Semua', n: 184, on: true },
                { l: 'Darurat', n: 3 },
                { l: 'Booking', n: 22 },
                { l: 'Info', n: 41 },
              ].map(f => (
                <span key={f.l} style={{
                  padding: '4px 10px', borderRadius: 100, fontSize: 11.5,
                  background: f.on ? sasT.ink : sasT.surface,
                  color: f.on ? '#fff' : sasT.inkMute,
                  border: `1px solid ${f.on ? sasT.ink : sasT.border}`,
                  fontWeight: 500,
                }}>{f.l} <span style={{ opacity: 0.65, marginLeft: 2 }}>{f.n}</span></span>
              ))}
            </div>
          </div>
          <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {data.inbox.map(m => {
              const on = m.id === activeMsg;
              const u = urgencyColors[m.urgency];
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMsg(m.id)}
                  style={{
                    padding: '12px 18px', cursor: 'pointer', display: 'flex', gap: 11,
                    background: on ? sasT.surface : 'transparent',
                    borderLeft: `3px solid ${on ? sasT.primary : 'transparent'}`,
                    borderBottom: `1px solid ${sasT.borderSoft}`,
                  }}
                >
                  <Avatar initials={m.initials} hue={m.urgency === 'urgent' ? 18 : 200} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                      <div style={{ fontSize: 12.5, fontWeight: m.unread ? 600 : 500, color: sasT.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: sasT.inkDim, flexShrink: 0 }}>{m.time}</div>
                    </div>
                    <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 3, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.preview}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                      <Chip bg={u.bg} fg={u.fg}>{u.label}</Chip>
                      <Chip bg={sasT.surfaceAlt} fg={sasT.inkMute}>{m.category}</Chip>
                      {m.escalated && <Chip bg={sasT.warnDim} fg={sasT.warn}>↑ Escalated</Chip>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* conversation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: sasT.surface, minWidth: 0 }}>
          <div style={{ padding: '14px 22px', borderBottom: `1px solid ${sasT.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar initials={msg.initials} hue={18} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: sasT.ink }}>{msg.name}</div>
              <div style={{ fontSize: 11, color: sasT.inkMute }}>WhatsApp · +62 812-3456-7890 · pertama chat 4 menit lalu</div>
            </div>
            <button style={{
              padding: '6px 12px', background: sasT.surfaceDim, border: `1px solid ${sasT.border}`,
              borderRadius: 8, color: sasT.ink, fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
            }}>
              <Icon name="person_add" size={14} /> Routing
            </button>
            <Icon name="more_horiz" size={20} color={sasT.inkMute} />
          </div>

          {/* messages */}
          <div className="scroll" style={{ flex: 1, padding: '20px 26px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ alignSelf: 'center', fontSize: 10, color: sasT.inkDim, background: sasT.surfaceDim, padding: '3px 10px', borderRadius: 100 }}>Hari ini · Kam 14 Mei 2026</div>
            {msg.messages.map((m, i) => {
              if (m.from === 'user') {
                return (
                  <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '60%' }}>
                    <div style={{ background: sasT.surfaceDim, borderRadius: '14px 14px 14px 4px', padding: '9px 13px', fontSize: 13, color: sasT.ink, lineHeight: 1.45 }}>{m.text}</div>
                    <div style={{ fontSize: 10, color: sasT.inkDim, marginTop: 3, paddingLeft: 4 }}>{m.time}</div>
                  </div>
                );
              }
              return (
                <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '60%' }}>
                  <div style={{ background: sasT.primarySoft, borderRadius: '14px 14px 4px 14px', padding: '9px 13px', fontSize: 13, color: sasT.ink, lineHeight: 1.45, border: `1px solid ${sasT.primaryDim}`, whiteSpace: 'pre-line' }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: sasT.inkDim, marginTop: 3, paddingRight: 4, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5 }}>
                    <AIBadge label={m.kind === 'escalate' ? 'Gatekeeper' : 'RAG'} bg="transparent" fg={sasT.primary} />
                    {m.time} · AI auto
                  </div>
                </div>
              );
            })}
          </div>

          {/* smart reply selected */}
          <div style={{ padding: '12px 22px 16px', borderTop: `1px solid ${sasT.borderSoft}` }}>
            <div style={{ background: sasT.bg, border: `1px solid ${sasT.border}`, borderRadius: 12, padding: '10px 12px', minHeight: 70 }}>
              <div style={{ fontSize: 13, color: sasT.ink, lineHeight: 1.5 }}>
                {data.smartReplies[selectedTone].text}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: sasT.inkMute }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="attach_file" size={14} /> Lampiran</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="auto_stories" size={14} /> Template</span>
              </div>
              <button style={{
                padding: '8px 16px', background: sasT.ink, color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
              }}>Kirim balasan <Icon name="send" size={14} filled /></button>
            </div>
          </div>
        </div>

        {/* AI assist panel */}
        <div style={{ width: 312, borderLeft: `1px solid ${sasT.borderSoft}`, background: sasT.bg, padding: '16px 18px', overflowY: 'auto' }} className="scroll">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <AIBadge label="Asisten Sehati" bg={sasT.primary} fg="#fff" />
            <span style={{ fontSize: 11, color: sasT.inkMute, marginLeft: 'auto' }}>Sonnet · 0.4s</span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: sasT.ink, marginTop: 4 }}>AI saran balasan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {data.smartReplies.map((r, i) => {
              const on = i === selectedTone;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedTone(i)}
                  style={{
                    background: on ? sasT.surface : 'transparent',
                    border: `1px solid ${on ? sasT.primary : sasT.border}`,
                    borderRadius: 10, padding: 10, cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: on ? sasT.primary : sasT.inkMute, letterSpacing: 0.3, textTransform: 'uppercase' }}>{r.tone}</span>
                    {on && <Icon name="check_circle" size={14} color={sasT.primary} filled />}
                  </div>
                  <div style={{ fontSize: 11.5, color: sasT.ink, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.text}</div>
                </div>
              );
            })}
          </div>

          <div style={{ height: 1, background: sasT.borderSoft, margin: '18px 0 14px' }} />

          <div style={{ fontSize: 11, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Auto-tag (Haiku)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
            <Chip bg={sasT.dangerDim} fg={sasT.danger}>● Darurat</Chip>
            <Chip bg={sasT.surfaceAlt} fg={sasT.inkMute}>Medis</Chip>
            <Chip bg={sasT.surfaceAlt} fg={sasT.inkMute}>Anak</Chip>
            <Chip bg={sasT.surfaceAlt} fg={sasT.inkMute}>Demam</Chip>
            <Chip bg={sasT.warnDim} fg={sasT.warn}>↑ Escalated</Chip>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Routing usulan</div>
          <div style={{ background: sasT.surface, borderRadius: 10, padding: 12, border: `1px solid ${sasT.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initials={dr.initials} hue={dr.hue} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: sasT.ink }}>{dr.name}</div>
                <div style={{ fontSize: 10.5, color: sasT.inkMute, marginTop: 1 }}>Sp. Anak · online</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: sasT.primary, padding: '2px 7px', background: sasT.primarySoft, borderRadius: 100 }}>97% match</span>
            </div>
            <div style={{ fontSize: 11, color: sasT.inkMute, marginTop: 10, lineHeight: 1.5 }}>
              Berdasarkan kategori "Anak · Demam · Darurat" — Asdok dr. Budi tersedia, rata-rata respon 4 mnt.
            </div>
            <button style={{
              marginTop: 10, width: '100%', padding: '8px 0', background: sasT.primary,
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
            }}>Teruskan ke Asdok <Icon name="arrow_forward" size={14} /></button>
          </div>

          <div style={{ height: 1, background: sasT.borderSoft, margin: '18px 0 14px' }} />

          <div style={{ fontSize: 11, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>RAG context</div>
          <div style={{ fontSize: 11, color: sasT.inkMute, lineHeight: 1.5 }}>
            Tidak ditemukan jawaban relevan di KB untuk "demam 39° anak 4 thn".<br />
            <span style={{ color: sasT.warn, fontWeight: 500 }}>↑ Tambahkan ke KB Gaps</span>
          </div>
        </div>
      </div>
    </SaSDashShell>
  );
}

Object.assign(window, { SaSDashShell, SaSDashInbox });
