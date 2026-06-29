import { useState, useEffect, useCallback } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineArchiveBoxXMark } from "react-icons/hi2";
import { documents as documentsApi } from "../api/client";
import DocumentCard from "../components/documents/DocumentCard";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

const tabs = ["all", "completed", "processing", "pending", "failed"];

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentsApi.list();
      setDocs(res.data.data || []);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await documentsApi.remove(confirmDelete);
      setDocs((prev) => prev.filter((d) => d._id !== confirmDelete));
      toast.success("Document deleted");
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = docs.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || doc.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {};
  tabs.forEach((t) => {
    counts[t] = t === "all" ? docs.length : docs.filter((d) => d.status === t).length;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Documents</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {docs.length === 0 ? "No documents uploaded yet" : `${docs.length} document${docs.length !== 1 ? "s" : ""}`}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                   filter === t
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t} ({counts[t]})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineArchiveBoxXMark className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">
              {search || filter !== "all" ? "No matches" : "No documents yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((doc, i) => (
              <div key={doc._id} className="animate-in" style={{ animationDelay: `${i * 0.02}s` }}>
                <DocumentCard document={doc} onDelete={setConfirmDelete} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
