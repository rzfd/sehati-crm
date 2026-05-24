/* global React, AndroidDevice, Avatar, Icon, Chip, AIBadge, sasT, SehatiData */

// ─────────────────── 3) Phone — Booking ───────────────────
function SaSPhoneBooking() {
  const [selectedDr, setSelectedDr] = React.useState('dr1');
  const [selectedDay, setSelectedDay] = React.useState(2);
  const [selectedSlot, setSelectedSlot] = React.useState('10:30');

  const days = [
    { label: 'Sen', d: 11 }, { label: 'Sel', d: 12 }, { label: 'Rab', d: 13 },
    { label: 'Kam', d: 14 }, { label: 'Jum', d: 15 }, { label: 'Sab', d: 16 }, { label: 'Min', d: 17 },
  ];
  const slots = [
    { t: '09:00', avail: true },
    { t: '09:30', avail: false },
    { t: '10:00', avail: true },
    { t: '10:30', avail: true },
    { t: '11:00', avail: false },
    { t: '13:00', avail: true },
    { t: '13:30', avail: true },
    { t: '14:00', avail: true },
    { t: '14:30', avail: false },
  ];

  return (
    <AndroidDevice width={360} height={720}>
      <div style={{ background: sasT.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ padding: '14px 16px 14px', background: sasT.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="arrow_back" size={22} color={sasT.ink} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: sasT.ink }}>Booking Dokter</div>
          </div>
        </div>

        <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 12px' }}>
          {/* doctor select */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Pilih Dokter</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {SehatiData.doctors.slice(0, 3).map(d => {
              const on = d.id === selectedDr;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDr(d.id)}
                  style={{
                    background: on ? sasT.primarySoft : sasT.surface,
                    border: `1.5px solid ${on ? sasT.primary : sasT.border}`,
                    borderRadius: 14, padding: 12,
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  }}
                >
                  <Avatar initials={d.initials} hue={d.hue} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: sasT.ink }}>{d.name}</div>
                    <div style={{ fontSize: 11.5, color: sasT.inkMute, marginTop: 1 }}>{d.spec} · Klinik Pusat</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${on ? sasT.primary : sasT.border}`,
                    background: on ? sasT.primary : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <Icon name="check" size={12} color="#fff" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* date scroller */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase' }}>Tanggal · Mei 2026</div>
            <div style={{ fontSize: 11, color: sasT.primary, fontWeight: 500 }}>Lihat kalender</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }} className="scroll">
            {days.map((d, i) => {
              const on = i === selectedDay;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    flex: '0 0 44px', height: 60, borderRadius: 14,
                    background: on ? sasT.ink : sasT.surface,
                    color: on ? '#fff' : sasT.ink,
                    border: `1px solid ${on ? sasT.ink : sasT.border}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 9.5, opacity: on ? 0.7 : 0.6, fontWeight: 500, letterSpacing: 0.4 }}>{d.label.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{d.d}</div>
                </div>
              );
            })}
          </div>

          {/* slots */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: sasT.inkMute, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Pilih Jam</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {slots.map(s => {
              const on = s.t === selectedSlot;
              const dim = !s.avail;
              return (
                <div
                  key={s.t}
                  onClick={() => s.avail && setSelectedSlot(s.t)}
                  style={{
                    padding: '10px 0', textAlign: 'center', borderRadius: 10,
                    background: dim ? sasT.surfaceDim : on ? sasT.primary : sasT.surface,
                    color: dim ? sasT.inkDim : on ? '#fff' : sasT.ink,
                    border: `1px solid ${dim ? sasT.border : on ? sasT.primary : sasT.border}`,
                    fontSize: 12.5, fontWeight: 500,
                    textDecoration: dim ? 'line-through' : 'none',
                    cursor: dim ? 'not-allowed' : 'pointer',
                  }}
                >{s.t}</div>
              );
            })}
          </div>
        </div>

        {/* sticky CTA */}
        <div style={{ padding: '12px 16px 16px', background: sasT.surface, borderTop: `1px solid ${sasT.borderSoft}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, color: sasT.inkMute, letterSpacing: 0.3, textTransform: 'uppercase' }}>Janji</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: sasT.ink, marginTop: 2 }}>Jum, 15 Mei · {selectedSlot}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, color: sasT.inkMute, letterSpacing: 0.3, textTransform: 'uppercase' }}>Biaya</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: sasT.ink, marginTop: 2 }}>Rp 150.000</div>
            </div>
          </div>
          <button style={{
            width: '100%', padding: '13px 0', background: sasT.ink, color: '#fff',
            border: 'none', borderRadius: 100, fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit',
          }}>
            Konfirmasi Booking
            <Icon name="arrow_forward" size={16} />
          </button>
        </div>
      </div>
    </AndroidDevice>
  );
}

Object.assign(window, { SaSPhoneBooking });
