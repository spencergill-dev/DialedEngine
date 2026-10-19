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
import { Slider } from "@/components/ui/slider";
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
  const [heightInchesVal, setHeightInchesVal] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived height values
  const totalHeightInches =
    heightFeet !== "" || heightInchesVal !== ""
      ? (heightFeet !== "" ? Number(heightFeet) * 12 : 0) +
        (heightInchesVal !== "" ? Number(heightInchesVal) : 0)
      : null;

  const parsedCm =
    totalHeightInches !== null ? Math.round(totalHeightInches * 2.54) : null;

  const handleHeightSliderChange = ([totalInches]: number[]) => {
    setHeightFeet(Math.floor(totalInches / 12));
    setHeightInchesVal(totalInches % 12);
  };

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
        heightInches: totalHeightInches,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-[100dvh] w-full max-w-full bg-[#111111] text-zinc-100 flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-4 pt-6 sm:pt-10 pb-36 sm:pb-24 font-sans selection:bg-lime-500/25 selection:text-lime-300 relative">
      {/* Ambient Radial Atmospheric Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-lime-500/10 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10 mx-auto my-0 sm:my-auto"
      >
        {/* Header Stack */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-lime-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 1 of 2 • Rider Baseline Setup</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Configure Your Baseline
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            Configure your riding weight and aggression profile to calibrate suspension and tire pressures.
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

          {/* 2. Rider Weight (lbs) - Interactive Slider + Synchronized Input */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-lime-400" />
                  <span>Riding Weight (With Gear)</span>
                </Label>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Includes full kit: helmet, shoes, hydration, and tools
                </p>
              </div>

              {/* Synchronized Numeric Text Input */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Input
                  type="number"
                  min={70}
                  max={400}
                  placeholder="e.g. 175"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWeight(val === "" ? "" : Number(val));
                  }}
                  className="w-24 h-10 text-right font-mono text-base font-bold bg-zinc-900 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-lime-400"
                />
                <span className="text-xs font-bold text-zinc-400 font-mono">LBS</span>
              </div>
            </div>

            {/* Range Slider */}
            <div className="pt-1 space-y-2">
              <Slider
                min={80}
                max={300}
                step={1}
                value={[typeof weight === "number" ? weight : 160]}
                onValueChange={([val]) => setWeight(val)}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>80 LBS</span>
                <span>
                  {typeof weight === "number" ? (
                    <span className="text-lime-400 font-bold">
                      {weight} LBS ({Math.round(weight * 0.453592)} kg)
                    </span>
                  ) : (
                    <span className="text-zinc-500 italic">Slide or type weight</span>
                  )}
                </span>
                <span>300 LBS</span>
              </div>
            </div>
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

          {/* 4. Height Field (Synchronized Slider + Inputs, starts completely blank) */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Rider Height (Optional)</span>
                </Label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Assists cockpit reach and balance calibrations
                </p>
              </div>

              {/* Display readout */}
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-300 font-mono">
                  {totalHeightInches !== null ? (
                    <>
                      {Math.floor(totalHeightInches / 12)}&apos; {totalHeightInches % 12}&quot;
                      <span className="text-zinc-500 ml-1">({parsedCm} cm)</span>
                    </>
                  ) : (
                    "--"
                  )}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="pt-1 space-y-2">
              <Slider
                min={54}
                max={82}
                step={1}
                value={[totalHeightInches !== null ? totalHeightInches : 68]}
                onValueChange={handleHeightSliderChange}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>4&apos; 6&quot;</span>
                <span className="text-zinc-400">5&apos; 8&quot;</span>
                <span>6&apos; 10&quot;</span>
              </div>
            </div>

            {/* Feet & Inches direct inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Feet
                </span>
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
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Inches
                </span>
                <Input
                  type="number"
                  min={0}
                  max={11}
                  placeholder="e.g. 10"
                  value={heightInchesVal}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeightInchesVal(val === "" ? "" : Number(val));
                  }}
                  className="h-10 bg-zinc-900 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-lime-400 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* 5. Action Button: Continue to Garage */}
          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full h-12 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(163,230,53,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Calibrating Setup OS...</span>
                </>
              ) : (
                <>
                  <span>Continue to Garage</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            {!isFormValid && (
              <p className="text-center text-[11px] text-zinc-500 font-medium">
                {!displayName.trim()
                  ? "Please enter your rider name or call-sign to continue"
                  : typeof weight !== "number" || weight < 70
                  ? "Please enter or slide your riding weight (minimum 70 lbs) to continue"
                  : ""}
              </p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
