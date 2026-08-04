"use client";

import { useState, useRef, useEffect } from "react";
import { AVATAR_CONFIG } from "@/lib/avatar-config";
import { LanguageSelector } from "@/components/LanguageSelector";
import { getGoogleDriveFolderUrl, getMachineResources } from "@/lib/machine-videos";
import { Volume2, Send, FileText, ExternalLink, Play, ChevronRight } from "lucide-react";

type Language = keyof typeof AVATAR_CONFIG.greeting;

export default function VirtualShowroomPage() {
  const [language, setLanguage] = useState<Language>("english");
  const [query, setQuery] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; text: string; language: Language }>>([
    {
      role: "avatar",
      text: AVATAR_CONFIG.greeting[language],
      language,
    },
  ]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>("vip5s");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          role: "avatar",
          text: AVATAR_CONFIG.greeting[language],
          language,
        },
      ]);
    }
  }, [language]);

  const handleSpeak = async (text: string) => {
    setIsSpeaking(true);
    try {
      console.log(`Wei Lin speaking in ${language}: ${text}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query, language }]);
    setIsLoading(true);
    setQuery("");

    try {
      const response = await fetch("/api/chat/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, language }),
      });

      const data = await response.json();
      const avatarResponse = data.response;
      setMessages((prev) => [...prev, { role: "avatar", text: avatarResponse, language }]);
      await handleSpeak(avatarResponse);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "avatar", text: "I encountered an error. Please try again.", language: "english" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const MACHINES = [
    { id: "vip5s", name: "VIP 5S Laser Drill", description: "High-speed laser drilling", icon: "🔬" },
    { id: "aarp", name: "AARP Printer", description: "Advanced angle ramp", icon: "🖨️" },
    { id: "servo", name: "Servo Ramp", description: "Servo-driven cantilever", icon: "⚙️" },
    { id: "spin", name: "SPIN System", description: "Integrated inspection", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 sticky top-0 backdrop-blur-md bg-slate-950/80 border-b border-slate-700/50">
        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ✨ Virtual Showroom
            </h1>
            <p className="text-slate-400 text-sm mt-1">Meet Wei Lin - AI Sales Expert</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-120px)] max-w-7xl mx-auto gap-6 p-6">
        {/* Avatar Section - Premium */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Avatar Card */}
          <div className="relative w-full max-w-md h-96">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>

            {/* Avatar container */}
            <div className="relative h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

              <div className="text-center">
                <div className="text-8xl mb-6 animate-float">👩‍💼</div>
                <h2 className="text-2xl font-bold text-white mb-1">{AVATAR_CONFIG.name}</h2>
                <p className="text-slate-400 mb-6">{AVATAR_CONFIG.description}</p>

                {isSpeaking && (
                  <div className="flex justify-center gap-2 mb-4">
                    <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                )}

                <div className="text-sm text-slate-400 mt-4">
                  {isSpeaking ? "🎤 Speaking..." : "✓ Ready to assist"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Premium */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Machine Selection - Premium Cards */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🏭</span> Featured Machines
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {MACHINES.map((machine) => (
                <button
                  key={machine.id}
                  onClick={() => setSelectedMachine(machine.id)}
                  className={`p-4 rounded-xl transition-all duration-300 transform ${
                    selectedMachine === machine.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400/50 shadow-lg shadow-blue-500/50 scale-105"
                      : "bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50 hover:scale-105"
                  }`}
                >
                  <p className="text-sm font-semibold">{machine.icon} {machine.name}</p>
                  <p className="text-xs text-slate-300 mt-1">{machine.description}</p>
                </button>
              ))}
            </div>

            {/* Machine Specs - Premium Display */}
            {selectedMachine && getMachineResources(selectedMachine) && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {getMachineResources(selectedMachine)?.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">
                      {getMachineResources(selectedMachine)?.description}
                    </p>
                  </div>
                  <a
                    href={getGoogleDriveFolderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-xs font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
                  >
                    <Play size={14} />
                    Files
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(
                    getMachineResources(selectedMachine)?.specs || {}
                  ).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                      <p className="text-slate-400 text-xs capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </p>
                      <p className="font-bold text-sm text-blue-400 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Area - Premium */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 backdrop-blur-xl overflow-hidden">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl backdrop-blur-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-br-none"
                        : "bg-slate-700/50 text-slate-100 border border-slate-600/50 rounded-bl-none"
                    }`}
                  >
                    {msg.role === "avatar" && (
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="mb-2 flex items-center gap-1 text-xs bg-slate-600/50 hover:bg-slate-600 px-2 py-1 rounded transition-all"
                      >
                        <Volume2 size={12} />
                        Speak
                      </button>
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-600/50">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-700/50 p-4 bg-slate-900/50">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    language === "chinese"
                      ? "向我提问..."
                      : language === "spanish"
                      ? "Pregúntame..."
                      : "Ask Wei Lin..."
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={isLoading || isSpeaking}
                />
                <button
                  type="submit"
                  disabled={isLoading || isSpeaking || !query.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 text-slate-500 text-xs border-t border-slate-700/50 backdrop-blur-sm">
        Wei Lin supports {AVATAR_CONFIG.personality.languages.length} languages • Powered by Ackley Hartnett
      </div>
    </div>
  );
}
