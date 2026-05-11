export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto">
      <main className="flex-1 pb-16">{children}</main>

      {/* PatientBottomNav placeholder — Sprint 1 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-black/[0.08] flex">
        {[
          { href: "/home",     label: "Beranda" },
          { href: "/chat",     label: "Chat" },
          { href: "/booking",  label: "Booking" },
          { href: "/history",  label: "Riwayat" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 text-xs text-gray-500 hover:text-teal-400 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
