"use client";

import { useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function MultiLanguageServiceBotPage() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("english");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; language: string }>>([
    {
      role: "assistant",
      content:
        "Welcome! / 欢迎! / Selamat datang! / ยินดีต้อนรับ! / Chào mừng!\n\nI can answer your questions in 19 languages about our pharmaceutical and confectionery marking machines.\n\nTry asking:\n- Technical specifications\n- Machine capabilities\n- Drug processing history\n- Customer references",
      language: "english",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage, language }]);
    setLoading(true);

    try {
      // First, translate and get response
      const response = await fetch("/api/chat/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage, language }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, language },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: language === "english"
            ? "Sorry, I encountered an error."
            : "对不起，我遇到了错误。",
          language,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🌐 Service Bot (Multi-Language)</h1>
          <p className="text-blue-100">19 languages supported</p>
        </div>
        <LanguageSelector />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1 opacity-70">
                {msg.language.toUpperCase()}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-500">
                {language === "english" ? "Thinking..." : "思考中..."}
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border-t border-gray-200 p-6"
      >
        <div className="flex gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "english"
                ? "Ask about machines, drugs, or capabilities..."
                : language === "chinese"
                ? "询问机器、药物或功能..."
                : language === "spanish"
                ? "Pregunta sobre máquinas, medicamentos o capacidades..."
                : "Ask your question..."
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {language === "english" ? "Send" : "发送"}
          </button>
        </div>
      </form>
    </div>
  );
}
