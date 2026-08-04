"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader, Settings, VolumeX, Volume2, Mic, MicOff, Globe, Play, Pause } from "lucide-react";
import { AudioVisualization } from "@/components/AudioVisualization";

interface Message {
  role: "user" | "wei-lin";
  text: string;
  timestamp: number;
  videoUrl?: string;
}

export default function WeiLinProPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "wei-lin",
      text: "你好！Welcome to Wei Lin Pro. I'm your AI sales expert. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<"english" | "chinese">("english");
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === "chinese" ? "zh-CN" : "en-US";
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (event.isFinal && transcript) {
          setInputText(transcript);
        }
      };
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAvatarVideo = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch("/api/heygen/generate", {
        method: "POST",
        body: JSON.stringify({ text, language }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      return data.videoUrl;
    } catch (error) {
      console.error("Error generating avatar video:", error);
      return null;
    }
  };

  const speakText = async (text: string) => {
    if (isMuted) return;

    try {
      const response = await fetch("/api/avatar/speak", {
        method: "POST",
        body: JSON.stringify({ text, language }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.volume = 1;
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
    if (!inputText.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: inputText, timestamp: Date.now() }]);
    setIsLoading(true);
    const query = inputText;
    setInputText("");

    try {
      const response = await fetch("/api/chat/service", {
        method: "POST",
        body: JSON.stringify({ query, language }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      const aiResponse = data.response;

      setMessages((prev) => [...prev, { role: "wei-lin", text: aiResponse, timestamp: Date.now() }]);
      await speakText(aiResponse);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700;900&display=swap');

        * { font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .glass-dark { background: rgba(5, 10, 20, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(148, 163, 184, 0.1); }

        .video-player {
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.15);
          position: relative;
        }

        .video-player video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .video-player:hover .play-overlay {
          opacity: 1;
        }

        .play-button {
          width: 80px;
          height: 80px;
          background: rgba(59, 130, 246, 0.3);
          border: 2px solid rgba(59, 130, 246, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .play-button:hover {
          background: rgba(59, 130, 246, 0.5);
          transform: scale(1.1);
        }

        .messages-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
        }

        .messages-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .messages-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 3px;
        }

        .message-bubble {
          animation: slide-in 0.3s ease-out;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .control-btn {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(71, 85, 105, 0.3);
          background: rgba(30, 41, 59, 0.5);
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
        }

        .control-btn:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .control-btn.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .input-field:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(30, 41, 59, 0.9);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .send-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(16, 185, 129, 1);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <audio ref={audioRef} />

      {/* Avatar Section */}
      <div className="w-2/5 glass-dark border-r border-slate-700/30 flex flex-col p-6 space-y-4">
        <div>
          <h1 className="text-4xl font-900 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Wei Lin Pro</h1>
          <p className="text-slate-400 text-sm mt-2">4K Ultra Realistic Avatar • All Languages</p>
        </div>

        {/* Video Player */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="video-player">
            <video ref={videoRef} controls className="w-full h-full" />
            <div className="play-overlay">
              <div className="play-button">
                <Play size={40} className="text-white fill-white" />
              </div>
            </div>
          </div>

          <div className="status-badge justify-center">
            <div className="status-dot"></div>
            {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready"}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <button onClick={startListening} disabled={isLoading} className={`control-btn w-full ${isListening ? "active" : ""}`}>
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            {isListening ? "Listening..." : "Click to Speak"}
          </button>

          <button onClick={() => setLanguage(language === "english" ? "chinese" : "english")} className="control-btn w-full">
            <Globe size={18} />
            {language === "english" ? "中文" : "English"}
          </button>

          <button onClick={() => setIsMuted(!isMuted)} className={`control-btn w-full ${isMuted ? "active" : ""}`}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isMuted ? "Muted" : "Sound On"}
          </button>

          <a href="/portal/setup" className="control-btn w-full">
            <Settings size={18} />
            Setup
          </a>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 glass-dark border-l border-slate-700/30 flex flex-col p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Chat with Wei Lin</h2>
          <p className="text-slate-400 text-sm mt-1">Ask anything • Real voice responses • Video avatar</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto messages-scroll space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`message-bubble flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-sm px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                    : "bg-slate-700/50 border border-slate-600/50 text-slate-100"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                {msg.role === "wei-lin" && (
                  <button onClick={() => speakText(msg.text)} className="mt-2 text-xs text-blue-300 hover:text-blue-200">
                    🔊 Replay
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 border border-slate-600/50 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Loader size={16} className="animate-spin text-blue-400" />
                <span className="text-sm text-slate-300">Thinking...</span>
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="flex justify-center py-2">
              <AudioVisualization isPlaying={true} width={120} height={30} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === "english" ? "Type or speak..." : "输入或说话..."}
            className="input-field flex-1"
            disabled={isLoading || isSpeaking}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !inputText.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
