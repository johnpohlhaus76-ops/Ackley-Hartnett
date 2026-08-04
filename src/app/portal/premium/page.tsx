"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Volume2, Loader, Play, Settings } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

type Language = "english" | "chinese" | "japanese" | "korean" | "spanish" | "german" | "thai" | "vietnamese" | "italian" | "portuguese" | "swiss-german";

interface Message {
  role: "user" | "avatar";
  text: string;
  timestamp: number;
}

export default function PremiumShowroom() {
  const [language, setLanguage] = useState<Language>("english");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch("/api/avatar/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      const data = await response.json();
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.play().catch(() => setIsSpeaking(false));
      }
    } catch (error) {
      console.error("Error:", error);
      setIsSpeaking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query, timestamp: Date.now() }]);
    setIsLoading(true);
    const userQuery = query;
    setQuery("");

    try {
      const response = await fetch("/api/chat/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, language }),
      });

      const data = await response.json();
      const avatarMessage: Message = {
        role: "avatar",
        text: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, avatarMessage]);
      await playAudio(data.response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        .premium-bg {
          background: radial-gradient(ellipse 80% 80% at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse 80% 80% at 50% 100%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
        }

        .glass-effect {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }

        .avatar-glow {
          position: relative;
        }

        .avatar-glow::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            #3b82f6,
            #06b6d4,
            #8b5cf6,
            #3b82f6
          );
          animation: spin 4s linear infinite;
          opacity: 0.3;
          z-index: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float-alt {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .avatar-display {
          animation: float-alt 3s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
        }

        .speaking-indicator {
          display: flex;
          gap: 4px;
          align-items: flex-end;
        }

        .speaking-indicator span {
          width: 3px;
          background: linear-gradient(to top, #3b82f6, #06b6d4);
          border-radius: 2px;
          animation: audio-bar 0.6s ease-in-out infinite;
        }

        .speaking-indicator span:nth-child(2) {
          animation-delay: 0.1s;
          height: 20px;
        }

        .speaking-indicator span:nth-child(1) {
          animation-delay: 0.2s;
          height: 14px;
        }

        .speaking-indicator span:nth-child(3) {
          animation-delay: 0.3s;
          height: 24px;
        }

        @keyframes audio-bar {
          0%, 100% { height: 8px; }
          50% { height: 100%; }
        }

        .message-enter {
          animation: slide-up 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        input::placeholder {
          color: rgba(148, 163, 184, 0.7);
        }

        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1),
                      inset 0 0 0 1px rgba(59, 130, 246, 0.5);
        }

        button:active {
          transform: scale(0.98);
        }
      `}</style>

      <audio ref={audioRef} />

      <div className="premium-bg h-screen flex flex-col">
        {/* Header */}
        <div className="glass-effect border-b border-slate-700/50 px-8 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-black gradient-text">Wei Lin</h1>
              <p className="text-slate-400 text-sm mt-2">AI Sales Specialist • Multi-lingual • Real-time Responses</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <button className="p-3 rounded-lg glass-effect hover:bg-slate-700/50 transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Avatar Section */}
          <div className="w-1/3 flex flex-col items-center justify-center px-8 border-r border-slate-700/50 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center">
              <div className="avatar-glow mb-8">
                <div className="relative z-10 avatar-display text-9xl drop-shadow-lg">
                  👩‍💼
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Wei Lin</h2>
              <p className="text-cyan-400 text-sm font-medium mb-8">Professional Sales Representative</p>

              {/* Status */}
              <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-full glass-effect ${isSpeaking ? "border-red-500/50" : "border-emerald-500/50"}`}>
                {isSpeaking ? (
                  <>
                    <div className="speaking-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="text-sm font-semibold text-red-400">Speaking</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-semibold text-emerald-400">Ready</span>
                  </>
                )}
              </div>

              {/* Languages */}
              <div className="mt-12 pt-8 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 mb-4">SUPPORTED LANGUAGES</p>
                <div className="grid grid-cols-3 gap-2">
                  {["English", "中文", "日本語", "한국어", "Español", "Deutsch"].map((lang) => (
                    <span key={lang} className="text-xs font-medium text-slate-400 px-2 py-1 rounded glass-effect">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-6">💬</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Start a Conversation</h3>
                  <p className="text-slate-400 max-w-md">
                    Ask Wei Lin about our pharmaceutical equipment, pricing, capabilities, or anything else about Ackley Hartnett.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-sm px-6 py-4 rounded-2xl ${
                          msg.role === "user"
                            ? "gradient-text bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-br-none"
                            : "bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed text-white">{msg.text}</p>
                        {msg.role === "avatar" && (
                          <button
                            onClick={() => playAudio(msg.text)}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <Volume2 size={14} /> Replay
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="message-enter flex justify-start">
                      <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-bl-none">
                        <div className="speaking-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="glass-effect border-t border-slate-700/50 px-8 py-6">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Wei Lin anything about our equipment..."
                  className="flex-1 px-6 py-4 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white transition-all duration-300"
                  disabled={isLoading || isSpeaking}
                />
                <button
                  type="submit"
                  disabled={isLoading || isSpeaking || !query.trim()}
                  className="px-8 py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2"
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
