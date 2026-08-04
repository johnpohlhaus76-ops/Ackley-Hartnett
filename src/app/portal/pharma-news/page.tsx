"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  timestamp: string;
  category: string;
  impact: "high" | "medium" | "low";
  summary: string;
}

export default function PharmaNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/pharma-news");
        const data = await response.json();
        setNews(data.news);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "from-red-500/10 to-red-600/5 border-red-500/20 text-red-400";
      case "medium":
        return "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 text-yellow-400";
      default:
        return "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Regulatory":
        return "⚖️";
      case "Market":
        return "📈";
      case "Technology":
        return "🔬";
      default:
        return "📰";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 md:p-12 border border-slate-700/50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-xs font-semibold text-blue-300">
              LIVE
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            Pharma News
          </h1>
          <p className="text-slate-400 text-lg">Real-time pharmaceutical industry updates and market intelligence</p>
        </div>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-slate-400">Loading latest news...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getImpactColor(
                item.impact
              )} border backdrop-blur-xl p-6 hover:scale-105 transition-transform duration-300 group cursor-pointer`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500 to-purple-500" style={{ opacity: 0.05 }}></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          {item.category}
                        </span>
                        {item.impact === "high" && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        {item.impact === "medium" && (
                          <TrendingUp className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-300 mb-3">{item.summary}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-4 ${
                    item.impact === "high"
                      ? "bg-red-500/20 text-red-300"
                      : item.impact === "medium"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}>
                    {item.impact === "high" ? "HIGH IMPACT" : item.impact === "medium" ? "MEDIUM" : "LOW"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-4 h-4" />
                    {formatTime(item.timestamp)}
                  </div>
                  <div className="text-xs font-medium text-slate-500">{item.source}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update info */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-center text-sm text-slate-400">
        📡 Updates every 5 minutes • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
