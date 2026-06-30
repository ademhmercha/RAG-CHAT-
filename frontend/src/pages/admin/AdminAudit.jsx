import { useState, useEffect, useCallback } from "react";
import { admin } from "../../api/client";

const actionLabels = {
  login: "Login",
  logout: "Logout",
  chat: "Chat Message",
  upload: "File Upload",
  delete_document: "Delete Document",
  register: "Register",
};

const actionColors = {
  login: "text-green-400",
  logout: "text-orange-400",
  chat: "text-blue-400",
  upload: "text-purple-400",
  delete_document: "text-red-400",
  register: "text-emerald-400",
};

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 40 };
      if (actionFilter) params.action = actionFilter;
      const res = await admin.getAudit(params);
      setLogs(res.data.data.logs);
      setTotal(res.data.data.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const pages = Math.ceil(total / 40);

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Audit Log</h1>

      <div className="flex items-center gap-2 mb-4">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 text-xs bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        >
          <option value="">All actions</option>
          {Object.entries(actionLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="text-xs text-[var(--text-tertiary)]">{total} total</span>
      </div>

      {loading ? (
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs uppercase">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Details</th>
                  <th className="text-left px-4 py-3">IP</th>
                  <th className="text-left px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]">
                    <td className="px-4 py-3 text-xs">{log.userId?.name || log.userId?.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${actionColors[log.action] || "text-[var(--text-secondary)]"}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] max-w-xs truncate">{log.details || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">{log.ip || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">No audit logs yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-xs rounded border ${page === i + 1 ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
