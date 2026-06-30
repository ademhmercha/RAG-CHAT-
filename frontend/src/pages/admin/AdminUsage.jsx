import { useState, useEffect, useCallback } from "react";
import { admin } from "../../api/client";

export default function AdminUsage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        admin.getUsage({ page, limit: 30 }),
        admin.getUsageSummary(),
      ]);
      setLogs(logsRes.data.data.logs);
      setTotal(logsRes.data.data.total);
      setSummary(summaryRes.data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const pages = Math.ceil(total / 30);

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Usage</h1>

      {summary.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Summary by Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {summary.map((s) => (
              <div key={`${s._id.provider}-${s._id.model}`} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3">
                <p className="text-xs font-medium text-[var(--text-primary)]">{s._id.provider}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mb-1">{s._id.model}</p>
                <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                  <p>Calls: {s.count}</p>
                  <p>Failures: {s.failures}</p>
                  <p>Avg: {Math.round(s.avgDurationMs)}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs uppercase">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Provider</th>
                  <th className="text-left px-4 py-3">Model</th>
                  <th className="text-left px-4 py-3">Duration</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]">
                    <td className="px-4 py-3 text-xs">{log.userId?.name || log.userId?.email || "—"}</td>
                    <td className="px-4 py-3 text-xs">{log.provider}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{log.model}</td>
                    <td className="px-4 py-3 text-xs">{log.durationMs}ms</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${log.success ? "text-green-400" : "text-red-400"}`}>
                        {log.success ? "OK" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                      No usage logs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 text-xs rounded border ${page === i + 1 ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"}`}
                >
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
