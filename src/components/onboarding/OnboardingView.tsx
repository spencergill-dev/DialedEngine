import { useState } from "react";
import {
  Feather,
  Compass,
  Flame,
  ArrowRight,
  User,
  Scale,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { RidingStyle } from "@/types/cycling";

interface OnboardingViewProps {
  initialDisplayName?: string;
  onComplete: (profile: {
    displayName: string;
    weight: number;
    ridingStyle: RidingStyle;
    heightInches: number;
  }) => Promise<void> | void;
}

const RIDING_STYLES: {
  id: RidingStyle;
  title: string;
  desc: string;
  offset: string;
  icon: typeof Feather;
}[] = [
  {
    id: "smooth_light",
    title: "Smooth & Finesse",
    desc: "Clean line selection, maximum traction & small-bump tracking",
    offset: "-1.0 PSI",
    icon: Feather,
  },
  {
    id: "neutral",
    title: "Balanced Trail",
    desc: "Factory baseline sag and air pressures for all-around riding",
    offset: "Baseline",
    icon: Compass,
  },
  {
    id: "aggressive_heavy",
    title: "Aggro & Heavy",
    desc: "Hard berm g-outs, high-speed chunk & rim bottom-out defense",
    offset: "+1.5 PSI",
    icon: Flame,
  },
];

export function OnboardingView({
  initialDisplayName = "",
  onComplete,
}: OnboardingViewProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [weight, setWeight] = useState(170);
  const [ridingStyle, setRidingStyle] = useState<RidingStyle>("neutral");
  const [heightInches, setHeightInches] = useState(71); // 5' 11"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;
  const cm = Math.round(heightInches * 2.54);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        displayName: displayName.trim(),
        weight,
        ridingStyle,
        heightInches,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 font-sans selection:bg-lime-500/25 selection:text-lime-300 relative overflow-hidden">
      {/* Ambient Radial Atmospheric Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-lime-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Header Stack */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-lime-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RIDER SETUP CALIBRATION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Calibrate Your Baseline
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto">
            Dialed calculates custom air spring and tire pressures tailored specifically to your body mass and riding dynamics.
          </p>
        </div>

        {/* Card Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* 1. Rider Call-sign / Name */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-lime-400" />
              <span>Rider Name / Call-Sign</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. Spencer"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-11 bg-zinc-900 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-lime-400 focus-visible:border-lime-400 font-medium"
            />
          </div>

          {/* 2. Rider Weight (lbs) */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-lime-400" />
                <span>Riding Weight (With Gear)</span>
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xl font-black text-lime-400">
                  {weight}
                </span>
                <span className="text-xs font-bold text-zinc-400">LBS</span>
                <span className="text-[11px] font-mono text-zinc-500 ml-1">
                  ({Math.round(weight * 0.453592)} kg)
                </span>
              </div>
            </div>

            <Slider
              min={100}
              max={280}
              step={1}
              value={[weight]}
              onValueChange={([val]) => setWeight(val)}
              className="py-1 cursor-pointer"
            />

            <p className="text-[11px] text-zinc-400">
              Includes helmet, hydration pack, shoes, and tools ready to drop in.
            </p>
          </div>

          {/* 3. Riding Style */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Riding Style & Trail Aggression
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {RIDING_STYLES.map((style) => {
                const isSelected = ridingStyle === style.id;
                const Icon = style.icon;

                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setRidingStyle(style.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-lime-400/10 border-lime-400/80 shadow-[0_0_15px_rgba(163,230,53,0.15)]"
                        : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? "text-lime-400" : "text-zinc-400"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-lime-400/20 text-lime-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {style.offset}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">
                        {style.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        {style.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-lime-400/20 flex items-center gap-1 text-[10px] font-bold text-lime-400">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Height (Inches) */}
          <div className="space-y-2 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Rider Height
              </Label>
              <span className="text-xs font-bold text-zinc-300 font-mono">
                {feet}&apos; {inches}&quot; ({cm} cm)
              </span>
            </div>
            <Slider
              min={58}
              max={82}
              step={1}
              value={[heightInches]}
              onValueChange={([val]) => setHeightInches(val)}
              className="py-1 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!displayName.trim() || isSubmitting}
            className="w-full h-12 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(163,230,53,0.3)] transition-all disabled:opacity-50 border-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Calibrating Setup OS...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Enter Garage</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
