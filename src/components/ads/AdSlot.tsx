"use client";

import { useState } from "react";
import { Sparkles, X, ExternalLink } from "lucide-react";

interface AdSlotProps {
  placement?: "banner" | "sidebar" | "feed" | "inline";
  className?: string;
}

export function AdSlot({ placement = "banner", className = "" }: AdSlotProps) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  if (placement === "banner") {
    return (
      <div className={`w-full max-w-5xl mx-auto my-8 px-4 ${className}`}>
        <div className="relative rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 border border-slate-200 p-4 sm:p-6 shadow-sm overflow-hidden group">
          <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              ADVERTISEMENT
            </span>
            <button
              onClick={() => setClosed(true)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
              title="Close Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 sm:pt-0">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                  CloudQuest: Instant Multiplayer Cloud Gaming
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Play indie and AAA games in your web browser with 0 second download. Free 7-day trial.
                </p>
              </div>
            </div>

            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-violet-600 hover:text-white text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-sm"
            >
              <span>Learn More</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Inline / feed card ad
  return (
    <div className={`relative rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
          SPONSORED
        </span>
        <button
          onClick={() => setClosed(true)}
          className="text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 my-auto py-2">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">
          Level Up Your Focus with MindFlow
        </h4>
        <p className="text-xs text-slate-500">
          The ambient sound generator backed by cognitive science.
        </p>
      </div>

      <a
        href="https://google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-center py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm"
      >
        Try Free Demo →
      </a>
    </div>
  );
}
