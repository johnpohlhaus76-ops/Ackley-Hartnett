'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function WeiLinAssistant() {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<Array<{ role: string; text: string }>>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
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

  const speak = async (text: string) => {
    setSpeaking(true);
    try {
      const res = await fetch('/api/ai/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          audioRef.current.onended = () => setSpeaking(false);
        }
      } else {
        setSpeaking(false);
        console.error('Speech generation failed');
      }
    } catch (error) {
      setSpeaking(false);
      console.error('Speech error:', error);
    }
  };

  const handleListen = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    setResponses((prev) => [...prev, { role: 'user', text: message }]);
    const userMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: responses,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const aiResponse = data.response;
        setResponses((prev) => [...prev, { role: 'assistant', text: aiResponse }]);
        await speak(aiResponse);
      } else {
        const errorMsg = 'I encountered an issue. Please try again.';
        setResponses((prev) => [...prev, { role: 'assistant', text: errorMsg }]);
        await speak(errorMsg);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = 'Connection error. Please try again.';
      setResponses((prev) => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} />

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
              disabled={speaking || listening || loading}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition"
            >
              🎤 Listen
            </button>
            <button
              onClick={() => speak('Hello! I am Wei Lin, your AI assistant. How can I help you today?')}
              disabled={speaking || loading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition"
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

          {/* Status for loading */}
          {loading && (
            <div className="mb-4 flex items-center gap-2 text-cyan-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
              <span className="text-sm">Wei Lin is thinking...</span>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message or click Listen..."
              disabled={loading || speaking}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || speaking || loading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition"
            >
              {loading ? '...' : 'Send'}
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
