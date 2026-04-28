"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  caseId?: string;
  messageId?: string;
  feedbackSent?: boolean;
}

interface SupportResponse {
  data: {
    success: boolean;
    response?: string;
    caseId?: string;
    messageId?: string;
    escalated?: boolean;
  };
  error: string | null;
}

interface FeedbackPayload {
  caseId: string;
  messageId: string;
  rating: "positive" | "negative";
}

export function SupportWidget({
  userId,
  userEmail,
  userName
}: {
  userId: string;
  userEmail: string;
  userName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
        text: `Hola${userName ? ` ${userName.split(" ")[0]}` : ""}! 👋 Bienvenida a soporte rwoman. ¿En qué podemos ayudarte?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/support/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const payload = (await res.json()) as SupportResponse;
      const agentText =
        payload.data?.response ??
        "Tu mensaje ha sido recibido. Un agente te responderá en breve.";

      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: agentText,
        caseId: payload.data?.caseId,
        messageId: payload.data?.messageId,
        feedbackSent: false
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "agent", text: "No se pudo enviar el mensaje. Inténtalo de nuevo." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendFeedback(msg: Message, rating: "positive" | "negative") {
    if (!msg.caseId || !msg.messageId || msg.feedbackSent) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, feedbackSent: true } : m))
    );

    try {
      await fetch("/api/support/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caseId: msg.caseId,
          messageId: msg.messageId,
          rating
        } satisfies FeedbackPayload)
      });
    } catch {
      // silencioso — el feedback no es crítico
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Soporte"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent text-black shadow-luxury transition hover:opacity-90 active:scale-95"
      >
        {open ? (
          <svg fill="none" height={20} stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" width={20}>
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg fill="none" height={22} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={22}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-luxury">

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-xs font-black text-black">
              RW
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Soporte rwoman</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                Activo ahora
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-accent text-black"
                      : "bg-white/8 text-white/90 border border-white/10"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Feedback buttons — solo en respuestas del agente con caseId */}
                {msg.role === "agent" && msg.caseId && !msg.feedbackSent && (
                  <div className="mt-1.5 flex gap-2">
                    <button
                      onClick={() => void sendFeedback(msg, "positive")}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50 transition hover:border-green-400/40 hover:text-green-400"
                    >
                      👍 Útil
                    </button>
                    <button
                      onClick={() => void sendFeedback(msg, "negative")}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50 transition hover:border-red-400/40 hover:text-red-400"
                    >
                      👎 No útil
                    </button>
                  </div>
                )}

                {msg.role === "agent" && msg.caseId && msg.feedbackSent && (
                  <p className="mt-1 text-xs text-white/30">Gracias por tu valoración</p>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-white/10 p-3">
            <input
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-brand-accent/60"
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
              placeholder="Escribe tu mensaje..."
              value={input}
            />
            <button
              disabled={loading || !input.trim()}
              onClick={() => void sendMessage()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-black transition hover:opacity-90 disabled:opacity-40"
            >
              <svg fill="none" height={16} stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" width={16}>
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <p className="pb-2 text-center text-[10px] text-white/20">
            Soporte privado · rwoman
          </p>
        </div>
      )}
    </>
  );
}
