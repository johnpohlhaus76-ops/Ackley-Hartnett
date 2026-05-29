"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; intro?: boolean };

const GREETING: Msg = {
  role: "assistant",
  intro: true,
  content:
    "Hi — I'm Ask AH, the Ackley Hartnett assistant. I can help you find the right tablet/capsule marking, drilling or inspection machine and explain how they support GMP. What are you working on?",
};

const SUGGESTIONS = [
  "Which machine for two-sided tablet marking?",
  "CO2 vs UV laser marking?",
  "Highest-throughput printer you make?",
  "How do you support GMP validation?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const history = messages.filter((m) => !m.intro);
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: question }],
        }),
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
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the assistant. Please try again, or contact info@ackleyhartnett.com.",
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

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
        {!open && (
          <span className="absolute inset-0 -z-10 rounded-full bg-laser-400/60 animate-pulse-ring" />
        )}
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-5 z-[60] flex w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-2xl transition-all duration-300 sm:w-[400px]",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
        style={{ height: "min(600px, calc(100vh - 9rem))" }}
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 border-b border-white/10 bg-tech px-4 py-3.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-laser-500 text-ink">
            <Sparkles size={18} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Ask AH</p>
            <p className="text-[11px] text-laser-300">Pharmaceutical machinery assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-laser-500 text-ink"
                    : "border border-white/10 bg-white/5 text-slate-200",
                )}
              >
                {m.content || (busy && i === messages.length - 1 ? (
                  <Loader2 size={16} className="animate-spin text-laser-300" />
                ) : (
                  m.content
                ))}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="space-y-2 pt-1">
              {SUGGESTIONS.map((s) => (
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

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-white/10 bg-ink p-3"
        >
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-laser-400/50">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our machines…"
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
            AI assistant — verify details with our team. Pricing via Request a Quote.
          </p>
        </form>
      </div>
    </>
  );
}/** Inline version for the homepage section */
export function AskBotsSection() {
  const [bot, setBot] = useState<Bot>("kyle");

  return (
    <section className="relative overflow-hidden bg-tech py-16 sm:py-20">
      {/* Background grid */}
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-laser-500/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl" />

      <div className="container-x relative">
        {/* Heading */}
        <div className="mb-8 text-center">
          <span className="eyebrow-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-laser-400" />
            AI Specialists — On Call 24/7
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ask <span className="gradient-text">TIM</span> or <span className="gradient-text">Kyle</span>
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-lg text-slate-400">
            Get instant answers from two AI specialists who know every Ackley Hartnett machine inside and out.
          </p>
        </div>

        {/* Bot selector cards */}
        <div className="mx-auto mb-6 grid max-w-2xl grid-cols-2 gap-4">
          {(["kyle", "tim"] as Bot[]).map((b) => {
            const cfg = BOTS[b];
            const Icon = cfg.icon;
            const active = bot === b;
            return (
              <button
                key={b}
                onClick={() => setBot(b)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200",
                  active
                    ? "border-laser-400/60 bg-white/10 shadow-lg ring-1 ring-laser-400/30"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink",
                    b === "kyle" ? "bg-laser-500" : "bg-brand-600",
                  )}
                >
                  <Icon size={22} />
                </span>
                <span>
                  <span className={cn("block text-base font-bold", active ? "text-white" : "text-slate-300")}>
                    {cfg.name}
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5">{cfg.subtitle}</span>
                </span>
                {active && (
                  <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-laser-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Chat window */}
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          {/* Bot header bar */}
          {(() => {
            const cfg = BOTS[bot];
            const Icon = cfg.icon;
            return (
              <div className="flex items-center gap-3 border-b border-white/10 bg-ink/80 px-5 py-3.5">
                <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-ink", bot === "kyle" ? "bg-laser-500" : "bg-brand-600")}>
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{cfg.name} <span className="font-normal text-laser-300">· {cfg.subtitle}</span></p>
                  <p className="text-[10px] text-slate-500">Powered by Claude · Ackley Hartnett AI</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </span>
              </div>
            );
          })()}
          <div className="bg-ink">
            <ChatPane bot={bot} height="420px" />
          </div>
        </div>
      </div>
    </section>
  );
}