import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Bike, RiderProfile } from "@/types/cycling";
import type { useDialedMath } from "@/hooks/useDialedMath";

interface CalculationBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: Bike;
  profile: RiderProfile;
  initialTab?: "front" | "rear";
  setup: ReturnType<typeof useDialedMath>;
}

export function CalculationBreakdownDialog({
  open,
  onOpenChange,
  bike,
  profile,
  initialTab = "front",
  setup,
}: CalculationBreakdownDialogProps) {
  const [activeTab, setActiveTab] = useState<"front" | "rear">(initialTab);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const tire = activeTab === "front" ? bike.frontTire : bike.rearTire;
  const targetPsi = activeTab === "front" ? setup.frontPsi : setup.rearPsi;
  const modifiers = activeTab === "front" ? setup.frontModifiers : setup.rearModifiers;
  const barValue = (targetPsi * 0.0689476).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#111111] border border-zinc-800 text-zinc-100 p-6 sm:p-7 max-h-[88vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 pb-2 text-left">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)] shrink-0" />
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
              TELEMETRY MATH ENGINE
            </span>
          </div>
          <DialogTitle className="text-xl font-black text-white font-sans tracking-tight">
            Calculation Breakdown
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Deterministic pressure equations calibrated for rider weight, tire casing, volume, and active ride conditions.
          </DialogDescription>
        </DialogHeader>

        {/* Wheel Selection Segmented Pill */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900 rounded-xl my-1">
          <button
            type="button"
            onClick={() => setActiveTab("front")}
            className={`py-2 px-3 text-xs font-sans font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "front"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>FRONT TIRE</span>
            <span className="font-mono text-[11px] text-lime-400">
              {setup.frontPsi.toFixed(1)} PSI
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rear")}
            className={`py-2 px-3 text-xs font-sans font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "rear"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>REAR TIRE</span>
            <span className="font-mono text-[11px] text-lime-400">
              {setup.rearPsi.toFixed(1)} PSI
            </span>
          </button>
        </div>

        {/* Selected Wheel Header Card */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400">
                {activeTab === "front" ? "FRONT WHEEL SETUP" : "REAR WHEEL SETUP"}
              </span>
              <h4 className="text-sm font-bold text-white font-sans">
                {tire.manufacturer} {tire.model} {tire.width}
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                {tire.isTubeless ? "Tubeless" : "Tubes"}
              </span>
              {tire.hasInsert && (
                <span className="text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">
                  Insert
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1 border-t border-zinc-800/60">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {targetPsi.toFixed(1)}
            </span>
            <span className="text-sm font-sans font-bold text-zinc-400">
              PSI
            </span>
            <span className="text-xs font-mono text-zinc-500 ml-1">
              ({barValue} bar)
            </span>
            <span className="ml-auto text-[11px] text-zinc-400 font-sans">
              Calibrated for <span className="font-mono font-bold text-zinc-200">{profile.weight} lbs</span>
            </span>
          </div>
        </div>

        {/* Active Setup Modifiers Ledger */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-300">
              Active Setup Modifiers
            </span>
            <span className="text-[10px] font-sans text-zinc-400">
              {modifiers.length} adjustments applied
            </span>
          </div>

          {modifiers.length === 0 ? (
            <div className="p-3.5 rounded-lg bg-zinc-900/30 border border-zinc-800/40 text-xs text-zinc-400 italic">
              Standard baseline pressure calibrated for discipline and rider mass without additional active offsets.
            </div>
          ) : (
            <ul className="space-y-2">
              {modifiers.map((mod, idx) => {
                const isPositive = mod.delta > 0;
                return (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-3"
                  >
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                        isPositive
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                      }`}
                    >
                      {isPositive ? `+${mod.delta.toFixed(1)}` : mod.delta.toFixed(1)} PSI
                    </span>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-xs font-sans font-bold text-zinc-200 block">
                        {mod.label}
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Chassis: {bike.category.replace("_", " ")}</span>
          <span className="flex items-center gap-1 text-lime-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal Traction Sweet Spot</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
