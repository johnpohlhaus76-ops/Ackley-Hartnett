"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader, Globe, Mic, Volume2 } from "lucide-react";
import "@/styles/pharmaceutical.css";

interface Message {
  role: "user" | "wei-lin";
  text: string;
}

export default function MasterPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "wei-lin", text: "Welcome to Wei Lin, your AI sales expert. How can I assist you today?" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [videos, setVideos] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set default Wei Lin video
    if (videoRef.current) {
      videoRef.current.src = "https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4";
    }

    const loadVideos = async () => {
      try {
        const res = await fetch("/api/videos/list");
        const data = await res.json();
        if (data.videos?.length > 0) {
          setVideos(data.videos);
        }
      } catch (error) {
        console.error("Failed to load videos:", error);
      }
    };
    loadVideos();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: inputText }]);
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
      setMessages((prev) => [...prev, { role: "wei-lin", text: data.response }]);

      if (videos.length > 0 && videoRef.current) {
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        videoRef.current.src = randomVideo.url;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8E8E8',
        padding: '24px 32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1E5BA8', margin: 0 }}>Wei Lin Pro</h1>
            <p style={{ fontSize: '13px', color: '#999999', margin: '4px 0 0 0' }}>AI Sales Expert</p>
          </div>
          <button
            onClick={() => setLanguage(language === "english" ? "chinese" : "english")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#F9F9F9',
              border: '1px solid #E8E8E8',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#2C2C2C'
            }}
          >
            <Globe size={16} />
            {language === "english" ? "中文" : "English"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex' }}>
        {/* Avatar Section */}
        <div style={{
          width: '45%',
          borderRight: '1px solid #E8E8E8',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Avatar Display */}
          <div style={{
            flex: 1,
            backgroundColor: '#F9F9F9',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              controls
              autoPlay
              loop
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={{
              flex: 1,
              minWidth: '100px',
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E8E8',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#2C2C2C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Mic size={14} />
              Speak
            </button>
            <button style={{
              flex: 1,
              minWidth: '100px',
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E8E8',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#2C2C2C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Volume2 size={14} />
              Sound
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div style={{
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #E8E8E8'
        }}>
          {/* Chat Header */}
          <div style={{
            borderBottom: '1px solid #E8E8E8',
            padding: '32px',
            backgroundColor: '#F9F9F9'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: 0, marginBottom: '8px' }}>
              {language === 'english' ? 'Chat' : '对话'}
            </h2>
            <p style={{ fontSize: '13px', color: '#999999', margin: 0 }}>
              {language === 'english' ? 'Ask about machines, pricing, and capabilities' : '询问机器、价格和功能'}
            </p>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    backgroundColor: msg.role === 'user' ? '#1E5BA8' : '#F9F9F9',
                    color: msg.role === 'user' ? '#FFFFFF' : '#2C2C2C',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    border: msg.role === 'user' ? 'none' : '1px solid #E8E8E8'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#F9F9F9',
                  borderRadius: '4px',
                  border: '1px solid #E8E8E8',
                  color: '#2C2C2C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid #E8E8E8',
            padding: '24px 32px',
            backgroundColor: '#F9F9F9'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={language === 'english' ? 'Type your question...' : '输入您的问题...'}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8E8',
                  borderRadius: '2px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  color: '#2C2C2C'
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#1E5BA8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isLoading || !inputText.trim() ? 0.6 : 1
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
