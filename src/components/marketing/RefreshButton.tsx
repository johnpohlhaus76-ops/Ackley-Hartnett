"use client";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center gap-2 rounded-lg border border-laser-400/40 bg-laser-400/10 px-5 py-2.5 text-sm font-semibold text-laser-300 transition hover:bg-laser-400/20 hover:text-white active:scale-95"
    >
      <RefreshCw size={16} /> Refresh Page
    </button>
  );
}
