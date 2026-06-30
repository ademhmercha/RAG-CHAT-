import { useState, useEffect } from "react";
import { admin } from "../../api/client";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    admin
      .getSettings()
      .then((res) => setSettings(res.data.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await admin.updateSettings(settings);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const key = newKey.trim();
    if (!key) return toast.error("Key is required");
    if (key in settings) return toast.error("Key already exists");
    setSettings((prev) => ({ ...prev, [key]: newValue.trim() }));
    setNewKey("");
    setNewValue("");
  };

  const handleRemove = (key) => {
    const next = { ...settings };
    delete next[key];
    setSettings(next);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Settings</h1>

      <div className="flex items-end gap-2 mb-6 p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-1 uppercase">Key</label>
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="e.g. MAX_FILE_SIZE_MB"
            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-1 uppercase">Value</label>
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="e.g. 50"
            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newKey.trim()}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-white rounded-md hover:opacity-90 disabled:opacity-40"
        >
          <HiOutlinePlus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {Object.keys(settings).length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">No settings yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-0.5 uppercase">Key</label>
                  <span className="text-xs text-[var(--text-primary)] font-medium">{key}</span>
                </div>
                <div className="flex items-center gap-1">
                  <label className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-0.5 uppercase">Value</label>
                  <input
                    value={value ?? ""}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 px-2 py-1 text-xs bg-[var(--bg-input)] border border-[var(--border)] rounded text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
              <button
                onClick={() => handleRemove(key)}
                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      )}
    </div>
  );
}
