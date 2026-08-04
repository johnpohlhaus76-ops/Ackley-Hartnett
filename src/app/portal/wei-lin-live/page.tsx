"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Volume2, Loader, Settings, VolumeX, Zap, Globe, Mic, MicOff, Phone, AlertCircle } from "lucide-react";
import { AudioVisualization } from "@/components/AudioVisualization";

interface Message {
  role: "user" | "wei-lin";
  text: string;
  timestamp: number;
}

export default function WeiLinLivePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "wei-lin",
      text: "你好！Welcome! I'm Wei Lin. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<"english" | "chinese">("english");
  const [audioStatus, setAudioStatus] = useState<"checking" | "ready" | "error">("checking");
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check audio availability
  useEffect(() => {
    const checkAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setAudioStatus("ready");
        setAudioError(null);
      } catch (error) {
        setAudioStatus("error");
        setAudioError("Microphone access denied or unavailable");
      }
    };

    checkAudio();

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === "chinese" ? "zh-CN" : "en-US";

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (event.isFinal) {
          setInputText(transcript);
        }
      };
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = async (text: string) => {
    if (isMuted) {
      console.log("Audio muted");
      return;
    }

    try {
      setIsSpeaking(true);
      console.log("Requesting speech synthesis...");

      const response = await fetch("/api/avatar/speak", {
        method: "POST",
        body: JSON.stringify({ text, language }),
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.audioUrl && audioRef.current) {
        console.log("Playing audio:", data.audioUrl.substring(0, 50) + "...");
        audioRef.current.src = data.audioUrl;
        audioRef.current.volume = 1;

        audioRef.current.onended = () => {
          console.log("Audio playback ended");
          setIsSpeaking(false);
        };

        audioRef.current.onerror = (e: any) => {
          console.error("Audio error:", e);
          setIsSpeaking(false);
        };

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error: any) => {
            console.error("Playback error:", error);
            setIsSpeaking(false);
          });
        }
      } else {
        console.log("No audio URL returned");
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
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
      console.log("Sending query:", query);
      const response = await fetch("/api/chat/service", {
        method: "POST",
        body: JSON.stringify({ query, language }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("AI response:", data);
      const aiResponse = data.response;

      setMessages((prev) => [...prev, { role: "wei-lin", text: aiResponse, timestamp: Date.now() }]);
      await speakText(aiResponse);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "wei-lin", text: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() },
      ]);
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
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 20, 40, 1) 100%);
          border-right: 1px solid rgba(148, 163, 184, 0.15);
          position: relative;
          overflow: hidden;
        }

        .avatar-image {
          height: 60%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
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
          inset: -50%;
          background: conic-gradient(from 0deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6);
          animation: glow-spin 6s linear infinite;
          z-index: 0;
        }

        @keyframes glow-spin {
          to { transform: rotate(360deg); }
        }

        .avatar-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .avatar-name {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .avatar-title {
          font-size: 0.875rem;
          color: rgba(148, 163, 184, 0.7);
          margin-top: 0.5rem;
          letter-spacing: 0.05em;
        }

        .speaking-animation {
          display: flex;
          gap: 3px;
          margin: 1.5rem 0;
        }

        .speaking-bar {
          width: 3px;
          background: linear-gradient(to top, #3b82f6, #06b6d4);
          border-radius: 2px;
          animation: bar-animate 0.5s ease-in-out infinite;
        }

        .speaking-bar:nth-child(1) { animation-delay: 0s; }
        .speaking-bar:nth-child(2) { animation-delay: 0.1s; }
        .speaking-bar:nth-child(3) { animation-delay: 0.2s; }
        .speaking-bar:nth-child(4) { animation-delay: 0.3s; }
        .speaking-bar:nth-child(5) { animation-delay: 0.4s; }

        @keyframes bar-animate {
          0%, 100% { height: 10px; }
          50% { height: 30px; }
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(16, 185, 129, 1);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .controls-section {
          padding: 1.5rem;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          space-y: 1rem;
        }

        .control-button {
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.5);
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .control-button:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .control-button.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, rgba(10, 20, 40, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%);
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          animation: slide-in 0.3s ease-out;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-user {
          display: flex;
          justify-content: flex-end;
        }

        .message-content {
          max-width: 60%;
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
          background: rgba(71, 85, 105, 0.25);
          border: 1px solid rgba(71, 85, 105, 0.4);
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .input-area {
          padding: 1.5rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(10, 20, 40, 0.8);
        }

        .input-form {
          display: flex;
          gap: 0.75rem;
        }

        .input-field {
          flex: 1;
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
        }

        .icon-button {
          padding: 12px 16px;
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-button:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .icon-button.active {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.5);
        }

        .send-button {
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

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }
      `}</style>

      <audio ref={audioRef} />

      {/* Avatar Section */}
      <div className="w-1/3 avatar-container flex flex-col">
        <div className="avatar-image relative">
          <div className="avatar-glow"></div>
          <div className="avatar-content">
            <h1 className="avatar-name">Wei Lin</h1>
            <p className="avatar-title">AI Sales Expert</p>

            {isSpeaking && (
              <div className="speaking-animation">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="speaking-bar" style={{ height: `${10 + Math.random() * 20}px` }}></div>
                ))}
              </div>
            )}

            <div className="status-indicator">
              <div className="status-dot"></div>
              {isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready"}
            </div>
          </div>
        </div>

        <div className="controls-section flex-1 overflow-y-auto">
          <button
            onClick={startListening}
            disabled={audioStatus !== "ready" || isLoading}
            className={`control-button ${isListening ? "active" : ""}`}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            {isListening ? "Listening..." : "Click to Speak"}
          </button>

          <button
            onClick={() => setLanguage(language === "english" ? "chinese" : "english")}
            className="control-button"
          >
            <Globe size={18} />
            {language === "english" ? "中文" : "English"}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`control-button ${isMuted ? "active" : ""}`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isMuted ? "Muted" : "Sound On"}
          </button>

          <a href="/portal/setup" className="control-button">
            <Settings size={18} />
            Setup
          </a>

          {audioStatus === "error" && (
            <div className="error-alert">
              <AlertCircle size={16} />
              <span>{audioError}</span>
            </div>
          )}

          {audioStatus === "ready" && (
            <p className="text-xs text-slate-500 text-center mt-2">🎤 Microphone ready • 🔊 Speaker active</p>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 chat-container">
        <div className="messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`message message-${msg.role}`}>
              <div className="message-content">
                {msg.text}
                {msg.role === "wei-lin" && (
                  <button onClick={() => speakText(msg.text)} className="ml-2 text-xs text-blue-300 hover:text-blue-200">
                    🔊
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message message-wei-lin">
              <div className="message-content flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="flex justify-center">
              <AudioVisualization isPlaying={true} width={120} height={30} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === "english" ? "Type or speak..." : "输入或说话..."}
              className="input-field"
              disabled={isLoading || isSpeaking}
            />
            <button type="submit" className="send-button" disabled={isLoading || !inputText.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
