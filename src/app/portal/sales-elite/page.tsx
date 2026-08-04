"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Volume2, Loader, FileText, Play, Download, Share2, Zap, Eye, TrendingUp, Settings, Plus, VolumeX } from "lucide-react";
import { AudioVisualization } from "@/components/AudioVisualization";

interface Deal {
  id: string;
  account: string;
  value: number;
  stage: "prospect" | "qualified" | "demo" | "proposal" | "closing";
  probability: number;
  lastActivity: string;
  nextStep: string;
}

export default function SalesElitePage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const deals: Deal[] = [
    {
      id: "D001",
      account: "Catalent Pharma Solutions",
      value: 850000,
      stage: "demo",
      probability: 75,
      lastActivity: "Demo completed 2 hours ago",
      nextStep: "Send proposal tomorrow",
    },
    {
      id: "D002",
      account: "McNeil Healthcare",
      value: 450000,
      stage: "proposal",
      probability: 60,
      lastActivity: "Proposal sent yesterday",
      nextStep: "Follow-up call Thursday",
    },
    {
      id: "D003",
      account: "Patheon NV",
      value: 1200000,
      stage: "closing",
      probability: 85,
      lastActivity: "Legal review in progress",
      nextStep: "Sign contract by Friday",
    },
  ];

  const getStageGradient = (stage: string) => {
    const gradients: { [key: string]: string } = {
      prospect: "from-blue-600 to-blue-700",
      qualified: "from-purple-600 to-purple-700",
      demo: "from-cyan-600 to-blue-700",
      proposal: "from-emerald-600 to-cyan-700",
      closing: "from-emerald-500 to-emerald-600",
    };
    return gradients[stage] || "from-slate-600 to-slate-700";
  };

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .ultra-glass {
          background: rgba(10, 13, 23, 0.7);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .deal-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%);
          border: 1px solid rgba(71, 85, 105, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .deal-card:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%);
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
        }

        .video-container {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
        }

        .video-container video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .probability-bar {
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
          border-radius: 9999px;
          overflow: hidden;
          height: 6px;
        }

        .probability-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
          border-radius: 9999px;
        }

        .stat-value {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 900;
          font-size: 2.25rem;
          line-height: 1;
        }
      `}</style>

      {/* Sidebar - Deal List */}
      <div className="w-80 ultra-glass border-r border-slate-700/30 flex flex-col">
        <div className="p-6 border-b border-slate-700/30">
          <h1 className="text-2xl font-900 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">Sales Elite</h1>
          <p className="text-xs text-slate-500">Pipeline: ${deals.reduce((sum, d) => sum + d.value, 0) / 1000000}M</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {deals.map((deal) => (
            <button
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              className={`w-full text-left deal-card p-4 rounded-xl transition-all ${selectedDeal?.id === deal.id ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-700 text-white truncate text-sm">{deal.account}</h3>
                  <p className="text-xs text-slate-500 mt-1">{deal.stage}</p>
                </div>
                <span className="text-right flex-shrink-0 ml-2">
                  <p className="font-900 text-cyan-400 text-sm">${(deal.value / 1000).toFixed(0)}K</p>
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-400">Probability</span>
                    <span className="text-xs font-600 text-emerald-400">{deal.probability}%</span>
                  </div>
                  <div className="probability-bar">
                    <div className="probability-fill" style={{ width: `${deal.probability}%` }}></div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700/30">
          <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-600 transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> New Deal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="ultra-glass border-b border-slate-700/30 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-900 text-white">
              {selectedDeal ? `${selectedDeal.account}` : "Select a Deal"}
            </h2>
            {selectedDeal && (
              <p className="text-xs text-slate-400 mt-1">{selectedDeal.lastActivity}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isSpeaking && (
              <div className="flex items-center gap-2">
                <AudioVisualization isPlaying={true} width={120} height={32} />
              </div>
            )}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-lg transition-all ${
                isMuted ? "bg-red-500/20 text-red-400" : "hover:bg-slate-700/30 text-slate-400"
              }`}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <a href="/portal/setup" className="p-3 rounded-lg hover:bg-slate-700/30 transition-colors text-slate-400">
              <Settings size={20} />
            </a>
          </div>
        </div>

        {/* Content */}
        {selectedDeal ? (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Deal Overview */}
            <div className="grid grid-cols-4 gap-6">
              <div className="ultra-glass p-6 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">Deal Value</p>
                <div className="stat-value">${(selectedDeal.value / 1000).toFixed(0)}K</div>
              </div>
              <div className="ultra-glass p-6 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">Close Probability</p>
                <div className="stat-value">{selectedDeal.probability}%</div>
              </div>
              <div className="ultra-glass p-6 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">Pipeline Stage</p>
                <p className="text-2xl font-900 text-white capitalize mt-2">{selectedDeal.stage}</p>
              </div>
              <div className="ultra-glass p-6 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">Win Probability</p>
                <div className="stat-value text-emerald-400">{Math.round(selectedDeal.value * selectedDeal.probability / 1000000 * 100)}%</div>
              </div>
            </div>

            {/* Video Demo Area */}
            <div className="space-y-4">
              <h3 className="text-lg font-700 text-white">Live Demo Video</h3>
              <div className="video-container relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
                  >
                    <Play size={32} className="text-white fill-white" />
                  </button>
                </div>
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%231e293b' width='1920' height='1080'/%3E%3Ctext x='50%25' y='50%25' font-size='60' font-weight='bold' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3E4K Demo Video%3C/text%3E%3C/svg%3E"
                >
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            {/* Deal Actions */}
            <div className="grid grid-cols-3 gap-4">
              <button className="ultra-glass p-4 rounded-lg hover:border-blue-500/50 transition-all flex items-center gap-3 text-slate-300 hover:text-white">
                <FileText size={20} />
                <span className="font-600">View Proposal</span>
              </button>
              <button className="ultra-glass p-4 rounded-lg hover:border-blue-500/50 transition-all flex items-center gap-3 text-slate-300 hover:text-white">
                <Eye size={20} />
                <span className="font-600">Track Views</span>
              </button>
              <button className="ultra-glass p-4 rounded-lg hover:border-blue-500/50 transition-all flex items-center gap-3 text-slate-300 hover:text-white">
                <Share2 size={20} />
                <span className="font-600">Share Deal</span>
              </button>
            </div>

            {/* Next Steps */}
            <div className="ultra-glass p-6 rounded-xl border-l-4 border-emerald-500">
              <h4 className="font-700 text-white mb-2">Next Step</h4>
              <p className="text-slate-300">{selectedDeal.nextStep}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Zap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-2xl font-700 text-slate-400 mb-2">No Deal Selected</h3>
              <p className="text-slate-500">Select a deal from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
