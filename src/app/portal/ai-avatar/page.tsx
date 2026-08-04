"use client";

import { useState, useRef, useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { getGoogleDriveFolderUrl, getMachineResources } from "@/lib/machine-videos";
import { Send, FileText, ExternalLink, Play, Loader } from "lucide-react";
import { AVATAR_CONFIG } from "@/lib/avatar-config";

type Language = keyof typeof AVATAR_CONFIG.greeting;

interface Message {
  role: "user" | "avatar";
  text: string;
  videoUrl?: string;
  language: Language;
}

export default function AIAvatarPage() {
  const [language, setLanguage] = useState<Language>("english");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "avatar",
      text: AVATAR_CONFIG.greeting[language],
      language,
    },
  ]);
  const [selectedMachine, setSelectedMachine] = useState<string | null>("vip5s");
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setMessages((prev) => [...prev, { role: "user", text: userMessage, language }]);
    setIsLoading(true);
    setQuery("");

    try {
      // Get AI response
      const chatResponse = await fetch("/api/chat/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage, language }),
      });

      const chatData = await chatResponse.json();
      const aiResponse = chatData.response;

      // Generate avatar video
      const videoResponse = await fetch("/api/avatar/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiResponse, language }),
      });

      const videoData = await videoResponse.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "avatar",
          text: aiResponse,
          videoUrl: videoData.videoUrl,
          language,
        },
      ]);

      // Auto-play video
      if (videoRef.current) {
        videoRef.current.src = videoData.videoUrl;
        videoRef.current.play().catch((e) => console.log("Autoplay prevented:", e));
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "avatar",
          text: "I encountered an error. Please try again.",
          language: "english",
        },
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
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 sticky top-0 backdrop-blur-md bg-slate-950/80 border-b border-slate-700/50">
        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              🎬 AI Avatar Showroom
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real 4K Wei Lin - Your AI Sales Expert</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-120px)] max-w-7xl mx-auto gap-6 p-6">
        {/* Video Avatar Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md h-96">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>

            {/* Video Container */}
            <div className="relative h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-12 h-12 text-blue-400 animate-spin" />
                  <p className="text-sm text-slate-400">Generating video...</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-2xl"
                  controls
                  autoPlay
                  loop
                  muted
                  style={{ display: "none" }}
                />
              )}

              {!isLoading && messages.length > 0 && (
                <div className="text-center">
                  {messages[messages.length - 1]?.videoUrl ? (
                    <div className="text-blue-400">
                      <Play size={48} className="mx-auto mb-2 animate-bounce" />
                      <p className="text-sm">Click video link below to play</p>
                    </div>
                  ) : (
                    <p className="text-slate-400">Ready for your question</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat & Machines */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Machine Selection */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4">🏭 Featured Machines</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {MACHINES.map((machine) => (
                <button
                  key={machine.id}
                  onClick={() => setSelectedMachine(machine.id)}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    selectedMachine === machine.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400/50 shadow-lg shadow-blue-500/50 scale-105"
                      : "bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50"
                  }`}
                >
                  <p className="text-sm font-semibold">{machine.icon} {machine.name}</p>
                  <p className="text-xs text-slate-300 mt-1">{machine.description}</p>
                </button>
              ))}
            </div>

            {selectedMachine && getMachineResources(selectedMachine) && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold">{getMachineResources(selectedMachine)?.name}</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      {getMachineResources(selectedMachine)?.description}
                    </p>
                  </div>
                  <a
                    href={getGoogleDriveFolderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Play size={14} />
                    Files
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 backdrop-blur-xl overflow-hidden">
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
                    <p className="text-sm">{msg.text}</p>
                    {msg.videoUrl && (
                      <a
                        href={msg.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs bg-slate-600/50 hover:bg-slate-600 px-2 py-1 rounded transition-all"
                      >
                        <Play size={12} /> Watch Video
                      </a>
                    )}
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
                  placeholder="Ask Wei Lin..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all font-semibold shadow-lg"
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
