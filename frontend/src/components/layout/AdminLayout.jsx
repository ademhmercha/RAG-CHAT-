import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { HiOutlineSquares2X2, HiOutlineUsers, HiOutlineChartBarSquare, HiOutlineCog6Tooth, HiOutlineArrowLeftOnRectangle, HiOutlineClipboardDocumentList, HiOutlineDocumentText } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: HiOutlineSquares2X2, end: true },
  { to: "/admin/users", label: "Users", icon: HiOutlineUsers },
  { to: "/admin/documents", label: "Documents", icon: HiOutlineDocumentText },
  { to: "/admin/usage", label: "Usage", icon: HiOutlineChartBarSquare },
  { to: "/admin/audit", label: "Audit Log", icon: HiOutlineClipboardDocumentList },
  { to: "/admin/settings", label: "Settings", icon: HiOutlineCog6Tooth },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen main-bg flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-56 z-50 lg:z-0 transform transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 sidebar-bg border-r border-[var(--border)] flex flex-col`}>
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Admin Panel</h2>
          <p className="text-[10px] text-[var(--text-tertiary)]">System Management</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <NavLink
            to="/chat"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"
          >
            <HiOutlineArrowLeftOnRectangle className="w-4 h-4" />
            <span>Back to App</span>
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-56">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-sidebar)] border-b border-[var(--border)] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)]"
            aria-label="Open admin menu"
          >
            <HiOutlineSquares2X2 className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
          <span className="font-semibold text-sm text-[var(--text-primary)]">Admin</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
