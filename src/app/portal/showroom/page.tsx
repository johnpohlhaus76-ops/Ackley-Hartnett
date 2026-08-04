"use client";

import { useState, useRef, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { getGoogleDriveFolderUrl, getMachineResources } from "@/lib/machine-videos";
import { Send, Play, Loader, Volume2, Zap } from "lucide-react";
import { AVATAR_CONFIG } from "@/lib/avatar-config";

type Language = keyof typeof AVATAR_CONFIG.greeting;

interface Message {
  role: "user" | "avatar";
  text: string;
  audioUrl?: string;
  language: Language;
}

export default function ShowroomPage() {
  const [language, setLanguage] = useState<Language>("english");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "avatar",
      text: AVATAR_CONFIG.greeting[language],
      language,
    },
  ]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>("vip5s");
  const audioRef = useRef<HTMLAudioElement>(null);

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
        audioRef.current.play().catch(() => {
          console.log("Autoplay prevented");
        });

        audioRef.current.onended = () => setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsSpeaking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setMessages((prev) => [...prev, { role: "user", text: userMessage, language }]);
    setIsLoading(true);
    setQuery("");

    try {
      const chatResponse = await fetch("/api/chat/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage, language }),
      });

      const chatData = await chatResponse.json();
      const aiResponse = chatData.response;

      const newMessage: Message = {
        role: "avatar",
        text: aiResponse,
        language,
      };

      setMessages((prev) => [...prev, newMessage]);
      await playAudio(aiResponse);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const MACHINES = [
    { id: "vip5s", name: "VIP 5S Laser Drill", desc: "High-speed laser drilling", icon: "🔬" },
    { id: "aarp", name: "AARP Printer", desc: "Advanced angle ramp", icon: "🖨️" },
    { id: "servo", name: "Servo Ramp", desc: "Servo-driven cantilever", icon: "⚙️" },
    { id: "spin", name: "SPIN System", desc: "Integrated inspection", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <audio ref={audioRef} />

      {/* Header */}
      <div className="relative z-10 sticky top-0 backdrop-blur-md bg-gradient-to-b from-slate-950 to-slate-950/0 border-b border-slate-700/50 pb-4">
        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Wei Lin
              </h1>
            </div>
            <p className="text-slate-400 text-sm ml-9">AI Sales Expert • Real Voice • Real-time Answers</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-140px)] max-w-7xl mx-auto gap-8 p-6">
        {/* Avatar Section - PREMIUM 4K READY */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm h-full">
            {/* Glow backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-500/30 rounded-3xl blur-3xl"></div>

            {/* Main Avatar Card */}
            <div className="relative h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-3xl border-2 border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500"></div>

              <div className="z-10 text-center px-8">
                {/* Large Avatar Animation */}
                <div className={`text-9xl mb-6 transition-transform duration-300 ${isSpeaking ? "animate-bounce" : "animate-float"}`}>
                  👩‍💼
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Wei Lin</h2>
                <p className="text-cyan-400 font-semibold text-sm mb-6">{AVATAR_CONFIG.description}</p>

                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-full w-fit mx-auto">
                  <div className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></div>
                  <span className="text-xs font-semibold text-cyan-300">
                    {isSpeaking ? "Speaking..." : "Ready"}
                  </span>
                </div>

                {/* Audio Visualization */}
                {isSpeaking && (
                  <div className="flex justify-center gap-1 mb-6">
                    <div className="w-1 h-6 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-8 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-1 h-6 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-8 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                    <div className="w-1 h-6 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                )}

                {/* Languages */}
                <div className="mt-8 pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500 mb-2">Fluent in {AVATAR_CONFIG.personality.languages.length} languages</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {AVATAR_CONFIG.personality.languages.slice(0, 5).map((lang) => (
                      <span key={lang} className="px-2 py-1 text-xs bg-slate-700/50 border border-slate-600/50 rounded-full text-slate-300">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat & Machines Section */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Machines */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏭</span> Featured Equipment
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {MACHINES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMachine(m.id)}
                  className={`p-4 rounded-xl transition-all duration-300 font-semibold text-sm ${
                    selectedMachine === m.id
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-400 shadow-lg shadow-blue-500/50 scale-105"
                      : "bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 hover:scale-105"
                  }`}
                >
                  {m.icon} {m.name}
                </button>
              ))}
            </div>

            {selectedMachine && getMachineResources(selectedMachine) && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-cyan-300 mb-2">{getMachineResources(selectedMachine)?.name}</h4>
                <p className="text-sm text-slate-400 mb-3">{getMachineResources(selectedMachine)?.description}</p>
                <a
                  href={getGoogleDriveFolderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
                >
                  <Play size={16} /> View Media
                </a>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 backdrop-blur-xl overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-5 py-3 rounded-2xl backdrop-blur-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-br-none"
                        : "bg-slate-700/60 border border-slate-600/50 text-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    {msg.role === "avatar" && msg.audioUrl && (
                      <button
                        onClick={() => playAudio(msg.text)}
                        className="mt-2 inline-flex items-center gap-1 text-xs bg-slate-600/50 hover:bg-slate-600 px-2 py-1 rounded transition-all"
                      >
                        <Volume2 size={14} /> Replay
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/60 border border-slate-600/50 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-2">
                      <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                      <span className="text-xs text-slate-300">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-700/50 p-4 bg-gradient-to-t from-slate-950 to-slate-900/50">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about machines, pricing, or capabilities..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  disabled={isLoading || isSpeaking}
                />
                <button
                  type="submit"
                  disabled={isLoading || isSpeaking || !query.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
