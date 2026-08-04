"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const commands = [
    {
      id: "elevenlabs",
      title: "ElevenLabs API Key",
      description: "Required for Wei Lin voice synthesis",
      steps: [
        "Go to https://elevenlabs.io",
        "Sign up (free tier available)",
        "Navigate to Account → API Keys",
        "Copy your API key",
      ],
      command: "vercel env add ELEVENLABS_API_KEY",
      docs: "https://elevenlabs.io/docs",
    },
    {
      id: "anthropic",
      title: "Anthropic API Key",
      description: "Required for AI responses",
      steps: [
        "Go to https://console.anthropic.com",
        "Sign in or create account",
        "Navigate to API Keys",
        "Create new key",
      ],
      command: "vercel env add ANTHROPIC_API_KEY",
      docs: "https://console.anthropic.com",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            Setup Guide
          </h1>
          <p className="text-slate-400 text-lg">Configure API keys to enable Wei Lin voice, AI responses, and full platform features</p>
        </div>

        {/* Setup Cards */}
        <div className="space-y-8 mb-12">
          {commands.map((config) => (
            <div key={config.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
                  <p className="text-slate-400">{config.description}</p>
                </div>
                <a
                  href={config.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
                >
                  <ExternalLink size={20} />
                </a>
              </div>

              {/* Steps */}
              <div className="mb-6 bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-300 mb-3">Steps:</p>
                <ol className="space-y-2">
                  {config.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="font-bold text-blue-400 flex-shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Command */}
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm flex items-center justify-between border border-slate-700/50">
                <code className="text-cyan-400">{config.command}</code>
                <button
                  onClick={() => copyToClipboard(config.command, config.id)}
                  className="p-2 rounded hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
                >
                  {copied === config.id ? (
                    <Check size={18} className="text-emerald-400" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Deployment Instructions */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/20 rounded-2xl border border-emerald-700/50 p-8">
          <h3 className="text-xl font-bold text-emerald-400 mb-4">After Adding Keys</h3>
          <div className="space-y-3 text-slate-300">
            <p className="flex items-center gap-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</span>
              Wait for the CLI prompt to paste your key
            </p>
            <p className="flex items-center gap-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</span>
              Select which environments (production, preview, development)
            </p>
            <p className="flex items-center gap-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</span>
              Deploy: <code className="bg-slate-800 px-2 py-1 rounded ml-2 text-cyan-400">vercel deploy --prod</code>
            </p>
            <p className="flex items-center gap-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</span>
              Wei Lin voice will work instantly!
            </p>
          </div>
        </div>

        {/* Test Audio */}
        <div className="mt-8 bg-gradient-to-br from-blue-900/30 to-purple-900/20 rounded-2xl border border-blue-700/50 p-8">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Test Your Speakers</h3>
          <p className="text-slate-300 mb-6">Click below to test if audio works on your device</p>
          <button
            onClick={() => {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.value = 440;
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              oscillator.start(audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
              oscillator.stop(audioContext.currentTime + 0.5);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold transition-all"
          >
            🔊 Play Test Sound
          </button>
          <p className="text-xs text-slate-400 mt-3">You should hear a beep sound</p>
        </div>
      </div>
    </div>
  );
}
