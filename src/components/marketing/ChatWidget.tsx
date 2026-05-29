"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Wrench, Target, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Bot = "tim" | "kyle";
type Msg = { role: "user" | "assistant"; content: string; intro?: boolean };

const BOTS = {
  tim: {
    name: "TIM",
    subtitle: "Maintenance & technical support",
    icon: Wrench,
    color: "bg-brand-600",
    greeting: "Hi, I'm TIM — the Technical Intelligence Module. I handle maintenance, troubleshooting, calibration, and validation for Ackley Hartnett machines. What's the issue?",
    suggestions: [
      "Ink print quality is inconsistent",
      "How do I calibrate the vision system?",
      "IQ/OQ documentation checklist",
      "Laser alignment procedure",
    ],
  },
  kyle: {
    name: "Kyle",
    subtitle: "Machine selection & specifications",
    icon: Target,
    color: "bg-laser-500",
    greeting: "Hey — I'm Kyle. Tell me about your product and throughput target and I'll find the right Ackley Hartnett machine for your line.",
    suggestions: [
      "Two-sided tablet marking at 200k/hr",
      "CO2 vs UV laser — what's the difference?",
      "Best machine for capsule printing?",
      "I need laser drilling for OROS tablets",
    ],
  },
} as const;

function useChatBot(bot: Bot) {
  const config = BOTS[bot];
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: config.greeting, intro: true },
  ]);
  const [busy, setBusy] = useState(false);

  // Reset when bot changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: BOTS[bot].greeting, intro: true }]);
  }, [bot]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history = messages.filter((m) => !m.intro);
    setMessages((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot, messages: [...history, { role: "user", content: question }] }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry — couldn't reach the assistant. Try again or call 215-969-9190." };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return { messages, busy, send };
}

function ChatPane({ bot, height }: { bot: Bot; height: string }) {
  const { messages, busy, send } = useChatBot(bot);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = BOTS[bot];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col" style={{ height }}>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-laser-500 text-ink"
                  : "border border-white/10 bg-white/5 text-slate-200",
              )}
            >
              {m.content || (busy && i === messages.length - 1
                ? <Loader2 size={16} className="animate-spin text-laser-300" />
                : null)}
            </div>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="space-y-2 pt-1">
            {config.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-medium text-slate-300 transition hover:border-laser-400/50 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); setInput(""); }}
        className="border-t border-white/10 bg-ink p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-laser-400/50">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={bot === "tim" ? "Describe the issue…" : "Tell me your product & throughput…"}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-laser-500 text-ink transition hover:bg-laser-400 disabled:opacity-40"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-slate-500">
          AI assistant — verify critical details with our team · 215-969-9190
        </p>
      </form>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [bot, setBot] = useState<Bot>("kyle");

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className={cn(
          "fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full text-ink shadow-2xl transition-all duration-300",
          "bg-laser-500 hover:bg-laser-400 hover:scale-105",
          open && "rotate-90",
        )}
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
        {!open && <span className="absolute inset-0 -z-10 rounded-full bg-laser-400/60 animate-pulse-ring" />}
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-5 z-[60] flex w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-2xl transition-all duration-300 sm:w-[400px]",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        style={{ height: "min(620px, calc(100vh - 9rem))" }}
      >
        {/* Header */}
        <div className="border-b border-white/10 bg-tech px-4 pb-0 pt-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-laser-300">
            Ackley Hartnett Specialists
          </p>
          {/* Tabs */}
          <div className="flex gap-1">
            {(["kyle", "tim"] as Bot[]).map((b) => {
              const cfg = BOTS[b];
              const Icon = cfg.icon;
              return (
                <button
                  key={b}
                  onClick={() => setBot(b)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-xs font-semibold transition",
                    bot === b
                      ? "bg-ink text-white border-t border-x border-white/10 -mb-px pb-[calc(0.5rem+1px)]"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  <Icon size={13} />
                  {cfg.name}
                  <span className="hidden sm:inline text-[10px] font-normal opacity-70">· {b === "kyle" ? "Selection" : "Maintenance"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat pane */}
        <ChatPane bot={bot} height="calc(100% - 72px)" />
      </div>
    </>
  );
}

/** Inline version for the homepage section */
export function AskBotsSection() {
  const [bot, setBot] = useState<Bot>("kyle");

  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          {/* Heading */}
          <div className="mb-8 text-center">
            <span className="eyebrow">AI Specialists</span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Ask TIM or Kyle
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Two AI specialists on call — one for technical support, one for machine selection.
            </p>
          </div>

          {/* Bot selector cards */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {(["kyle", "tim"] as Bot[]).map((b) => {
              const cfg = BOTS[b];
              const Icon = cfg.icon;
              const active = bot === b;
              return (
                <button
                  key={b}
                  onClick={() => setBot(b)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                    active
                      ? "border-brand-500 bg-white shadow-md ring-1 ring-brand-500/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white",
                      b === "kyle" ? "bg-laser-500" : "bg-brand-600",
                    )}
                  >
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className={cn("block text-base font-bold", active ? "text-brand-700" : "text-ink")}>
                      {cfg.name}
                    </span>
                    <span className="block text-xs text-slate-500">{cfg.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chat window */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-ink shadow-xl">
            {/* Bot header bar */}
            {(() => {
              const cfg = BOTS[bot];
              const Icon = cfg.icon;
              return (
                <div className="flex items-center gap-3 border-b border-white/10 bg-tech px-4 py-3">
                  <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-ink", bot === "kyle" ? "bg-laser-500" : "bg-brand-600")}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{cfg.name}</p>
                    <p className="text-[11px] text-laser-300">{cfg.subtitle}</p>
                  </div>
                </div>
              );
            })()}
            <ChatPane bot={bot} height="480px" />
          </div>
        </div>
      </div>
    </section>
  );
}
