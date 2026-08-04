"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Volume2, Loader, Settings, VolumeX, Zap, Globe } from "lucide-react";
import { AudioVisualization } from "@/components/AudioVisualization";

interface Message {
  role: "user" | "wei-lin";
  text: string;
  timestamp: number;
}

export default function WeiLinPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "wei-lin",
      text: "你好！I'm Wei Lin, your AI sales expert. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<"english" | "chinese">("english");
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = async (text: string) => {
    if (isMuted) return;

    try {
      setIsSpeaking(true);
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

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700;900&display=swap');

        * {
          font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .avatar-container {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 20, 40, 0.9) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5),
                      inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .avatar-image {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .avatar-image::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%);
          z-index: 1;
        }

        .avatar-glow {
          position: absolute;
          inset: 0;
          background: conic-gradient(from 0deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6);
          opacity: 0;
          animation: glow-pulse 3s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.3; }
        }

        .avatar-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;
          text-align: center;
        }

        .avatar-name {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1;
        }

        .avatar-title {
          font-size: 0.875rem;
          color: rgba(148, 163, 184, 0.8);
          margin-top: 0.5rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .speaking-bars {
          display: flex;
          gap: 4px;
          align-items: flex-end;
          margin: 1.5rem 0;
        }

        .speaking-bar {
          width: 4px;
          background: linear-gradient(to top, #3b82f6, #06b6d4);
          border-radius: 2px;
          animation: bar-pulse 0.6s ease-in-out infinite;
        }

        .speaking-bar:nth-child(1) {
          height: 12px;
          animation-delay: 0s;
        }

        .speaking-bar:nth-child(2) {
          height: 20px;
          animation-delay: 0.1s;
        }

        .speaking-bar:nth-child(3) {
          height: 16px;
          animation-delay: 0.2s;
        }

        .speaking-bar:nth-child(4) {
          height: 24px;
          animation-delay: 0.3s;
        }

        .speaking-bar:nth-child(5) {
          height: 18px;
          animation-delay: 0.4s;
        }

        @keyframes bar-pulse {
          0%, 100% { height: 8px; }
          50% { height: 100%; }
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
          margin-top: 1rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(10, 20, 40, 0.6) 100%);
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          space-y: 1.5rem;
        }

        .message {
          margin-bottom: 1.5rem;
          animation: slide-in 0.3s ease-out;
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-user {
          display: flex;
          justify-content: flex-end;
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .message-user .message-content {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-wei-lin .message-content {
          background: rgba(71, 85, 105, 0.3);
          border: 1px solid rgba(71, 85, 105, 0.4);
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .input-area {
          padding: 2rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(10, 20, 40, 0.6);
          backdrop-filter: blur(20px);
        }

        .input-form {
          display: flex;
          gap: 1rem;
        }

        .input-field {
          flex: 1;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .input-field:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(30, 41, 59, 0.8);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .send-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <audio ref={audioRef} />

      {/* Avatar Section */}
      <div className="w-1/3 avatar-container flex flex-col">
        <div className="flex-1 avatar-image flex items-center justify-center relative">
          <div className="avatar-glow"></div>
          <div className="avatar-content">
            <h1 className="avatar-name">Wei Lin</h1>
            <p className="avatar-title">AI Sales Expert</p>

            {isSpeaking && (
              <div className="speaking-bars">
                <div className="speaking-bar"></div>
                <div className="speaking-bar"></div>
                <div className="speaking-bar"></div>
                <div className="speaking-bar"></div>
                <div className="speaking-bar"></div>
              </div>
            )}

            <div className="status-badge">
              <div className="status-dot"></div>
              {isSpeaking ? "Speaking..." : "Ready to chat"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-slate-700/30 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage(language === "english" ? "chinese" : "english")}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm"
            >
              <Globe size={16} />
              {language === "english" ? "中文" : "English"}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                isMuted ? "bg-red-500/20 text-red-400" : "bg-slate-700/50 hover:bg-slate-700 text-white"
              }`}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <a
              href="/portal/setup"
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center justify-center"
            >
              <Settings size={16} />
            </a>
          </div>
          <p className="text-xs text-slate-500 text-center">Speaks {language === "english" ? "English & Chinese" : "中文和English"}</p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 chat-container">
        {/* Messages */}
        <div className="messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`message message-${msg.role}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.role === "wei-lin" && (
                  <button
                    onClick={() => speakText(msg.text)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <Volume2 size={12} /> Speak
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message message-wei-lin">
              <div className="message-content flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-2">
              <AudioVisualization isPlaying={true} width={80} height={24} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === "english" ? "Ask Wei Lin anything..." : "问Wei Lin任何问题..."}
              className="input-field"
              disabled={isLoading || isSpeaking}
            />
            <button type="submit" className="send-button" disabled={isLoading || isSpeaking || !inputText.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
