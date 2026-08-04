"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Volume2,
  Loader,
  FileText,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Play,
  Download,
  Share2,
  Calendar,
  DollarSign,
  CheckCircle2,
  Volume,
  VolumeX,
  Zap,
} from "lucide-react";
import { AudioVisualization } from "@/components/AudioVisualization";

interface Account {
  id: string;
  name: string;
  revenue: number;
  stage: "prospect" | "qualified" | "negotiating" | "won";
  nextAction: string;
  avatar?: string;
}

interface Quote {
  id: string;
  accountId: string;
  amount: number;
  items: string[];
  expiryDate: string;
  status: "draft" | "sent" | "viewed" | "accepted";
}

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export default function EnterprisePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "accounts" | "quotes" | "media" | "ai">("dashboard");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockAccounts: Account[] = [
    {
      id: "1",
      name: "Catalent Pharma Solutions",
      revenue: 2500000,
      stage: "qualified",
      nextAction: "Send proposal",
      avatar: "🏢",
    },
    {
      id: "2",
      name: "McNeil Healthcare",
      revenue: 1800000,
      stage: "negotiating",
      nextAction: "Demo scheduled",
      avatar: "🏥",
    },
    {
      id: "3",
      name: "Patheon NV",
      revenue: 3200000,
      stage: "prospect",
      nextAction: "Initial call",
      avatar: "🔬",
    },
  ];

  const mockQuotes: Quote[] = [
    {
      id: "Q001",
      accountId: "1",
      amount: 850000,
      items: ["VIP 5S Laser Drill System", "Service Package", "Training"],
      expiryDate: "2026-09-01",
      status: "sent",
    },
    {
      id: "Q002",
      accountId: "2",
      amount: 450000,
      items: ["AARP Printer", "Installation", "Support"],
      expiryDate: "2026-08-15",
      status: "viewed",
    },
  ];

  const speakText = async (text: string) => {
    if (isMuted) return;

    try {
      setIsSpeaking(true);
      const response = await fetch("/api/avatar/speak", {
        method: "POST",
        body: JSON.stringify({ text, language: "english" }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.volume = isMuted ? 0 : 1;
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.play().catch(() => setIsSpeaking(false));
      }
    } catch (error) {
      setIsSpeaking(false);
    }
  };

  const handleAIQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: inputText, timestamp: Date.now() }]);
    setIsLoading(true);
    const query = inputText;
    setInputText("");

    try {
      const response = await fetch("/api/chat/service", {
        method: "POST",
        body: JSON.stringify({ query, language: "english" }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.response, timestamp: Date.now() }]);
      await speakText(data.response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "prospect":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "qualified":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "negotiating":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "won":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return "✓";
      case "accepted":
        return "✓";
      case "viewed":
        return "👁️";
      case "sent":
        return "📤";
      default:
        return "📝";
    }
  };

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <style>{`
        * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .enterprise-glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(71, 85, 105, 0.3); }
        .tab-active { border-b-2 border-blue-500 text-white }
        .tab-inactive { border-b-2 border-transparent text-slate-400 hover:text-slate-300 }
        .stat-card { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(59, 130, 246, 0.2); }
        .account-card { background: linear-gradient(135deg, rgba(71, 85, 105, 0.2) 0%, rgba(51, 65, 85, 0.1) 100%); border: 1px solid rgba(71, 85, 105, 0.3); transition: all 0.3s; }
        .account-card:hover { border-color: rgba(59, 130, 246, 0.5); background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%); }
        .quote-item { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(71, 85, 105, 0.2); }
        .message-ai { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(59, 130, 246, 0.3); }
        .message-user { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(59, 130, 246, 0.5); }
      `}</style>

      <audio ref={audioRef} />

      {/* Sidebar */}
      <div className="w-64 enterprise-glass border-r border-slate-700/50 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Ackley Hartnett
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Sales</p>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "accounts", label: "Accounts", icon: "👥" },
            { id: "quotes", label: "Quotes", icon: "📄" },
            { id: "media", label: "Media", icon: "🎬" },
            { id: "ai", label: "Wei Lin AI", icon: "🤖" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500/20 text-white border border-blue-500/50"
                  : "text-slate-400 hover:bg-slate-700/30"
              }`}
            >
              <span className="text-lg mr-3">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2">
          <Plus size={18} /> New Quote
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="enterprise-glass border-b border-slate-700/50 px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {activeTab === "dashboard" && "Sales Dashboard"}
            {activeTab === "accounts" && "Account Management"}
            {activeTab === "quotes" && "Quote Builder"}
            {activeTab === "media" && "Media Presenter"}
            {activeTab === "ai" && "Wei Lin Assistant"}
          </h2>
          <div className="flex items-center gap-4">
            {isSpeaking && (
              <div className="flex items-center gap-2">
                <AudioVisualization isPlaying={isSpeaking} width={100} height={30} />
                <span className="text-xs text-cyan-400 font-semibold">Speaking...</span>
              </div>
            )}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-lg transition-colors ${
                isMuted ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "hover:bg-slate-700/30 text-slate-400 hover:text-white"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <a href="/portal/setup" className="p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
              <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: "$7.5M", change: "+12%" },
                  { label: "Active Deals", value: "24", change: "+3" },
                  { label: "Win Rate", value: "68%", change: "+5%" },
                  { label: "Avg Deal Size", value: "$312K", change: "-2%" },
                ].map((kpi, i) => (
                  <div key={i} className="stat-card p-6 rounded-xl">
                    <p className="text-sm text-slate-400 mb-2">{kpi.label}</p>
                    <p className="text-3xl font-bold text-white mb-1">{kpi.value}</p>
                    <p className="text-xs text-emerald-400">{kpi.change}</p>
                  </div>
                ))}
              </div>

              {/* Pipeline */}
              <div className="enterprise-glass p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Sales Pipeline</h3>
                <div className="space-y-3">
                  {mockAccounts.map((acc) => (
                    <div key={acc.id} className="account-card p-4 rounded-lg cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white">{acc.name}</p>
                          <p className="text-sm text-slate-400">{acc.nextAction}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(acc.stage)}`}>
                          {acc.stage.charAt(0).toUpperCase() + acc.stage.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-cyan-400">${(acc.revenue / 1000000).toFixed(1)}M</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accounts */}
          {activeTab === "accounts" && (
            <div className="space-y-4">
              {mockAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="account-card p-6 rounded-xl cursor-pointer"
                  onClick={() => setSelectedAccount(acc)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="text-4xl">{acc.avatar}</div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{acc.name}</h3>
                        <p className="text-sm text-slate-400">Revenue: ${(acc.revenue / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(acc.stage)}`}>
                      {acc.stage}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all">
                      Send Quote
                    </button>
                    <button className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-all">
                      Schedule Demo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quotes */}
          {activeTab === "quotes" && (
            <div className="space-y-4">
              {mockQuotes.map((quote) => {
                const account = mockAccounts.find((a) => a.id === quote.accountId);
                return (
                  <div key={quote.id} className="enterprise-glass p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-slate-400">Quote ID: {quote.id}</p>
                        <h3 className="text-lg font-bold text-white mt-1">{account?.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-400">${(quote.amount / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-slate-400 mt-1">Expires: {quote.expiryDate}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {quote.items.map((item, i) => (
                        <div key={i} className="quote-item p-2 rounded text-sm text-slate-300 flex items-center gap-2">
                          <span>•</span>
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                      <div className={`flex items-center gap-2 text-sm font-semibold ${quote.status === "viewed" ? "text-yellow-400" : quote.status === "accepted" ? "text-emerald-400" : "text-slate-400"}`}>
                        <span className="text-lg">{getStatusIcon(quote.status)}</span>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                          <Download size={18} />
                        </button>
                        <button className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Media */}
          {activeTab === "media" && (
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: "VIP 5S Demo", duration: "8:32", views: "324" },
                { title: "AARP Printer Walkthrough", duration: "12:45", views: "156" },
                { title: "Product Catalog PDF", duration: "—", views: "89" },
                { title: "Pricing Guide", duration: "—", views: "203" },
              ].map((media, i) => (
                <div key={i} className="enterprise-glass p-6 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-lg mb-4 flex items-center justify-center">
                    <Play className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{media.title}</h3>
                  <p className="text-xs text-slate-400">
                    {media.duration} • {media.views} views
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* AI Assistant */}
          {activeTab === "ai" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">👩‍💼</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Wei Lin Assistant</h3>
                    <p className="text-slate-400 max-w-md mb-6">Ask about machines, pricing, customer needs, or get AI sales coaching</p>

                    {/* Test Speaker Section */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 w-full max-w-sm mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white">Test Your Speakers</h4>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Click to test if audio works on your device</p>
                      <button
                        onClick={() => {
                          try {
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.value = 440;
                            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                            oscillator.start(audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                            oscillator.stop(audioContext.currentTime + 0.5);
                          } catch (e) {
                            console.log("Audio test failed:", e);
                          }
                        }}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
                      >
                        🔊 Play Test Sound
                      </button>
                      <p className="text-xs text-slate-500 mt-3">You should hear a beep</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`max-w-2xl rounded-lg p-4 ${msg.role === "user" ? "message-user ml-auto" : "message-ai"}`}
                      >
                        <p className="text-white">{msg.text}</p>
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => speakText(msg.text)}
                            className="mt-2 inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Volume2 size={14} /> Speak
                          </button>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="message-ai max-w-2xl rounded-lg p-4 flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-slate-300">Thinking...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form onSubmit={handleAIQuery} className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Wei Lin anything..."
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={isLoading || isSpeaking}
                />
                <button
                  type="submit"
                  disabled={isLoading || isSpeaking || !inputText.trim()}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
