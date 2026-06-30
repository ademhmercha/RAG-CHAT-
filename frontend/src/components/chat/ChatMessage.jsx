import { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineDocumentText, HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";

function SourceCard({ source }) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
      <HiOutlineDocumentText className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--text-primary)] opacity-70 line-clamp-2 leading-relaxed">{source.text}</p>
        {source.metadata && (
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1 truncate">
            {source.metadata.filename || source.metadata.source || "Unknown"}
          </p>
        )}
      </div>
      {source.score != null && (
        <span className="text-[10px] text-[var(--text-tertiary)] font-mono shrink-0">
          {(source.score * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

export default function ChatMessage({ message }) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const sources = message.sources || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-start"} animate-in-up`}>
      <div className="w-full max-w-3xl">
        <div className="flex items-start gap-4">
          {isUser ? (
            <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center text-white text-xs font-medium shrink-0">
              U
            </div>
          ) : (
            <div className="w-8 h-8 rounded-md bg-[#5436da] flex items-center justify-center text-white text-xs shrink-0">
              🤖
            </div>
          )}

          <div className="flex-1 min-w-0 pt-1">
            <p className="text-sm leading-7 whitespace-pre-wrap text-[var(--text-primary)]">{message.content}</p>

            {!isUser && sources.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <HiOutlineDocumentText className="w-3.5 h-3.5" />
                  <span>{sources.length} source{sources.length > 1 ? "s" : ""}</span>
                  {showSources ? <HiOutlineChevronUp className="w-3 h-3" /> : <HiOutlineChevronDown className="w-3 h-3" />}
                </button>

                {showSources && (
                  <div className="mt-2 space-y-1.5">
                    {sources.map((source, i) => (
                      <SourceCard key={i} source={source} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              {!isUser && message.fallbackOccurred && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium">
                  ⚠️ Fallback: {message.providerUsed || "?"}
                </span>
              )}
              {!isUser && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {copied ? (
                    <><HiOutlineClipboardDocumentCheck className="w-3.5 h-3.5 text-[var(--accent)]" /><span className="text-[var(--accent)]">Copied</span></>
                  ) : (
                    <><HiOutlineClipboardDocument className="w-3.5 h-3.5" /><span>Copy</span></>
                  )}
                </button>
              )}
              {message.timestamp && (
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
