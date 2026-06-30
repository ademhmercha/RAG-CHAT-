import { useState, useEffect, useCallback } from "react";
import { admin } from "../../api/client";

export default function AdminDocuments() {
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admin.getAllDocuments({ page, limit: 30 });
      setDocs(res.data.data.documents);
      setTotal(res.data.data.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const statusColors = {
    completed: "text-green-400",
    processing: "text-yellow-400",
    pending: "text-blue-400",
    failed: "text-red-400",
  };

  const pages = Math.ceil(total / 30);

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-4">All Documents</h1>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">{total} documents across all users</p>

      {loading ? (
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs uppercase">
                  <th className="text-left px-4 py-3">Filename</th>
                  <th className="text-left px-4 py-3">Uploaded by</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Size</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Chunks</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d._id} className="border-t border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]">
                    <td className="px-4 py-3 text-xs font-medium truncate max-w-[200px]">{d.filename}</td>
                    <td className="px-4 py-3 text-xs">{d.userId?.name || d.userId?.email || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{d.mimeType}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{(d.size / 1024).toFixed(1)} KB</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${statusColors[d.status] || ""}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{d.chunkCount || 0}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">No documents uploaded yet</td>
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
