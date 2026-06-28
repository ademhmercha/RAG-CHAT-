import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineSparkles, HiOutlineMagnifyingGlass, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { chat as chatApi, conversations as conversationsApi } from "../api/client";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import toast from "react-hot-toast";

const suggestions = [
  { text: "Summarize my documents", icon: "📝" },
  { text: "What are the key findings?", icon: "🔍" },
  { text: "Explain the methodology", icon: "🧪" },
];

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const messagesEndRef = useRef(null);

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
      return;
    }

    const loadConversation = async () => {
      try {
        setLoadingConvo(true);
        setMessages([]);
        const res = await conversationsApi.getOne(conversationId);
        const conv = res.data.data;
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

  const handleSend = async (question) => {
    const userMsg = { role: "user", content: question, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await chatApi.ask({ question, conversationId });
      const { answer, sources, conversationId: newConvId } = res.data.data;

      setMessages((prev) => [...prev, {
        role: "assistant", content: answer, sources: sources || [], timestamp: new Date().toISOString(),
      }]);

      if (!conversationId || conversationId !== newConvId) {
        window.history.replaceState(null, "", `/chat/${newConvId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get answer");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

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
      ) : messages.length === 0 ? (
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

      {(!conversationId || messages.length > 0 || !loadingConvo) && (
        <ChatInput onSend={handleSend} loading={sending || loadingConvo} />
      )}
    </div>
  );
}
