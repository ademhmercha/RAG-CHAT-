import { useState, useEffect } from "react";
import { NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { conversations as conversationsApi } from "../../api/client";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineCloudArrowUp,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineSun,
  HiOutlineMoon,
} from "react-icons/hi2";

const navItems = [
  { to: "/chat", label: "Chat", icon: HiOutlineChatBubbleLeftRight },
  { to: "/documents", label: "Documents", icon: HiOutlineDocumentText },
  { to: "/upload", label: "Upload", icon: HiOutlineCloudArrowUp },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const location = useLocation();
  const [convos, setConvos] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(false);

  const fetchConvos = async () => {
    try {
      setLoadingConvos(true);
      const res = await conversationsApi.list();
      setConvos(res.data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    fetchConvos();
  }, [location.pathname]);

  const handleNewChat = () => {
    navigate("/chat");
    onClose?.();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await conversationsApi.remove(id);
    setConvos((prev) => prev.filter((c) => c._id !== id));
    if (conversationId === id) navigate("/chat");
  };

  const isOnChat = location.pathname.startsWith("/chat");

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 lg:z-0 transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          sidebar-bg border-r border-[var(--border)] flex flex-col`}
      >
        <div className="p-3 border-b border-[var(--border)]">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {loadingConvos ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 skeleton" />
              ))}
            </div>
          ) : convos.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center px-4">
              <HiOutlineChatBubbleOvalLeftEllipsis className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
              <p className="text-xs text-[var(--text-secondary)]">No conversations yet</p>
            </div>
          ) : (
            convos.map((conv) => {
              const isActive = conv._id === conversationId;
              return (
                <button
                  key={conv._id}
                  onClick={() => {
                    navigate(`/chat/${conv._id}`);
                    onClose?.();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 group
                    ${isActive
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  <HiOutlineChatBubbleLeftRight className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-xs truncate">{conv.title}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{conv.messageCount || 0}</span>
                  <button
                    onClick={(e) => handleDelete(e, conv._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-card-hover)] text-[var(--text-tertiary)] hover:text-red-400 transition-all"
                  >
                    <HiOutlineTrash className="w-3 h-3" />
                  </button>
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-[var(--border)] space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
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

          <div className="pt-2 mt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center text-white text-xs font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-[var(--text-primary)] truncate">{user?.name || "User"}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === "dark" ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"
            >
              <HiOutlineCloudArrowUp className="w-4 h-4 rotate-90" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
