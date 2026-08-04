"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "gradient" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled = false,
  type = "button",
}: PremiumButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95",
    secondary:
      "bg-slate-700/50 hover:bg-slate-600/50 text-slate-100 border border-slate-600/50 hover:border-slate-500/50 shadow-md hover:shadow-slate-500/20",
    gradient:
      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95",
    outline:
      "border-2 border-slate-400 text-slate-200 hover:bg-slate-900/50 hover:border-slate-300 hover:scale-105 active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm gap-1.5 rounded-lg",
    md: "px-6 py-3 text-base gap-2 rounded-xl",
    lg: "px-8 py-4 text-lg gap-3 rounded-2xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-inherit">{children}</span>
    </button>
  );
}
