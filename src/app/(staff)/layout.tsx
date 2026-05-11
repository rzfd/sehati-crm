export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* StaffSidebar placeholder — Sprint 1 */}
      <aside className="w-56 shrink-0 bg-white border-r border-black/[0.08] flex flex-col">
        <div className="p-4 border-b border-black/[0.08]">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Sehati Staff</span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          <a href="/staff/inbox"     className="nav-item">Inbox</a>
          <a href="/staff/calendar"  className="nav-item">Kalender</a>
          <a href="/staff/dashboard" className="nav-item">Dashboard</a>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
