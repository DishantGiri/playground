"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Save,
  Trash2,
  FolderOpen,
  Sparkles,
  Gift,
  ArrowRight,
  Music,
  Piano,
  Guitar,
  Drum,
  Wind,
  Layers,
  SlidersHorizontal,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

export type InstrumentCategory =
  | "ALL"
  | "drums"
  | "piano"
  | "guitar"
  | "flute"
  | "bass"
  | "orchestra";

interface InstrumentTrack {
  id: string;
  name: string;
  category: "drums" | "piano" | "guitar" | "flute" | "bass" | "orchestra";
  freq: number;
  badge: string;
  color: string;
  activeColor: string;
}

const INSTRUMENT_TRACKS: InstrumentTrack[] = [
  // --- FULL DRUM SET ---
  { id: "kick", name: "Kick Sub", category: "drums", freq: 65, badge: "Drum", color: "text-rose-600 bg-rose-50 border-rose-200", activeColor: "bg-rose-500 text-white" },
  { id: "snare", name: "Snare Snap", category: "drums", freq: 220, badge: "Drum", color: "text-orange-600 bg-orange-50 border-orange-200", activeColor: "bg-orange-500 text-white" },
  { id: "hihat-c", name: "Hi-Hat Closed", category: "drums", freq: 850, badge: "Cymbal", color: "text-amber-600 bg-amber-50 border-amber-200", activeColor: "bg-amber-500 text-white" },
  { id: "hihat-o", name: "Hi-Hat Open", category: "drums", freq: 750, badge: "Cymbal", color: "text-amber-700 bg-amber-50 border-amber-200", activeColor: "bg-amber-600 text-white" },
  { id: "crash", name: "Crash Cymbal", category: "drums", freq: 450, badge: "Cymbal", color: "text-yellow-600 bg-yellow-50 border-yellow-200", activeColor: "bg-yellow-500 text-white" },
  { id: "tom-hi", name: "High Tom", category: "drums", freq: 240, badge: "Tom", color: "text-teal-600 bg-teal-50 border-teal-200", activeColor: "bg-teal-500 text-white" },
  { id: "tom-lo", name: "Floor Tom", category: "drums", freq: 110, badge: "Tom", color: "text-emerald-700 bg-emerald-50 border-emerald-200", activeColor: "bg-emerald-600 text-white" },
  { id: "clap", name: "Handclap", category: "drums", freq: 440, badge: "Perc", color: "text-emerald-600 bg-emerald-50 border-emerald-200", activeColor: "bg-emerald-500 text-white" },
  { id: "shaker", name: "Shaker", category: "drums", freq: 900, badge: "Perc", color: "text-lime-600 bg-lime-50 border-lime-200", activeColor: "bg-lime-500 text-white" },
  { id: "cowbell", name: "808 Cowbell", category: "drums", freq: 587, badge: "Perc", color: "text-cyan-600 bg-cyan-50 border-cyan-200", activeColor: "bg-cyan-500 text-white" },

  // --- GRAND PIANO ---
  { id: "piano-c3", name: "Piano C3 (Bass)", category: "piano", freq: 130.81, badge: "Piano", color: "text-sky-700 bg-sky-50 border-sky-200", activeColor: "bg-sky-600 text-white" },
  { id: "piano-e3", name: "Piano E3", category: "piano", freq: 164.81, badge: "Piano", color: "text-sky-600 bg-sky-50 border-sky-200", activeColor: "bg-sky-500 text-white" },
  { id: "piano-g3", name: "Piano G3", category: "piano", freq: 196.0, badge: "Piano", color: "text-blue-600 bg-blue-50 border-blue-200", activeColor: "bg-blue-500 text-white" },
  { id: "piano-c4", name: "Piano C4 (Mid)", category: "piano", freq: 261.63, badge: "Piano", color: "text-blue-700 bg-blue-50 border-blue-200", activeColor: "bg-blue-600 text-white" },
  { id: "piano-e4", name: "Piano E4", category: "piano", freq: 329.63, badge: "Piano", color: "text-indigo-600 bg-indigo-50 border-indigo-200", activeColor: "bg-indigo-500 text-white" },
  { id: "piano-g4", name: "Piano G4", category: "piano", freq: 392.0, badge: "Piano", color: "text-indigo-700 bg-indigo-50 border-indigo-200", activeColor: "bg-indigo-600 text-white" },
  { id: "piano-c5", name: "Piano C5 (High)", category: "piano", freq: 523.25, badge: "Piano", color: "text-violet-600 bg-violet-50 border-violet-200", activeColor: "bg-violet-500 text-white" },

  // --- GUITAR ---
  { id: "guitar-e2", name: "Acoustic E2 (Low)", category: "guitar", freq: 82.41, badge: "Acoustic", color: "text-amber-800 bg-amber-50 border-amber-200", activeColor: "bg-amber-700 text-white" },
  { id: "guitar-a2", name: "Acoustic A2", category: "guitar", freq: 110.0, badge: "Acoustic", color: "text-amber-700 bg-amber-50 border-amber-200", activeColor: "bg-amber-600 text-white" },
  { id: "guitar-d3", name: "Acoustic D3", category: "guitar", freq: 146.83, badge: "Acoustic", color: "text-orange-700 bg-orange-50 border-orange-200", activeColor: "bg-orange-600 text-white" },
  { id: "guitar-g3", name: "Acoustic G3 (Pluck)", category: "guitar", freq: 196.0, badge: "Acoustic", color: "text-orange-600 bg-orange-50 border-orange-200", activeColor: "bg-orange-500 text-white" },
  { id: "guitar-e4", name: "Acoustic E4 (High)", category: "guitar", freq: 329.63, badge: "Acoustic", color: "text-yellow-700 bg-yellow-50 border-yellow-200", activeColor: "bg-yellow-600 text-white" },
  { id: "guitar-elec", name: "Electric Overdrive", category: "guitar", freq: 164.81, badge: "Electric", color: "text-red-700 bg-red-50 border-red-200", activeColor: "bg-red-600 text-white" },

  // --- FLUTE & WOODWINDS ---
  { id: "flute-c4", name: "Flute C4 (Airy)", category: "flute", freq: 261.63, badge: "Flute", color: "text-teal-700 bg-teal-50 border-teal-200", activeColor: "bg-teal-600 text-white" },
  { id: "flute-e4", name: "Flute E4 (Melody)", category: "flute", freq: 329.63, badge: "Flute", color: "text-emerald-600 bg-emerald-50 border-emerald-200", activeColor: "bg-emerald-500 text-white" },
  { id: "flute-g4", name: "Flute G4 (Soar)", category: "flute", freq: 392.0, badge: "Flute", color: "text-cyan-600 bg-cyan-50 border-cyan-200", activeColor: "bg-cyan-500 text-white" },
  { id: "flute-c5", name: "Flute C5 (Flutter)", category: "flute", freq: 523.25, badge: "Flute", color: "text-sky-600 bg-sky-50 border-sky-200", activeColor: "bg-sky-500 text-white" },

  // --- BASS ---
  { id: "bass-808", name: "808 Sub Bass", category: "bass", freq: 55.0, badge: "Sub", color: "text-purple-700 bg-purple-50 border-purple-200", activeColor: "bg-purple-600 text-white" },
  { id: "bass-slap", name: "Slap Funk Bass", category: "bass", freq: 73.42, badge: "Slap", color: "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200", activeColor: "bg-fuchsia-600 text-white" },

  // --- STRINGS & BRASS ---
  { id: "violin-c4", name: "Violin Strings", category: "orchestra", freq: 261.63, badge: "Strings", color: "text-violet-800 bg-violet-50 border-violet-200", activeColor: "bg-violet-700 text-white" },
  { id: "trumpet-c4", name: "Trumpet Brass", category: "orchestra", freq: 293.66, badge: "Brass", color: "text-amber-600 bg-amber-50 border-amber-200", activeColor: "bg-amber-500 text-white" },
];

const NUM_STEPS = 16;

// Built-in presets showcasing Piano, Guitar, Flute, and Drums
const BUILTIN_PRESETS: Record<string, { name: string; bpm: number; grid: Record<string, boolean[]> }> = {
  acoustic: {
    name: "Acoustic Guitar & Piano Harmony",
    bpm: 105,
    grid: {
      kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      "hihat-c": [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      shaker: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
      "guitar-e2": [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      "guitar-g3": [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      "guitar-e4": [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      "piano-c4": [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      "piano-g4": [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
      "flute-e4": [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      "flute-g4": [false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
    },
  },
  hiphop: {
    name: "Lo-Fi Beats & 808",
    bpm: 92,
    grid: {
      kick: [true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      "hihat-c": [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      "hihat-o": [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
      clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      "bass-808": [true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false],
      "piano-c4": [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      "piano-e4": [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false],
      "flute-c5": [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
    },
  },
  rock: {
    name: "Rock & Funk Drive",
    bpm: 125,
    grid: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      "hihat-o": [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      cowbell: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      "guitar-elec": [true, false, true, false, false, false, true, false, true, false, true, false, false, false, true, false],
      "bass-slap": [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    },
  },
  orchestra: {
    name: "Serenade (Flute, Strings & Piano)",
    bpm: 88,
    grid: {
      shaker: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      "tom-lo": [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      "violin-c4": [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      "piano-c3": [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      "piano-c4": [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      "flute-c4": [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      "flute-e4": [false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false],
      "flute-g4": [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      "flute-c5": [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
      "trumpet-c4": [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
    },
  },
};

export function Soundboard({ activitySlug = "soundboard" }: { activitySlug?: string }) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(110);
  const [activePadId, setActivePadId] = useState<string | null>(null);

  // Selected Category filter
  const [activeCategory, setActiveCategory] = useState<InstrumentCategory>("ALL");

  // Layer Mutes
  const [layerMutes, setLayerMutes] = useState<Record<string, boolean>>({
    drums: false,
    piano: false,
    guitar: false,
    flute: false,
    bass: false,
    orchestra: false,
  });

  // Step grid: trackId -> boolean[16]
  const [grid, setGrid] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    INSTRUMENT_TRACKS.forEach((track) => {
      initial[track.id] = Array(NUM_STEPS).fill(false);
    });
    // Default pleasant groove
    initial["kick"][0] = true;
    initial["kick"][8] = true;
    initial["snare"][4] = true;
    initial["snare"][12] = true;
    initial["hihat-c"][2] = true;
    initial["hihat-c"][6] = true;
    initial["hihat-c"][10] = true;
    initial["hihat-c"][14] = true;
    initial["piano-c4"][0] = true;
    initial["piano-e4"][4] = true;
    initial["piano-g4"][8] = true;
    initial["guitar-g3"][2] = true;
    initial["flute-c5"][12] = true;
    return initial;
  });

  // Saved Beats library in localStorage
  const [savedBeats, setSavedBeats] = useState<
    Array<{ id: string; name: string; bpm: number; grid: Record<string, boolean[]> }>
  >([]);
  const [saveBeatName, setSaveBeatName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Gamification & Rewarded ad
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const getNoiseBuffer = useCallback((ctx: AudioContext) => {
    if (!noiseBufferRef.current) {
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }
    return noiseBufferRef.current;
  }, []);

  // Load saved beats from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bored_saved_beats");
      if (stored) {
        setSavedBeats(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sophisticated instrument synthesis engine using Web Audio API
  const triggerTrackSound = useCallback(
    (track: InstrumentTrack) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (track.category === "drums") {
          // --- DRUM SYNTHESIS ---
          if (track.id === "kick") {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(145, now);
            osc.frequency.exponentialRampToValueAtTime(36, now + 0.08);
            gain.gain.setValueAtTime(0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.26);
          } else if (track.id === "snare") {
            // Snare: Tone + Noise
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.frequency.setValueAtTime(210, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
            oscGain.gain.setValueAtTime(0.4, now);
            oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(oscGain);
            oscGain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);

            const noise = ctx.createBufferSource();
            noise.buffer = getNoiseBuffer(ctx);
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1200, now);
            filter.Q.setValueAtTime(1.2, now);
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.65, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 0.18);
          } else if (track.id === "hihat-c" || track.id === "hihat-o" || track.id === "crash" || track.id === "shaker") {
            const noise = ctx.createBufferSource();
            noise.buffer = getNoiseBuffer(ctx);
            const filter = ctx.createBiquadFilter();
            filter.type = "highpass";
            const noiseGain = ctx.createGain();

            const isCrash = track.id === "crash";
            const isOpen = track.id === "hihat-o";
            const isShaker = track.id === "shaker";

            const cutoff = isCrash ? 4500 : isShaker ? 5500 : isOpen ? 6200 : 7800;
            const decay = isCrash ? 1.2 : isOpen ? 0.32 : isShaker ? 0.08 : 0.05;
            const vol = isCrash ? 0.6 : isShaker ? 0.35 : 0.45;

            filter.frequency.setValueAtTime(cutoff, now);
            noiseGain.gain.setValueAtTime(vol, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + decay);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + decay);
          } else if (track.id.startsWith("tom")) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startFreq = track.id === "tom-hi" ? 240 : 130;
            const endFreq = track.id === "tom-hi" ? 95 : 52;
            const dur = track.id === "tom-hi" ? 0.22 : 0.32;

            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);
            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + dur);
          } else if (track.id === "clap") {
            [0, 0.012, 0.024].forEach((offset) => {
              const noise = ctx.createBufferSource();
              noise.buffer = getNoiseBuffer(ctx);
              const filter = ctx.createBiquadFilter();
              filter.type = "bandpass";
              filter.frequency.setValueAtTime(1100, now + offset);
              const gain = ctx.createGain();
              gain.gain.setValueAtTime(0.6, now + offset);
              gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);
              noise.connect(filter);
              filter.connect(gain);
              gain.connect(ctx.destination);
              noise.start(now + offset);
              noise.stop(now + offset + 0.12);
            });
          } else if (track.id === "cowbell") {
            [587, 845].forEach((f) => {
              const osc = ctx.createOscillator();
              osc.type = "square";
              osc.frequency.setValueAtTime(f, now);
              const filter = ctx.createBiquadFilter();
              filter.type = "bandpass";
              filter.frequency.setValueAtTime(800, now);
              const gain = ctx.createGain();
              gain.gain.setValueAtTime(0.35, now);
              gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
              osc.connect(filter);
              filter.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now);
              osc.stop(now + 0.18);
            });
          }
        } else if (track.category === "piano") {
          // --- ACOUSTIC GRAND PIANO ---
          // Multi-harmonic mix (Fundamental + 2nd + 3rd harmonic) through lowpass filter
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const osc3 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(track.freq, now);

          osc2.type = "sine";
          osc2.frequency.setValueAtTime(track.freq * 2, now);

          osc3.type = "triangle";
          osc3.frequency.setValueAtTime(track.freq * 3, now);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(3200, now);
          filter.frequency.exponentialRampToValueAtTime(650, now + 0.8);

          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 1.25);

          osc1.connect(filter);
          osc2.connect(filter);
          osc3.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc3.start(now);
          osc1.stop(now + 1.25);
          osc2.stop(now + 1.25);
          osc3.stop(now + 1.25);
        } else if (track.category === "guitar") {
          // --- GUITAR (ACOUSTIC & ELECTRIC) ---
          if (track.id === "guitar-elec") {
            // Electric overdrive rock guitar
            const osc = ctx.createOscillator();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(track.freq, now);

            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1100, now);
            filter.Q.setValueAtTime(2.2, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.65, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.65);
          } else {
            // Plucked acoustic guitar string
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(track.freq, now);

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(2400, now);
            filter.frequency.exponentialRampToValueAtTime(350, now + 0.6);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.75, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.9);
          }
        } else if (track.category === "flute") {
          // --- FLUTE WITH BREATH & VIBRATO LFO ---
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(track.freq, now);

          // Vibrato LFO
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(5.5, now); // 5.5 Hz human vibrato
          lfoGain.gain.setValueAtTime(4.5, now); // +/- 4.5 Hz depth
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(now);
          lfo.stop(now + 0.6);

          // Soft breath envelope
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.6, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.55);
        } else if (track.category === "bass") {
          // --- 808 SUB & SLAP BASS ---
          if (track.id === "bass-808") {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(65, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.55);
          } else {
            // Slap Funk bass pop
            const osc = ctx.createOscillator();
            osc.type = "square";
            osc.frequency.setValueAtTime(track.freq, now);
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(2000, now);
            filter.frequency.exponentialRampToValueAtTime(220, now + 0.25);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.65, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
          }
        } else if (track.category === "orchestra") {
          // --- STRINGS & BRASS ---
          if (track.id === "violin-c4") {
            // Bowed string
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = "sawtooth";
            osc1.frequency.setValueAtTime(track.freq, now);
            osc2.type = "sawtooth";
            osc2.frequency.setValueAtTime(track.freq * 1.006, now);

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1600, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.5, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.9);
            osc2.stop(now + 0.9);
          } else {
            // Trumpet brass fanfare
            const osc = ctx.createOscillator();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(track.freq, now);

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(2800, now);
            filter.frequency.exponentialRampToValueAtTime(900, now + 0.35);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.4);
          }
        }

        setActivePadId(track.id);
        setTimeout(() => setActivePadId(null), 150);
      } catch (e) {
        console.error(e);
      }
    },
    [getAudioContext, getNoiseBuffer]
  );

  // 16-Step loop playback sequencer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const stepDurationMs = Math.round(60000 / bpm / 4);
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % NUM_STEPS;

          INSTRUMENT_TRACKS.forEach((track) => {
            if (!layerMutes[track.category] && grid[track.id]?.[nextStep]) {
              triggerTrackSound(track);
            }
          });

          return nextStep;
        });
      }, stepDurationMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, bpm, grid, layerMutes, triggerTrackSound]);

  // Toggle step in grid
  const toggleStep = (trackId: string, stepIndex: number) => {
    sound.playClick();
    setGrid((prev) => {
      const copy = { ...prev };
      const row = [...(copy[trackId] || Array(NUM_STEPS).fill(false))];
      row[stepIndex] = !row[stepIndex];
      copy[trackId] = row;
      return copy;
    });

    const nextTaps = tapCount + 1;
    setTapCount(nextTaps);
    if (nextTaps === 14) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activitySlug, score: 100 }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.pointsEarned) setEarnedXp(d.pointsEarned);
        })
        .catch(console.error);
    }
  };

  // Toggle Layer Mute
  const toggleLayerMute = (cat: string) => {
    sound.playClick();
    setLayerMutes((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Load Preset
  const loadPreset = (presetKey: string) => {
    sound.playClick();
    const preset = BUILTIN_PRESETS[presetKey];
    if (preset) {
      setBpm(preset.bpm);
      // Ensure all instrument rows exist in preset grid
      const fullGrid: Record<string, boolean[]> = {};
      INSTRUMENT_TRACKS.forEach((track) => {
        fullGrid[track.id] = preset.grid[track.id] || Array(NUM_STEPS).fill(false);
      });
      setGrid(fullGrid);
      setCurrentStep(0);
    }
  };

  // Save Beat to localStorage
  const handleSaveBeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveBeatName.trim()) return;

    sound.playWin();
    const newBeat = {
      id: Date.now().toString(),
      name: saveBeatName.trim(),
      bpm,
      grid,
    };

    const updated = [newBeat, ...savedBeats];
    setSavedBeats(updated);
    try {
      localStorage.setItem("bored_saved_beats", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSaveBeatName("");
    setShowSaveModal(false);
  };

  // Load User Saved Beat
  const loadSavedBeat = (beat: { bpm: number; grid: Record<string, boolean[]> }) => {
    sound.playClick();
    setBpm(beat.bpm);
    const fullGrid: Record<string, boolean[]> = {};
    INSTRUMENT_TRACKS.forEach((track) => {
      fullGrid[track.id] = beat.grid[track.id] || Array(NUM_STEPS).fill(false);
    });
    setGrid(fullGrid);
    setCurrentStep(0);
  };

  // Delete User Saved Beat
  const deleteSavedBeat = (id: string) => {
    const updated = savedBeats.filter((b) => b.id !== id);
    setSavedBeats(updated);
    try {
      localStorage.setItem("bored_saved_beats", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Clear Grid
  const clearGrid = () => {
    sound.playClick();
    const clean: Record<string, boolean[]> = {};
    INSTRUMENT_TRACKS.forEach((track) => {
      clean[track.id] = Array(NUM_STEPS).fill(false);
    });
    setGrid(clean);
  };

  const filteredTracks = INSTRUMENT_TRACKS.filter((t) =>
    activeCategory === "ALL" ? true : t.category === activeCategory
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
        {/* Play / Pause Loop Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              getAudioContext();
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer ${
              isPlaying
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                : "bg-violet-600 hover:bg-violet-700 shadow-violet-500/20"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Loop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play on Loop</span>
              </>
            )}
          </button>

          {/* BPM Tempo Slider */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 font-mono w-16">{bpm} BPM</span>
            <input
              type="range"
              min="75"
              max="155"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-24 accent-violet-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Presets & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset("acoustic")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer transition-colors"
          >
            Acoustic
          </button>
          <button
            onClick={() => loadPreset("hiphop")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 cursor-pointer transition-colors"
          >
            Lo-Fi Hip-Hop
          </button>
          <button
            onClick={() => loadPreset("rock")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 cursor-pointer transition-colors"
          >
            Rock / Funk
          </button>
          <button
            onClick={() => loadPreset("orchestra")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer transition-colors"
          >
            Orchestra
          </button>

          {/* Clear Grid */}
          <button
            onClick={clearGrid}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
            title="Clear all steps"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Save Beat Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-violet-600" />
            <span>Save Beat</span>
          </button>
        </div>
      </div>

      {/* Instrument Categories Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Instruments:</span>

          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "ALL"
                ? "bg-violet-600 text-white shadow-xs"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All ({INSTRUMENT_TRACKS.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("drums")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "drums"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <Drum className="w-3.5 h-3.5" />
            <span>Full Drums (10)</span>
          </button>

          <button
            onClick={() => setActiveCategory("piano")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "piano"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200"
            }`}
          >
            <Piano className="w-3.5 h-3.5" />
            <span>Piano (7)</span>
          </button>

          <button
            onClick={() => setActiveCategory("guitar")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "guitar"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Guitar className="w-3.5 h-3.5" />
            <span>Guitar (6)</span>
          </button>

          <button
            onClick={() => setActiveCategory("flute")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "flute"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Flute (4)</span>
          </button>

          <button
            onClick={() => setActiveCategory("bass")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "bass"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Bass (2)</span>
          </button>

          <button
            onClick={() => setActiveCategory("orchestra")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "orchestra"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Orchestra (2)</span>
          </button>
        </div>

        {/* Category Mute / Solo Toggles */}
        <div className="flex items-center gap-1.5 pt-2 sm:pt-0">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Mute:</span>
          {(["drums", "piano", "guitar", "flute", "bass", "orchestra"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleLayerMute(cat)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border transition-colors cursor-pointer flex items-center gap-1 ${
                layerMutes[cat]
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {layerMutes[cat] ? <VolumeX className="w-2.5 h-2.5 text-rose-600" /> : <Volume2 className="w-2.5 h-2.5 text-slate-500" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 16-Step Grid Sequencer Container */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2.5 overflow-x-auto">
        {/* Step Indicator Header (0-15) */}
        <div className="flex items-center min-w-[700px] pb-2 border-b border-slate-100">
          <div className="w-36 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Instruments (Click to Test)
          </div>
          <div className="flex-1 grid grid-cols-16 gap-1 sm:gap-1.5">
            {Array.from({ length: NUM_STEPS }).map((_, stepIdx) => (
              <div
                key={stepIdx}
                className={`text-center text-[10px] font-mono font-bold py-1 rounded transition-colors ${
                  isPlaying && currentStep === stepIdx
                    ? "bg-violet-600 text-white shadow-xs scale-105"
                    : stepIdx % 4 === 0
                    ? "text-slate-900 bg-slate-100/80"
                    : "text-slate-400"
                }`}
              >
                {stepIdx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Tracks Grid Rows */}
        <div className="space-y-1.5 min-w-[700px]">
          {filteredTracks.map((track) => {
            const isMuted = layerMutes[track.category];
            const isTrackActive = activePadId === track.id;

            return (
              <div
                key={track.id}
                className={`flex items-center gap-2 p-1 rounded-2xl transition-all ${
                  isTrackActive
                    ? "bg-violet-50/80 ring-1 ring-violet-300"
                    : "hover:bg-slate-50/60"
                } ${isMuted ? "opacity-35" : ""}`}
              >
                {/* Track Trigger Pad Button */}
                <button
                  onClick={() => triggerTrackSound(track)}
                  className={`w-36 shrink-0 py-2 px-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between border transition-all cursor-pointer ${
                    isTrackActive
                      ? `${track.activeColor} shadow-xs scale-102`
                      : track.color
                  }`}
                >
                  <span className="truncate">{track.name}</span>
                  <span className="text-[9px] uppercase font-bold opacity-75">{track.badge}</span>
                </button>

                {/* 16 Step Dots */}
                <div className="flex-1 grid grid-cols-16 gap-1 sm:gap-1.5">
                  {Array.from({ length: NUM_STEPS }).map((_, stepIdx) => {
                    const isActive = grid[track.id]?.[stepIdx];
                    const isPlayhead = isPlaying && currentStep === stepIdx;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => toggleStep(track.id, stepIdx)}
                        className={`aspect-square rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? `${track.activeColor} border-transparent shadow-xs scale-95`
                            : isPlayhead
                            ? "bg-violet-100 border-violet-400"
                            : stepIdx % 4 === 0
                            ? "bg-slate-100 border-slate-200 hover:border-violet-300"
                            : "bg-slate-50/70 border-slate-200 hover:border-violet-300"
                        }`}
                        title={`${track.name} step ${stepIdx + 1}`}
                      >
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved User Beats Library Drawer */}
      {savedBeats.length > 0 && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-amber-600" />
              <span>My Saved Beats ({savedBeats.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Stored in your browser</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {savedBeats.map((beat) => (
              <div
                key={beat.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-slate-900">{beat.name}</h5>
                  <span className="text-[10px] text-slate-500 font-mono">{beat.bpm} BPM</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => loadSavedBeat(beat)}
                    className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteSavedBeat(beat.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete beat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
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

      {/* Save Beat Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Save Your Beat</h3>
            <p className="text-xs text-slate-500">
              Give your multi-instrument loop a name to save it to your library.
            </p>

            <form onSubmit={handleSaveBeat} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                value={saveBeatName}
                onChange={(e) => setSaveBeatName(e.target.value)}
                placeholder="e.g. Guitar & Flute Groove"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                >
                  Save Loop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
