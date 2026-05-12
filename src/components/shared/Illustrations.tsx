// Inline SVG illustrations untuk empty states. Tema warna sesuai brand Sehati.

export function EmptyChatIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none">
      <defs>
        <linearGradient id="chat-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#E1F5EE" />
          <stop offset="100%" stopColor="#E6F1FB" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="140" rx="80" ry="8" fill="#000" opacity="0.04" />
      <rect x="40"  y="40" width="100" height="60" rx="14" fill="url(#chat-bg)" stroke="#5DCAA5" strokeWidth="1.5"/>
      <circle cx="65" cy="68" r="3" fill="#1D9E75"/>
      <circle cx="80" cy="68" r="3" fill="#1D9E75"/>
      <circle cx="95" cy="68" r="3" fill="#1D9E75"/>
      <rect x="100" y="80" width="60" height="40" rx="12" fill="#FFFFFF" stroke="#7BB5E8" strokeWidth="1.5"/>
      <rect x="110" y="92"  width="40" height="3" rx="1.5" fill="#7BB5E8" opacity="0.5"/>
      <rect x="110" y="100" width="30" height="3" rx="1.5" fill="#7BB5E8" opacity="0.5"/>
    </svg>
  )
}

export function EmptyBookingIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none">
      <ellipse cx="100" cy="140" rx="80" ry="8" fill="#000" opacity="0.04" />
      <rect x="50" y="30" width="100" height="100" rx="10" fill="#EEEDFE" stroke="#9990F9" strokeWidth="1.5"/>
      <rect x="50" y="30" width="100" height="22" rx="10" fill="#534AB7"/>
      <circle cx="68" cy="41" r="3" fill="#FFFFFF"/>
      <circle cx="132" cy="41" r="3" fill="#FFFFFF"/>
      <rect x="60" y="62" width="20" height="14" rx="2" fill="#FFFFFF"/>
      <rect x="86" y="62" width="20" height="14" rx="2" fill="#9990F9" opacity="0.6"/>
      <rect x="112" y="62" width="20" height="14" rx="2" fill="#FFFFFF"/>
      <rect x="60" y="82" width="20" height="14" rx="2" fill="#FFFFFF"/>
      <rect x="86" y="82" width="20" height="14" rx="2" fill="#FFFFFF"/>
      <rect x="112" y="82" width="20" height="14" rx="2" fill="#FFFFFF"/>
      <rect x="60" y="102" width="20" height="14" rx="2" fill="#FFFFFF"/>
      <rect x="86" y="102" width="20" height="14" rx="2" fill="#FFFFFF"/>
    </svg>
  )
}

export function EmptyInboxIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none">
      <ellipse cx="100" cy="145" rx="70" ry="6" fill="#000" opacity="0.04"/>
      <rect x="40" y="60" width="120" height="70" rx="8" fill="#E1F5EE"/>
      <path d="M40 60 L100 100 L160 60" stroke="#1D9E75" strokeWidth="2" fill="none"/>
      <path d="M40 130 L80 95 M160 130 L120 95" stroke="#5DCAA5" strokeWidth="1.5" fill="none"/>
      <circle cx="160" cy="60" r="14" fill="#1D9E75"/>
      <path d="M154 60 L158 64 L166 56" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function EmptyKBIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none">
      <ellipse cx="100" cy="140" rx="70" ry="6" fill="#000" opacity="0.04"/>
      <rect x="60" y="30" width="80" height="100" rx="6" fill="#EEEDFE" stroke="#9990F9" strokeWidth="1.5"/>
      <rect x="70" y="44" width="60" height="4" rx="2" fill="#534AB7"/>
      <rect x="70" y="56" width="50" height="3" rx="1.5" fill="#9990F9" opacity="0.6"/>
      <rect x="70" y="64" width="55" height="3" rx="1.5" fill="#9990F9" opacity="0.6"/>
      <rect x="70" y="80" width="60" height="4" rx="2" fill="#534AB7"/>
      <rect x="70" y="92" width="45" height="3" rx="1.5" fill="#9990F9" opacity="0.6"/>
      <rect x="70" y="100" width="50" height="3" rx="1.5" fill="#9990F9" opacity="0.6"/>
    </svg>
  )
}

export function EmptyDoctorIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none">
      <ellipse cx="100" cy="145" rx="70" ry="6" fill="#000" opacity="0.04"/>
      <circle cx="100" cy="60" r="22" fill="#FBEAF0"/>
      <circle cx="100" cy="55" r="10" fill="#E781A5"/>
      <path d="M78 100c0-12 9-20 22-20s22 8 22 20v25H78z" fill="#993556"/>
      <rect x="92" y="76" width="16" height="6" rx="1" fill="#FFFFFF"/>
      <path d="M100 82v8" stroke="#FFFFFF" strokeWidth="1.5"/>
    </svg>
  )
}

export function ErrorIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none">
      <ellipse cx="100" cy="140" rx="70" ry="6" fill="#000" opacity="0.04"/>
      <path d="M100 30 L160 130 L40 130 Z" fill="#FCEBEB" stroke="#A32D2D" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M100 65v30" stroke="#A32D2D" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="100" cy="110" r="3" fill="#A32D2D"/>
    </svg>
  )
}
