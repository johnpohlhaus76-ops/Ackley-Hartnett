'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function WeiLinAssistant() {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<Array<{ role: string; text: string }>>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setListening(true);
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
      };
    }
  }, []);

  const speak = (text: string) => {
    // Cancel any existing speech
    window.speechSynthesis.cancel();

    speechSynthesisRef.current = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current.rate = 1;
    speechSynthesisRef.current.pitch = 1.2;
    speechSynthesisRef.current.volume = 1;

    speechSynthesisRef.current.onstart = () => setSpeaking(true);
    speechSynthesisRef.current.onend = () => setSpeaking(false);

    window.speechSynthesis.speak(speechSynthesisRef.current);
  };

  const handleListen = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setResponses((prev) => [...prev, { role: 'user', text: message }]);
    setMessage('');

    // Simulate AI response (in real app, call your API)
    const responses_map: Record<string, string> = {
      'update quotes': 'I can help! Go to /portal/quick-upload to bulk update your quotes. Download the template, edit in Excel, and upload in 30 seconds.',
      'export data':
        'You can export your data as CSV or JSON from the export endpoints. I recommend CSV for Excel editing.',
      'how are you':
        "I'm Wei Lin, your AI assistant! I can help you manage quotes, orders, and data. Just ask me anything!",
      'help': 'I can help with: updating quotes, exporting data, importing files, checking order status, and more!',
      'hello':
        'Hey there! I am Wei Lin, your personal AI assistant. How can I help you manage your business today?',
    };

    const lowerMsg = message.toLowerCase();
    let response = 'I understand. How can I help you with your quotes and orders?';

    for (const [key, value] of Object.entries(responses_map)) {
      if (lowerMsg.includes(key)) {
        response = value;
        break;
      }
    }

    // Add delay for natural feel
    setTimeout(() => {
      setResponses((prev) => [...prev, { role: 'assistant', text: response }]);
      speak(response);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portal/accounts-360-pro" className="text-sm text-gray-400 hover:text-gray-200 mb-4 block">
            ← Back
          </Link>
          <div className="backdrop-blur-xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">🤖 Wei Lin - AI Assistant</h1>
            <p className="text-gray-300">Talk to your personal AI assistant (Voice enabled)</p>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-8 shadow-2xl text-center mb-6">
          <div className="mb-6">
            {/* Avatar */}
            <div
              className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-6xl shadow-lg transition transform ${
                speaking ? 'scale-110 animate-pulse' : ''
              }`}
            >
              🧠
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-4">
            {speaking && (
              <div className="text-cyan-400 font-semibold animate-pulse">
                🎤 Speaking...
              </div>
            )}
            {listening && (
              <div className="text-yellow-400 font-semibold animate-pulse">
                👂 Listening...
              </div>
            )}
            {!speaking && !listening && (
              <div className="text-gray-400">Ready to listen</div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleListen}
              disabled={speaking || listening}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg font-semibold text-white transition"
            >
              🎤 Listen
            </button>
            <button
              onClick={() => speak('Hello! I am Wei Lin, your AI assistant.')}
              disabled={speaking}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg font-semibold text-white transition"
            >
              🗣️ Test Voice
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          {/* Messages */}
          <div className="h-64 overflow-y-auto mb-4 space-y-4 bg-slate-800/30 rounded-lg p-4">
            {responses.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-2">💬</div>
                <div>Start a conversation with Wei Lin</div>
                <div className="text-sm mt-2">Click "Listen" or type your message</div>
              </div>
            ) : (
              responses.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/30'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message or click Listen..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || speaking}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg font-semibold text-white transition"
            >
              Send
            </button>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="mt-6 backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          <h3 className="text-gray-300 font-semibold mb-3">Try saying:</h3>
          <div className="grid grid-cols-2 gap-2">
            {['update quotes', 'export data', 'help', 'hello'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setMessage(cmd);
                  setTimeout(() => {
                    setResponses((prev) => [...prev, { role: 'user', text: cmd }]);
                    setMessage('');
                    const responses_map: Record<string, string> = {
                      'update quotes':
                        'I can help! Go to /portal/quick-upload to bulk update your quotes. Download the template, edit in Excel, and upload in 30 seconds.',
                      'export data': 'You can export your data as CSV or JSON from the export endpoints.',
                      help: 'I can help with: updating quotes, exporting data, importing files, and more!',
                      hello: 'Hey there! How can I help you today?',
                    };
                    const response = responses_map[cmd] || 'How can I help?';
                    setTimeout(() => {
                      setResponses((prev) => [...prev, { role: 'assistant', text: response }]);
                      speak(response);
                    }, 300);
                  }, 100);
                }}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded text-sm text-gray-300 transition text-left"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
