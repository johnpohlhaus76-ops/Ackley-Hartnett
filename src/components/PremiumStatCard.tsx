"use client";

import { ReactNode } from "react";

interface PremiumStatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: { value: number; direction: "up" | "down" };
  color?: "blue" | "purple" | "cyan" | "emerald";
}

export function PremiumStatCard({
  value,
  label,
  icon,
  trend,
  color = "blue",
}: PremiumStatCardProps) {
  const colors = {
    blue: {
      bg: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-500/20",
      icon: "text-blue-400",
      accent: "from-blue-500 to-blue-600",
    },
    purple: {
      bg: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-500/20",
      icon: "text-purple-400",
      accent: "from-purple-500 to-purple-600",
    },
    cyan: {
      bg: "from-cyan-500/10 to-cyan-600/5",
      border: "border-cyan-500/20",
      icon: "text-cyan-400",
      accent: "from-cyan-500 to-cyan-600",
    },
    emerald: {
      bg: "from-emerald-500/10 to-emerald-600/5",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
      accent: "from-emerald-500 to-emerald-600",
    },
  };

  const c = colors[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} backdrop-blur-xl p-6 group hover:scale-105 transition-transform duration-300`}
    >
      {/* Gradient glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${c.accent}`} style={{ opacity: 0.05 }}></div>

      {/* Animated background element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-400/10 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {icon && <div className={`text-3xl ${c.icon}`}>{icon}</div>}
          {trend && (
            <div
              className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                trend.direction === "up"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10"
              }`}
            >
              {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div className="mb-2">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">
            {value}
          </h3>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}
