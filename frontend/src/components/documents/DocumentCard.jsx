import { HiOutlineTrash, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineCpuChip } from "react-icons/hi2";

const statusConfig = {
  pending: { icon: HiOutlineClock, label: "Pending", color: "text-amber-400" },
  processing: { icon: HiOutlineCpuChip, label: "Processing", color: "text-blue-400" },
  completed: { icon: HiOutlineCheckCircle, label: "Completed", color: "text-[var(--accent)]" },
  failed: { icon: HiOutlineXCircle, label: "Failed", color: "text-red-400" },
};

const formatSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (date) => {
  const d = new Date(date);
  const diff = Date.now() - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getExt = (name) => name?.split(".").pop()?.toUpperCase() || "FILE";

export default function DocumentCard({ document: doc, onDelete }) {
  const status = statusConfig[doc.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const ext = getExt(doc.filename);

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(doc._id);
  };

  return (
    <div className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--bg-card-hover)] transition-colors relative">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--bg-main)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] border border-[var(--border)] shrink-0">
          {ext}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.filename}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
            <span>{formatSize(doc.size)}</span>
            <span>·</span>
            <span>{formatDate(doc.createdAt)}</span>
            {doc.chunkCount > 0 && <><span>·</span><span>{doc.chunkCount} chunks</span></>}
          </div>
        </div>

        <div className={`flex items-center gap-1 text-xs shrink-0 mt-0.5 ${status.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{status.label}</span>
        </div>
      </div>

      {doc.status === "processing" && (
        <div className="mt-3 w-full bg-[var(--bg-main)] rounded-full h-1 overflow-hidden">
          <div className="h-full w-2/3 bg-[var(--accent)] rounded-full animate-pulse" />
        </div>
      )}

      {doc.error && (
        <p className="mt-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-2.5 py-1.5">{doc.error}</p>
      )}

      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all
          hover:bg-red-400/10 text-[var(--text-tertiary)] hover:text-red-400"
      >
        <HiOutlineTrash className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
