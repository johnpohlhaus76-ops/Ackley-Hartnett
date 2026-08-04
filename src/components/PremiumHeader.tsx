"use client";

import { ReactNode } from "react";

interface PremiumHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  accent?: "blue" | "purple" | "cyan";
}

export function PremiumHeader({
  title,
  subtitle,
  action,
  accent = "blue",
}: PremiumHeaderProps) {
  const accentColors = {
    blue: "from-blue-400 to-cyan-400",
    purple: "from-purple-400 to-pink-400",
    cyan: "from-cyan-400 to-blue-400",
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 md:p-12 border border-slate-700/50 mb-8">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex-1">
            <h1 className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${accentColors[accent]} bg-clip-text text-transparent mb-4 leading-tight`}>
              {title}
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
    </div>
  );
}
