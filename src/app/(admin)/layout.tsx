export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* AdminSidebar placeholder — Sprint 1 */}
      <aside className="w-56 shrink-0 bg-white border-r border-black/[0.08] flex flex-col">
        <div className="p-4 border-b border-black/[0.08]">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Sehati Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          <a href="/admin/kb"       className="nav-item">Knowledge Base</a>
          <a href="/admin/kb/qa"    className="nav-item">Q&amp;A</a>
          <a href="/admin/doctors"  className="nav-item">Dokter</a>
          <a href="/admin/staff"    className="nav-item">Staff</a>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
