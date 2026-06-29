import { HiOutlineExclamationTriangle, HiOutlineXMark } from "react-icons/hi2";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
        <div
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-sm animate-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                <HiOutlineExclamationTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
            </div>
            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-tertiary)]">
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-3">
            <p className="text-sm text-[var(--text-secondary)]">{message}</p>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
