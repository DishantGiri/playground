"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { SurpriseModal } from "@/components/ui/SurpriseModal";

export function HomepageSurpriseButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="surprise-btn-pulse w-full sm:w-auto px-8 py-4 rounded-full sm:rounded-2xl font-black text-base text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-violet-500/30 group"
      >
        <Sparkles className="w-5 h-5 text-violet-200 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide">SURPRISE ME</span>
        <ArrowRight className="w-5 h-5 text-violet-200 group-hover:translate-x-1 transition-transform" />
      </button>

      <SurpriseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
