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
  Ruler,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RidingStyle } from "@/types/cycling";

interface OnboardingViewProps {
  initialDisplayName?: string;
  onComplete: (profile: {
    displayName: string;
    weight: number;
    ridingStyle: RidingStyle;
    heightInches: number | null;
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
  // All fields start completely blank without hardcoded fallback numbers
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [weight, setWeight] = useState<number | "">("");
  const [ridingStyle, setRidingStyle] = useState<RidingStyle>("neutral");
  const [heightFeet, setHeightFeet] = useState<number | "">("");
  const [heightInches, setHeightInches] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedTotalHeightInches =
    heightFeet !== "" && heightInches !== ""
      ? Number(heightFeet) * 12 + Number(heightInches)
      : null;

  const parsedCm = parsedTotalHeightInches
    ? Math.round(parsedTotalHeightInches * 2.54)
    : null;

  const isFormValid =
    displayName.trim().length > 0 &&
    typeof weight === "number" &&
    weight >= 70 &&
    weight <= 400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        displayName: displayName.trim(),
        weight: Number(weight),
        ridingStyle,
        heightInches: parsedTotalHeightInches,
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
              placeholder="Enter your name or call-sign"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-11 bg-zinc-900 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-lime-400 focus-visible:border-lime-400 font-medium"
            />
          </div>

          {/* 2. Rider Weight (lbs) - Starts completely blank, forcing user entry */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-lime-400" />
                <span>Riding Weight (With Gear)</span>
              </Label>
              <div className="flex items-center gap-1.5">
                {weight !== "" ? (
                  <>
                    <span className="font-mono text-xl font-black text-lime-400">
                      {weight}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">LBS</span>
                    <span className="text-[11px] font-mono text-zinc-500 ml-1">
                      ({Math.round(Number(weight) * 0.453592)} kg)
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] font-mono font-bold text-amber-400/90 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Required
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <Input
                type="number"
                required
                min={70}
                max={400}
                placeholder="Enter weight in lbs (e.g. 175)"
                value={weight}
                onChange={(e) => {
                  const val = e.target.value;
                  setWeight(val === "" ? "" : Number(val));
                }}
                className="h-11 bg-zinc-900 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-lime-400 focus-visible:border-lime-400 font-medium font-mono text-sm"
              />
            </div>

            <p className="text-[11px] text-zinc-400">
              Measured in full gear: helmet, pack, shoes, and hydration tools ready to drop in.
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

          {/* 4. Height (Optional) - Starts completely blank */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-zinc-400" />
                <span>Rider Height (Optional)</span>
              </Label>
              <span className="text-xs font-bold text-zinc-300 font-mono">
                {parsedTotalHeightInches !== null
                  ? `${heightFeet}' ${heightInches}" (${parsedCm} cm)`
                  : "--"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Feet</span>
                <Input
                  type="number"
                  min={4}
                  max={7}
                  placeholder="e.g. 5"
                  value={heightFeet}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeightFeet(val === "" ? "" : Number(val));
                  }}
                  className="h-10 bg-zinc-900 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-lime-400 font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Inches</span>
                <Input
                  type="number"
                  min={0}
                  max={11}
                  placeholder="e.g. 10"
                  value={heightInches}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeightInches(val === "" ? "" : Number(val));
                  }}
                  className="h-10 bg-zinc-900 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-lime-400 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-12 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(163,230,53,0.3)] transition-all disabled:opacity-40 border-none cursor-pointer"
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
