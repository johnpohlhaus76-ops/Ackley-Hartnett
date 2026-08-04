"use client";

import { useState } from "react";

export default function SelectorBotPage() {
  const [requirements, setRequirements] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content:
        "Welcome to the Machine Selector Bot! 🎯\n\nI help you find the perfect machine for your pharmaceutical production needs. Tell me about your requirements:\n\n• Speed/throughput needed (units per hour)\n• Budget constraints\n• Required capabilities (printing, laser drilling, laser marking)\n• Product type or specific use case\n• Volume or other preferences\n\nExamples:\n- I need a fast printing machine under $500,000\n- What machines can do laser drilling with high throughput?\n- Find me a budget-friendly printer for a new product line",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirements.trim()) return;

    const userMessage = requirements;
    setRequirements("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat/selector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-6 shadow-md">
        <h1 className="text-2xl font-bold">🎯 Machine Selector Bot</h1>
        <p className="text-emerald-100">
          Find the perfect machine based on your requirements
        </p>
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
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-500">Analyzing machines...</p>
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
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe your machine requirements..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !requirements.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
