"use client";

import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { Download, RotateCcw, Paintbrush, Eraser, Gift, ArrowRight, Sparkles } from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

const PALETTE = [
  "#0F172A", "#FFFFFF", "#EF4444", "#F97316",
  "#F59E0B", "#10B981", "#06B6D4", "#3B82F6",
  "#8B5CF6", "#EC4899", "#84CC16", "#64748B",
  "#92400E", "#581C87", "#0F766E", "#BE185D",
];

const GRID_SIZE = 16;
const EMPTY_CELL = "#F1F5F9";

export function PixelArtStudio({ activitySlug = "pixel-art" }: { activitySlug?: string }) {
  const [pixels, setPixels] = useState<string[]>(
    Array(GRID_SIZE * GRID_SIZE).fill(EMPTY_CELL)
  );
  const [selectedColor, setSelectedColor] = useState<string>("#8B5CF6");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const applyColor = (index: number) => {
    const newColor = tool === "eraser" ? EMPTY_CELL : selectedColor;
    setPixels((prev) => {
      const copy = [...prev];
      copy[index] = newColor;
      return copy;
    });
  };

  const handleCellClick = (index: number) => {
    sound.playClick();
    applyColor(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isMouseDown) {
      applyColor(index);
    }
  };

  const clearCanvas = () => {
    sound.playClick();
    setPixels(Array(GRID_SIZE * GRID_SIZE).fill(EMPTY_CELL));
  };

  const exportArtwork = async () => {
    sound.playWin();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    // Render 16x16 onto hidden canvas scaled to 320x320
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const cellSize = 320 / GRID_SIZE;
        pixels.forEach((color, i) => {
          const x = (i % GRID_SIZE) * cellSize;
          const y = Math.floor(i / GRID_SIZE) * cellSize;
          ctx.fillStyle = color === EMPTY_CELL ? "#FFFFFF" : color;
          ctx.fillRect(x, y, cellSize, cellSize);
        });

        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = "bored_pixel_art.png";
        a.click();
      }
    }

    try {
      const res = await fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activitySlug,
          score: 100,
        }),
      });
      const data = await res.json();
      if (data.pointsEarned) setEarnedXp(data.pointsEarned);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {/* Hidden export canvas */}
      <canvas ref={canvasRef} width={320} height={320} className="hidden" />

      {/* Tools Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setTool("brush");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tool === "brush"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Brush</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTool("eraser");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tool === "eraser"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        <button
          onClick={exportArtwork}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save PNG (+40 XP)</span>
        </button>
      </div>

      {/* 16-Color Palette */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap gap-2.5 justify-center">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => {
              sound.playClick();
              setSelectedColor(c);
              setTool("brush");
            }}
            className={`w-7 h-7 rounded-lg transition-transform cursor-pointer border border-slate-300 ${
              selectedColor === c && tool === "brush"
                ? "scale-125 ring-2 ring-violet-600 ring-offset-2"
                : "hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* 16x16 Canvas Grid */}
      <div
        className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex justify-center"
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        <div
          className="grid gap-[1px] bg-slate-200 p-1 rounded-xl shadow-inner border border-slate-300"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: "320px",
            height: "320px",
          }}
        >
          {pixels.map((color, i) => (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              onMouseEnter={() => handleMouseEnter(i)}
              className="cursor-pointer transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          onClick={() => {
            sound.playClick();
            setShowRewardedAd(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 text-amber-600" />
          <span>Claim +50 Bonus XP</span>
        </button>

        <Link
          href="/explore"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20"
        >
          <span>Explore More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
