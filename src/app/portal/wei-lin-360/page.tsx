"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader, Globe, Volume2, RotateCw } from "lucide-react";

export default function WeiLin360Page() {
  const [messages, setMessages] = useState<any[]>([
    { role: "wei-lin", text: "Welcome! I'm Wei Lin, your AI sales expert. Ask me anything about our machines." },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [rotation, setRotation] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = "https://ffxbhkyw0xqkxzqk.public.blob.vercel-storage.com/videos/1785681838164-wei-lin.mp4";
      videoRef.current.play();
    }
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
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E8E8E8",
        padding: "24px 32px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1E5BA8", margin: 0 }}>Wei Lin 360° Avatar</h1>
            <p style={{ fontSize: "12px", color: "#999999", margin: "4px 0 0 0" }}>AI Sales Expert - Real 4K Video</p>
          </div>
          <button
            onClick={() => setLanguage(language === "english" ? "chinese" : "english")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              backgroundColor: "#1E5BA8",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <Globe size={16} />
            {language === "english" ? "中文" : "English"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "32px" }}>
        {/* Avatar Section - 360° Rotating */}
        <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 360 Degree Avatar Display */}
          <div style={{
            backgroundColor: "#F9F9F9",
            borderRadius: "12px",
            border: "1px solid #E8E8E8",
            overflow: "hidden",
            aspectRatio: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `rotateY(${rotation}deg)`,
                transition: "transform 0.3s ease",
              }}
              controls
              autoPlay
              loop
            />
          </div>

          {/* 360 Rotation Controls */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setRotation((r) => (r - 15) % 360)}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: "#F9F9F9",
                border: "1px solid #E8E8E8",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              ← Rotate Left
            </button>
            <button
              onClick={() => setRotation(0)}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: "#1E5BA8",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              <RotateCw size={14} style={{ display: "inline", marginRight: "4px" }} />
              Front View
            </button>
            <button
              onClick={() => setRotation((r) => (r + 15) % 360)}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: "#F9F9F9",
                border: "1px solid #E8E8E8",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Rotate Right →
            </button>
          </div>

          {/* Status */}
          <div style={{
            padding: "16px",
            backgroundColor: "#F0F7FF",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#1E5BA8",
            fontWeight: 500,
            textAlign: "center",
          }}>
            Wei Lin is ready to answer your questions in {language === "english" ? "English" : "Chinese"}
          </div>
        </div>

        {/* Chat Section */}
        <div style={{ flex: "0 0 45%", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "0" }}>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            backgroundColor: "#F9F9F9",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: 0,
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: msg.role === "user" ? "#1E5BA8" : "#FFFFFF",
                    color: msg.role === "user" ? "#FFFFFF" : "#2C2C2C",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    border: msg.role === "user" ? "none" : "1px solid #E8E8E8",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "12px", color: "#999999" }}>Wei Lin is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: "20px",
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #E8E8E8",
            borderRadius: "0 0 8px 8px",
          }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Wei Lin a question..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: "#F9F9F9",
                  border: "1px solid #E8E8E8",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  color: "#2C2C2C",
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "4px",
                  backgroundColor: "#1E5BA8",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isLoading || !inputText.trim() ? 0.5 : 1,
                }}
              >
                <Send size={18} />
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
