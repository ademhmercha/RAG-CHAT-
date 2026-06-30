import { useState, useEffect, useRef } from "react";
import { HiOutlineChevronDown, HiOutlineKey, HiOutlineArrowTopRightOnSquare, HiOutlineCheckCircle } from "react-icons/hi2";
import { llm as llmApi } from "../../api/client";

const STORAGE_KEY = "rag-model-prefs";

const loadPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const savePrefs = (prefs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

export default function ModelSelector({ onProviderChange }) {
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    llmApi.getProviders().then((res) => {
      const list = res.data.data;
      setProviders(list);
      const prefs = loadPrefs();
      const savedProvider = list.find((p) => p.id === prefs.provider) || list[0];
      setSelected(savedProvider);
      if (savedProvider.requiresKey && prefs.apiKey) {
        setApiKey(prefs.apiKey);
      }
    }).catch(() => {
      setProviders([
        { id: "ollama", name: "Ollama", models: ["llama3.2"], defaultModel: "llama3.2", requiresKey: false, keyLink: null },
        { id: "groq", name: "Groq", models: ["llama-3.3-70b-versatile"], defaultModel: "llama-3.3-70b-versatile", requiresKey: true, keyLink: "https://console.groq.com/keys", keyPlaceholder: "gsk_..." },
        { id: "gemini", name: "Google Gemini", models: ["gemini-2.5-flash"], defaultModel: "gemini-2.5-flash", requiresKey: true, keyLink: "https://aistudio.google.com/apikey", keyPlaceholder: "AIza..." },
        { id: "openrouter", name: "OpenRouter", models: ["meta-llama/llama-3.3-70b-instruct:free"], defaultModel: "meta-llama/llama-3.3-70b-instruct:free", requiresKey: true, keyLink: "https://openrouter.ai/keys", keyPlaceholder: "sk-or-..." },
      ]);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectProvider = (provider) => {
    setSelected(provider);
    setOpen(false);
    setSaved(false);
    if (!provider.requiresKey) {
      const prefs = loadPrefs();
      prefs.provider = provider.id;
      prefs.apiKey = "";
      savePrefs(prefs);
      onProviderChange({ provider: provider.id, model: provider.defaultModel, apiKey: "" });
    }
  };

  const saveApiKey = () => {
    const trimmed = apiKey.trim();
    const prefs = loadPrefs();
    prefs.provider = selected.id;
    prefs.apiKey = trimmed;
    savePrefs(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onProviderChange({ provider: selected.id, model: selected.defaultModel, apiKey: trimmed });
  };

  if (!selected) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-1.5 py-1 rounded-md hover:bg-[var(--bg-card-hover)]"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${selected.requiresKey ? 'bg-yellow-500' : 'bg-green-500'}`} />
        {selected.name}
        <HiOutlineChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg shadow-black/20 z-50">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Model Provider</p>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProvider(p)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-card-hover)] ${
                  selected.id === p.id ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${p.requiresKey ? (p.hasKey ? 'bg-green-500' : 'bg-yellow-500') : 'bg-green-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] truncate">{p.defaultModel}</p>
                </div>
                {!p.requiresKey && (
                  <span className="text-[10px] text-green-500 font-medium">Free</span>
                )}
              </button>
            ))}
          </div>

          {selected.requiresKey && (
            <div className="border-t border-[var(--border)] px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineKey className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") saveApiKey(); }}
                  placeholder={selected.keyPlaceholder || "Enter API key"}
                  className="flex-1 text-xs bg-[var(--bg-input)] border border-[var(--border)] rounded-md px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="flex items-center justify-between">
                <a
                  href={selected.keyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
                >
                  <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                  Get API key
                </a>
                <button
                  onClick={saveApiKey}
                  disabled={!apiKey.trim()}
                  className="flex items-center gap-1 text-[11px] font-medium text-white bg-[var(--accent)] hover:opacity-90 disabled:opacity-40 px-2.5 py-1 rounded-md transition-opacity"
                >
                  {saved ? (
                    <><HiOutlineCheckCircle className="w-3 h-3" /> Saved</>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          )}

          {!selected.requiresKey && (
            <div className="border-t border-[var(--border)] px-3 py-2">
              <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                <HiOutlineCheckCircle className="w-3 h-3 text-green-500" />
                No API key needed
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
