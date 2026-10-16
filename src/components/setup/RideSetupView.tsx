import { useState } from "react";
import {
  Sun,
  Leaf,
  CloudRain,
  Mountain,
  CheckCircle2,
  Feather,
  Compass,
  Flame,
  RotateCw,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { useDialedMath } from "@/hooks/useDialedMath";
import type {
  Bike,
  RiderProfile,
  TrailCondition,
  RidingStyle,
} from "@/types/cycling";

interface RideSetupViewProps {
  bikes: Bike[];
  activeBikeId: string;
  onSelectBike: (id: string) => void;
  profile: RiderProfile;
  onSwitchToGarage: () => void;
}

const TRAIL_CONDITIONS: {
  id: TrailCondition;
  label: string;
  icon: typeof Sun;
  offset: string;
}[] = [
  { id: "dry_fast", label: "Dry", icon: Sun, offset: "0.0 PSI" },
  { id: "loam_dirt", label: "Loam", icon: Leaf, offset: "0.0 PSI" },
  { id: "wet_slippery", label: "Wet", icon: CloudRain, offset: "-1.5 PSI" },
  { id: "bike_park", label: "Park", icon: Mountain, offset: "+2.0 PSI" },
];

const RIDING_STYLES: {
  id: RidingStyle;
  label: string;
  icon: typeof Feather;
  offset: string;
}[] = [
  { id: "smooth_light", label: "Smooth", icon: Feather, offset: "-1.0 PSI" },
  { id: "neutral", label: "Neutral", icon: Compass, offset: "0.0 PSI" },
  { id: "aggressive_heavy", label: "Aggro", icon: Flame, offset: "+1.5 PSI" },
];

export function RideSetupView({
  bikes,
  activeBikeId,
  onSelectBike,
  profile,
  onSwitchToGarage,
}: RideSetupViewProps) {
  const [condition, setCondition] = useState<TrailCondition>("loam_dirt");
  const [rideStyle, setRideStyle] = useState<RidingStyle>(
    profile.ridingStyle || "neutral"
  );

  const currentBike = bikes.find((b) => b.id === activeBikeId) || bikes[0];
  const setup = useDialedMath(currentBike, profile, condition, rideStyle);

  const riderName = profile.displayName?.trim() || "Spencer";

  if (!currentBike) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-white font-sans">No Bike Selected</h3>
        <p className="text-sm text-zinc-400">
          Add a bicycle to your hardware fleet to calibrate tailored tire pressures and suspension dynamics.
        </p>
        <button
          onClick={onSwitchToGarage}
          className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl shadow-lg transition-colors"
        >
          Open Garage
        </button>
      </div>
    );
  }

  const displayBrand =
    currentBike.brand === "Custom"
      ? currentBike.customBrand || "Custom"
      : currentBike.brand;

  const hasAnySuspension = setup.hasForkSuspension || setup.hasRearSuspension;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Pre-Ride Configuration (Borderless Section) */}
      <section className="pb-8 border-b border-zinc-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              {/* Strict 6px Volt active status dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready to ride, {riderName}?
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 pl-4">
              Calibrated for {displayBrand} {currentBike.model} • {profile.weight} lbs riding mass
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-zinc-400 pl-4 sm:pl-0">
            <span className="text-white font-bold"><span className="font-mono">{profile.weight}</span> LBS</span>
            <span>•</span>
            <span className="capitalize text-zinc-400 font-sans">
              {currentBike.category.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Pre-Ride Inputs: Bike Selector, Conditions, Style Intensity */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-6">
          {/* Bicycle Selector */}
          <div className="md:col-span-4 space-y-2 min-w-0">
            <Label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400">
              Selected Bicycle
            </Label>
            <Select value={currentBike.id} onValueChange={onSelectBike}>
              <SelectTrigger className="h-11 w-full bg-zinc-900/60 border-none text-sm rounded-xl text-zinc-100 hover:bg-zinc-900 transition-colors whitespace-nowrap overflow-hidden [&>span]:truncate [&>span]:block [&>span]:min-w-0">
                <SelectValue placeholder="Choose a bike" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-none text-zinc-200">
                {bikes.map((b) => {
                  const bBrand =
                    b.brand === "Custom" ? b.customBrand || "Custom" : b.brand;
                  return (
                    <SelectItem key={b.id} value={b.id} className="text-sm py-2">
                      <div className="flex items-center gap-2 whitespace-nowrap truncate min-w-0">
                        <span className="font-semibold text-zinc-100 truncate whitespace-nowrap">
                          {bBrand} {b.model}
                        </span>
                        <span className="text-[11px] text-zinc-400 capitalize shrink-0 whitespace-nowrap">
                          ({b.category.replace("_", " ")})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Surface Conditions (Framer Motion Sliding Segment Pill) */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400">
                Surface Conditions
              </Label>
              {(() => {
                const offset = TRAIL_CONDITIONS.find((c) => c.id === condition)?.offset;
                if (!offset || offset === "0.0 PSI") {
                  return (
                    <span className="text-[10px] font-sans font-semibold tracking-wider text-zinc-500 uppercase">
                      [ Nominal ]
                    </span>
                  );
                }
                return (
                  <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200">
                    <span className="font-mono">{offset.split(" ")[0]}</span> PSI
                  </span>
                );
              })()}
            </div>

            <div className="relative grid grid-cols-4 gap-1 p-1 bg-zinc-900 rounded-xl">
              {TRAIL_CONDITIONS.map((cond) => {
                const isSelected = condition === cond.id;
                const Icon = cond.icon;

                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setCondition(cond.id)}
                    className={`relative z-10 py-2 px-1 text-xs font-sans font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="active-condition-pill"
                        className="absolute inset-0 bg-zinc-800 rounded-lg shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cond.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ride Intensity (Framer Motion Sliding Segment Pill) */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400">
                Ride Intensity
              </Label>
              {(() => {
                const offset = RIDING_STYLES.find((s) => s.id === rideStyle)?.offset;
                if (!offset || offset === "0.0 PSI") {
                  return (
                    <span className="text-[10px] font-sans font-semibold tracking-wider text-zinc-500 uppercase">
                      [ Nominal ]
                    </span>
                  );
                }
                return (
                  <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200">
                    <span className="font-mono">{offset.split(" ")[0]}</span> PSI
                  </span>
                );
              })()}
            </div>

            <div className="relative grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-xl">
              {RIDING_STYLES.map((style) => {
                const isSelected = rideStyle === style.id;
                const Icon = style.icon;

                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setRideStyle(style.id)}
                    className={`relative z-10 py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="active-style-pill"
                        className="absolute inset-0 bg-zinc-800 rounded-lg shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tires Section (Pure Digital Telemetry Typography, Borderless) */}
      <section className="py-8 border-b border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Front Tire Module */}
          <div className="space-y-4">
            {/* Top: Title */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-white">
                  FRONT TIRE
                </span>
                <span className="text-zinc-600 font-sans">•</span>
                <span className="text-xs font-medium text-zinc-300">
                  {currentBike.frontTire.manufacturer} {currentBike.frontTire.model} {currentBike.frontTire.width}
                </span>
              </div>
              <span className="text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase">
                {currentBike.frontTire.isTubeless ? "Tubeless" : "Tubes"}
              </span>
            </div>

            {/* Middle: Scaled Stark PSI Readout in Geist Mono */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white leading-none">
                <AnimatedNumber value={setup.frontPsi} precision={1} />
              </span>
              <span className="text-base sm:text-lg font-sans font-bold text-zinc-400 shrink-0">
                PSI
              </span>
              <span className="text-xs sm:text-sm font-mono text-zinc-500 ml-1.5 shrink-0">
                ({(setup.frontPsi * 0.0689476).toFixed(2)} bar)
              </span>
            </div>

            {/* Bottom: Modifier Ledger */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-500 block">
                Active Setup Modifiers
              </span>
              {setup.frontModifiers.length === 0 ? (
                <p className="text-zinc-500 italic text-xs">
                  Standard baseline pressure calibrated for discipline and rider mass.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {setup.frontModifiers.map((mod, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-zinc-300">
                      <span
                        className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          mod.delta > 0
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-lime-500/10 text-lime-400"
                        }`}
                      >
                        <span className="font-mono">{mod.delta > 0 ? `+${mod.delta.toFixed(1)}` : mod.delta.toFixed(1)}</span>
                      </span>
                      <span className="text-[11px] leading-tight text-zinc-300">
                        {mod.description}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Rear Tire Module */}
          <div className="space-y-4">
            {/* Top: Title */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-white">
                  REAR TIRE
                </span>
                <span className="text-zinc-600 font-sans">•</span>
                <span className="text-xs font-medium text-zinc-300">
                  {currentBike.rearTire.manufacturer} {currentBike.rearTire.model} {currentBike.rearTire.width}
                </span>
              </div>
              <span className="text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase">
                {currentBike.rearTire.isTubeless ? "Tubeless" : "Tubes"}
              </span>
            </div>

            {/* Middle: Scaled Stark PSI Readout in Geist Mono */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white leading-none">
                <AnimatedNumber value={setup.rearPsi} precision={1} />
              </span>
              <span className="text-base sm:text-lg font-sans font-bold text-zinc-400 shrink-0">
                PSI
              </span>
              <span className="text-xs sm:text-sm font-mono text-zinc-500 ml-1.5 shrink-0">
                ({(setup.rearPsi * 0.0689476).toFixed(2)} bar)
              </span>
            </div>

            {/* Bottom: Modifier Ledger */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-500 block">
                Active Setup Modifiers
              </span>
              {setup.rearModifiers.length === 0 ? (
                <p className="text-zinc-500 italic text-xs">
                  Standard baseline pressure calibrated for discipline and rider mass.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {setup.rearModifiers.map((mod, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-zinc-300">
                      <span
                        className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          mod.delta > 0
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-lime-500/10 text-lime-400"
                        }`}
                      >
                        <span className="font-mono">{mod.delta > 0 ? `+${mod.delta.toFixed(1)}` : mod.delta.toFixed(1)}</span>
                      </span>
                      <span className="text-[11px] leading-tight text-zinc-300">
                        {mod.description}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Suspension Section (Borderless, Conditionally Rendered) */}
      {hasAnySuspension && (
        <section className="py-2 border-b border-zinc-800/50 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Fork Setup Module */}
            {setup.hasForkSuspension && setup.forkPsi !== null && (
              <div
                className={`space-y-5 ${
                  !setup.hasRearSuspension ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
                      FRONT FORK SUSPENSION
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-200 mt-0.5">
                      {currentBike.forkModel} ({currentBike.forkTravel}mm)
                    </h3>
                  </div>
                  <span className="text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase">
                    Air Spring
                  </span>
                </div>

                {/* Dual Stats: Air Spring & Rebound (Strict 2-Column Grid) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block mb-1 truncate">
                      Air Pressure
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white leading-none">
                        <AnimatedNumber value={setup.forkPsi} precision={1} />
                      </span>
                      <span className="text-sm sm:text-base font-sans font-bold text-zinc-400 shrink-0">
                        PSI
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans mt-1.5 block truncate">
                      Target 20% Attack Sag
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block mb-1 flex items-center gap-1 truncate">
                      <RotateCw className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Rebound (LSR)</span>
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-amber-400 leading-none">
                        {setup.reboundClicks}
                      </span>
                      <span className="text-xs sm:text-sm font-sans font-bold text-zinc-400 shrink-0">
                        CLICKS OUT
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans mt-1.5 block truncate">
                      Counter-clockwise from closed
                    </span>
                  </div>
                </div>

                {/* Visual Clicker Stepper Gauge */}
                <div className="p-4 rounded-xl bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">
                      Rebound Dial Calibration
                    </span>
                    <span className="text-amber-400 font-semibold font-sans">
                      <span className="font-mono font-bold">{setup.reboundClicks}</span> clicks out
                    </span>
                  </div>

                  <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1 pt-1">
                    {Array.from({ length: 14 }).map((_, index) => {
                      const clickNum = index + 1;
                      const isCurrent = clickNum === setup.reboundClicks;
                      const isActive = clickNum <= (setup.reboundClicks || 0);

                      return (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-full h-3.5 rounded-sm transition-all ${
                              isCurrent
                                ? "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                                : isActive
                                ? "bg-amber-500/50"
                                : "bg-zinc-800"
                            }`}
                          />
                          <span
                            className={`text-[9px] font-mono ${
                              isCurrent
                                ? "text-amber-400 font-bold"
                                : isActive
                                ? "text-zinc-400"
                                : "text-zinc-400"
                            }`}
                          >
                            {clickNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] font-sans font-semibold tracking-wider text-zinc-400 pt-1">
                    <span>1 (FIRMEST)</span>
                    <span>14 (OPEN)</span>
                  </div>
                </div>

                {/* Sag & Setup Notes */}
                <div className="space-y-1 text-xs text-zinc-400">
                  <p>
                    <strong className="text-zinc-300">How to set:</strong> Turn dial fully clockwise until closed, then count {setup.reboundClicks} clicks counter-clockwise.
                  </p>
                  {setup.suspensionNotes.map((note, idx) => (
                    <p key={idx} className="flex items-start gap-1.5 text-zinc-300">
                      <span className="text-lime-400">•</span>
                      <span>{note}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Rear Shock Module */}
            {setup.hasRearSuspension && setup.shockPsi !== null && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
                      REAR SHOCK ABSORBER
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-200 mt-0.5">
                      {currentBike.shockModel}
                    </h3>
                  </div>
                  <span className="text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase">
                    Air Shock
                  </span>
                </div>

                {/* Dual Stats: Air Spring & Rebound (Strict 2-Column Grid) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block mb-1 truncate">
                      Air Pressure
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white leading-none">
                        <AnimatedNumber value={setup.shockPsi} precision={1} />
                      </span>
                      <span className="text-sm sm:text-base font-sans font-bold text-zinc-400 shrink-0">
                        PSI
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans mt-1.5 block truncate">
                      Target 28–30% Seated Sag
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block mb-1 flex items-center gap-1 truncate">
                      <RotateCw className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Rebound (LSR)</span>
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-amber-400 leading-none">
                        {setup.reboundClicks}
                      </span>
                      <span className="text-xs sm:text-sm font-sans font-bold text-zinc-400 shrink-0">
                        CLICKS OUT
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans mt-1.5 block truncate">
                      Counter-clockwise from closed
                    </span>
                  </div>
                </div>

                {/* Visual Stepper Gauge */}
                <div className="p-4 rounded-xl bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">
                      Shock Rebound Knob
                    </span>
                    <span className="text-amber-400 font-semibold font-sans">
                      <span className="font-mono font-bold">{setup.reboundClicks}</span> clicks out
                    </span>
                  </div>

                  <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1 pt-1">
                    {Array.from({ length: 14 }).map((_, index) => {
                      const clickNum = index + 1;
                      const isCurrent = clickNum === setup.reboundClicks;
                      const isActive = clickNum <= (setup.reboundClicks || 0);

                      return (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-full h-3.5 rounded-sm transition-all ${
                              isCurrent
                                ? "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                                : isActive
                                ? "bg-amber-500/50"
                                : "bg-zinc-800"
                            }`}
                          />
                          <span
                            className={`text-[9px] font-mono ${
                              isCurrent
                                ? "text-amber-400 font-bold"
                                : isActive
                                ? "text-zinc-400"
                                : "text-zinc-400"
                            }`}
                          >
                            {clickNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] font-sans font-semibold tracking-wider text-zinc-400 pt-1">
                    <span>1 (FIRMEST)</span>
                    <span>14 (OPEN)</span>
                  </div>
                </div>

                {/* Sag Notes */}
                <div className="space-y-1 text-xs text-zinc-400">
                  <p>
                    <strong className="text-zinc-300">How to set:</strong> Turn knob fully clockwise to closed, then count {setup.reboundClicks} clicks counter-clockwise for controlled chassis recovery.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Pre-Ride Checklist Footer (Borderless) */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
          <span>
            Calibrated for {displayBrand} {currentBike.model} at <span className="font-mono text-zinc-300">{profile.weight}</span> lbs riding weight.
          </span>
        </div>
        <div className="text-zinc-400 font-sans text-xs">
          Always check tire pressure cold before every ride.
        </div>
      </div>
    </div>
  );
}
