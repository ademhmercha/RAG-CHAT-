import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { HiOutlineBars3 } from "react-icons/hi2";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen main-bg flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-sidebar)] border-b border-[var(--border)] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-all duration-200"
            aria-label="Open menu"
          >
            <HiOutlineBars3 className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="RAG Assistant" className="w-6 h-6 rounded-md object-cover" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">RAG Assistant</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
