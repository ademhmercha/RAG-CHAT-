import { useState, useRef, useEffect } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import ModelSelector from "./ModelSelector";

export default function ChatInput({ onSend, loading, onProviderChange }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-[var(--border)] bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent px-4 py-3">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="input-bg rounded-2xl border border-[var(--border)] transition-colors duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            className="input-field-chat w-full max-h-[200px] px-4 pt-3 pb-2 resize-none rounded-t-2xl"
            disabled={loading}
          />
          <div className="flex items-center justify-between px-3 pb-2.5">
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <HiOutlinePaperAirplane className="w-4 h-4" />
            </button>
            <ModelSelector onProviderChange={onProviderChange} />
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2">
          RAG Assistant can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}
