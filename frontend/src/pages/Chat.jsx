import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineSparkles, HiOutlinePencilSquare, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import { chat as chatApi, conversations as conversationsApi } from "../api/client";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";

const suggestions = [
  { text: "Summarize my documents", icon: "📝" },
  { text: "What are the key findings?", icon: "🔍" },
  { text: "Explain the methodology", icon: "🧪" },
];

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const [convTitle, setConvTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const renameRef = useRef(null);
  const messagesEndRef = useRef(null);
  const streamConvId = useRef(null);
  const activeConvIdRef = useRef(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setConvTitle("");
      return;
    }

    const loadConversation = async () => {
      try {
        setLoadingConvo(true);
        setMessages([]);
        setRenaming(false);
        const res = await conversationsApi.getOne(conversationId);
        const conv = res.data.data;
        setConvTitle(conv.title || "New conversation");
        setMessages(
          (conv.messages || []).map((m) => ({
            role: m.role, content: m.content, timestamp: m.timestamp, sources: m.sources,
          }))
        );
      } catch {
        toast.error("Failed to load conversation");
        navigate("/chat", { replace: true });
      } finally {
        setLoadingConvo(false);
      }
    };

    loadConversation();
  }, [conversationId, navigate]);

  useEffect(() => {
    activeConvIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleToken = ({ token, conversationId: cid }) => {
      if (activeConvIdRef.current && cid !== activeConvIdRef.current) return;
      streamConvId.current = cid || activeConvIdRef.current;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last._streaming) {
          const updated = [...prev];
          updated[updated.length - 1] = { ...last, content: last.content + token };
          return updated;
        }
        return [...prev, { role: "assistant", content: token, _streaming: true, sources: [] }];
      });
    };

    const handleDone = ({ conversationId: cid, answer, sources }) => {
      if (activeConvIdRef.current && cid !== activeConvIdRef.current) return;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last._streaming) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant", content: answer, sources: sources || [], timestamp: new Date().toISOString(),
          };
          return updated;
        }
        return prev;
      });
      setSending(false);

      if (!activeConvIdRef.current) {
        navigate(`/chat/${cid}`, { replace: true });
      }
    };

    const handleError = ({ message, conversationId: cid }) => {
      if (cid && activeConvIdRef.current && cid !== activeConvIdRef.current) return;
      toast.error(message || "Streaming failed");
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last._streaming) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setSending(false);
    };

    socket.on("chat:token", handleToken);
    socket.on("chat:done", handleDone);
    socket.on("chat:error", handleError);

    return () => {
      socket.off("chat:token", handleToken);
      socket.off("chat:done", handleDone);
      socket.off("chat:error", handleError);
    };
  }, [socket, navigate]);

  const handleRenameStart = () => {
    setRenameInput(convTitle);
    setRenaming(true);
    setTimeout(() => renameRef.current?.select(), 50);
  };

  const handleRenameSubmit = async () => {
    const trimmed = renameInput.trim();
    if (!trimmed) {
      setRenaming(false);
      return;
    }
    try {
      await conversationsApi.rename(conversationId, trimmed);
      setConvTitle(trimmed);
    } catch {
      toast.error("Failed to rename conversation");
    }
    setRenaming(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameSubmit();
    }
    if (e.key === "Escape") {
      setRenaming(false);
    }
  };

  const handleSend = useCallback(async (question) => {
    const userMsg = { role: "user", content: question, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      await chatApi.askStream({ question, conversationId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get answer");
      setMessages((prev) => prev.slice(0, -1));
      setSending(false);
    }
  }, [conversationId]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] lg:h-screen">
      {loadingConvo ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[var(--accent)] rounded-full typing-dot" />
            <div className="w-2 h-2 bg-[var(--accent)] rounded-full typing-dot" />
            <div className="w-2 h-2 bg-[var(--accent)] rounded-full typing-dot" />
          </div>
        </div>
      ) : (
        <>
          {conversationId && (
            <div className="flex items-center gap-2 px-4 lg:px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-primary)] shrink-0">
              {renaming ? (
                <div className="flex items-center gap-1.5 flex-1 max-w-3xl mx-auto">
                  <input
                    ref={renameRef}
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleRenameSubmit}
                    className="flex-1 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    autoFocus
                  />
                  <button
                    onClick={handleRenameSubmit}
                    className="p-1.5 rounded hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRenaming(false)}
                    className="p-1.5 rounded hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 max-w-3xl mx-auto">
                  <h2 className="text-sm font-medium text-[var(--text-primary)] truncate">{convTitle}</h2>
                  <button
                    onClick={handleRenameStart}
                    className="p-1 rounded hover:bg-[var(--bg-card-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                    title="Rename conversation"
                  >
                    <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center max-w-lg">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
                  <HiOutlineSparkles className="w-7 h-7 text-[var(--accent)]" />
                </div>
                <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">How can I help you today?</h1>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {suggestions.map(({ text, icon }) => (
                    <button
                      key={text}
                      onClick={() => handleSend(text)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <span>{icon}</span>
                      <span>{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} />
                ))}
                {sending && (
                  <div className="flex items-start gap-4 animate-in-up">
                    <div className="w-8 h-8 rounded-md bg-[#5436da] flex items-center justify-center text-white text-xs shrink-0">
                      🤖
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] typing-dot" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {(!conversationId || messages.length > 0 || !loadingConvo) && (
        <ChatInput onSend={handleSend} loading={sending || loadingConvo} />
      )}
    </div>
  );
}
