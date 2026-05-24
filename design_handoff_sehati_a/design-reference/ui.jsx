/* global React */
// Shared atoms used across all three directions

// SVG placeholder for any image — striped diagonal pattern with a monospace label
function Placeholder({ label = 'image', style = {} }) {
  return (
    <div
      className="placeholder"
      style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace, SF Mono, Menlo, monospace', fontSize: 10, color: 'rgba(0,0,0,0.45)',
        background: 'rgba(0,0,0,0.04)', borderRadius: 12, ...style,
      }}
    >
      {label}
    </div>
  );
}

// Avatar with deterministic warm-tone background
function Avatar({ initials, hue = 28, size = 36, ring = false, ringColor = '#fff' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `oklch(0.86 0.04 ${hue})`,
      color: `oklch(0.32 0.07 ${hue})`,
      fontWeight: 600, fontSize: size * 0.36,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px ${ringColor}` : 'none',
    }}>{initials}</div>
  );
}

// Inline icon — uses Material Symbols Rounded for consistency
function Icon({ name, size = 20, filled = false, color = 'currentColor', style = {} }) {
  return (
    <span
      className={'mi' + (filled ? ' filled' : '')}
      style={{ fontSize: size, color, lineHeight: 1, ...style }}
    >
      {name}
    </span>
  );
}

// Typing indicator (3 pulse dots)
function Typing({ color = 'currentColor' }) {
  return (
    <span className="typing" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span style={{ background: color }} />
      <span style={{ background: color }} />
      <span style={{ background: color }} />
    </span>
  );
}

// Tag chip
function Chip({ children, bg, fg, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 100,
      background: bg, color: fg, fontSize: 11, fontWeight: 500, letterSpacing: 0.1,
      whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

// Subtle "AI" badge — used for any AI-driven content
function AIBadge({ label = 'AI', bg = 'rgba(0,0,0,0.06)', fg = 'currentColor' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
      padding: '2px 6px', borderRadius: 4, background: bg, color: fg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {label}
    </span>
  );
}

Object.assign(window, { Placeholder, Avatar, Icon, Typing, Chip, AIBadge });
