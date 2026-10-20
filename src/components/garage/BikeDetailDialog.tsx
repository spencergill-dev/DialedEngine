import { useState } from "react";
import { Bike as BikeIcon, Edit3, Trash2, Zap, Layers, Gauge, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Bike } from "@/types/cycling";
import {
  calculateFullBikeSetupPressures,
  type SetupCalculationResult,
} from "@/utils/pressureCalculator";

interface BikeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: Bike | null;
  isActive: boolean;
  canDelete: boolean;
  riderWeight?: number | null;
  onSelectActiveBike: (id: string) => void;
  onEdit: (bike: Bike) => void;
  onDelete: (bike: Bike) => void;
}

export function BikeDetailDialog({
  open,
  onOpenChange,
  bike,
  isActive,
  canDelete,
  riderWeight,
  onSelectActiveBike,
  onEdit,
  onDelete,
}: BikeDetailDialogProps) {
  const [calculatedSetup, setCalculatedSetup] = useState<SetupCalculationResult | null>(null);

  if (!bike) return null;

  const handleCalculate = () => {
    const res = calculateFullBikeSetupPressures({
      riderWeightLbs: riderWeight || 175,
      isEBike: bike.isEBike,
      frontTire: {
        width: bike.frontTire.width,
        casing: bike.frontTire.casing,
        hasInsert: bike.frontTire.hasInsert,
      },
      rearTire: {
        width: bike.rearTire.width,
        casing: bike.rearTire.casing,
        hasInsert: bike.rearTire.hasInsert,
      },
    });
    setCalculatedSetup(res);
  };

  const displayBrand =
    bike.brand === "Custom" ? bike.customBrand || "Custom" : bike.brand;

  const hasSuspension = bike.suspensionLayout
    ? bike.suspensionLayout !== "rigid"
    : bike.category === "full_suspension" || bike.category === "hardtail";
  const hasRearShock = bike.suspensionLayout
    ? bike.suspensionLayout === "full_suspension"
    : bike.category === "full_suspension";

  const disciplineLabel = (bike.discipline || bike.category || "mountain").replace("_", " ");
  const layoutLabel = (bike.suspensionLayout || (hasRearShock ? "full suspension" : hasSuspension ? "front suspension" : "rigid")).replace("_", " ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#111111] border border-zinc-800/50 text-zinc-100 p-6 space-y-6">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center shrink-0">
              <BikeIcon className="w-7 h-7 text-zinc-300" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-black tracking-tight text-white font-sans">
                  {displayBrand} {bike.model}
                </DialogTitle>
                {isActive && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 text-[10px] font-sans font-bold tracking-wider text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                    ACTIVE RIDE
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-zinc-400">
                <span className="font-mono">{bike.year}</span> • Size {bike.frameSize}
              </DialogDescription>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                  {disciplineLabel}
                </span>
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                  {layoutLabel}
                </span>
                {bike.isEBike && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-amber-300 flex items-center gap-1 font-sans font-semibold uppercase tracking-wider">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    E-BIKE
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Suspension Specs */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
            Suspension Platform
          </h4>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 space-y-2">
            {hasSuspension ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 font-sans text-[10px] uppercase font-semibold tracking-wider block">
                    Fork ({bike.forkTravel}mm)
                  </span>
                  <span className="text-zinc-200 font-medium">
                    {bike.forkModel || "Suspension Fork"}
                  </span>
                </div>
                {hasRearShock && (
                  <div>
                    <span className="text-zinc-500 font-sans text-[10px] uppercase font-semibold tracking-wider block">
                      Rear Shock {bike.rearWheelTravel ? `(${bike.rearWheelTravel}mm travel)` : ""}
                    </span>
                    <span className="text-zinc-200 font-medium">
                      {bike.shockModel || "Air Shock"}
                    </span>
                    {bike.rearShockStroke != null && (
                      <span className="text-zinc-400 font-mono text-[10px] block mt-0.5">
                        Stroke: {bike.rearShockStroke}mm
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">
                Rigid Frame & Fork Platform (Pressure calibrated strictly for pneumatic compliance)
              </p>
            )}
          </div>
        </div>

        {/* Wheels & Tires Specs */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
            Wheelset & Tire Setup
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Front Wheel */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 font-sans">Front Wheel</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {bike.frontTire.wheelSize}
                </span>
              </div>
              <div className="space-y-1 text-zinc-400 text-[11px]">
                {(bike.frontTire.manufacturer || bike.frontTire.model) && (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0">Tire</span>
                    <span className="text-zinc-200 font-medium truncate text-right">
                      {[bike.frontTire.manufacturer, bike.frontTire.model].filter(Boolean).join(" ")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Width</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {bike.frontTire.width.includes('"') || bike.frontTire.width.toLowerCase().includes('mm')
                      ? bike.frontTire.width
                      : `${bike.frontTire.width}"`}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0">Casing</span>
                  <span className="text-zinc-200 capitalize truncate text-right">
                    {bike.frontTire.casing.replace("_", " ")}
                  </span>
                </div>
                {bike.frontTire.compound && (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0">Compound</span>
                    <span className="text-zinc-200 truncate text-right">
                      {bike.frontTire.compound}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider ${
                      bike.frontTire.isTubeless
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {bike.frontTire.isTubeless ? "Tubeless" : "Tubes"}
                  </span>
                  {bike.frontTire.hasInsert && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider bg-zinc-800 text-lime-400 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      Insert
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Rear Wheel */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 font-sans">Rear Wheel</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {bike.rearTire.wheelSize}
                </span>
              </div>
              <div className="space-y-1 text-zinc-400 text-[11px]">
                {(bike.rearTire.manufacturer || bike.rearTire.model) && (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0">Tire</span>
                    <span className="text-zinc-200 font-medium truncate text-right">
                      {[bike.rearTire.manufacturer, bike.rearTire.model].filter(Boolean).join(" ")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Width</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {bike.rearTire.width.includes('"') || bike.rearTire.width.toLowerCase().includes('mm')
                      ? bike.rearTire.width
                      : `${bike.rearTire.width}"`}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0">Casing</span>
                  <span className="text-zinc-200 capitalize truncate text-right">
                    {bike.rearTire.casing.replace("_", " ")}
                  </span>
                </div>
                {bike.rearTire.compound && (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0">Compound</span>
                    <span className="text-zinc-200 truncate text-right">
                      {bike.rearTire.compound}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider ${
                      bike.rearTire.isTubeless
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {bike.rearTire.isTubeless ? "Tubeless" : "Tubes"}
                  </span>
                  {bike.rearTire.hasInsert && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider bg-zinc-800 text-lime-400 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      Insert
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Tire Pressure Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-sans font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-lime-400" />
              <span>Telemetry Pressure Setup</span>
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCalculate}
              className="h-7 text-xs text-lime-400 hover:text-lime-300 hover:bg-lime-950/40 gap-1.5 px-2 font-sans font-bold"
            >
              <Sparkles className="w-3 h-3" />
              <span>{calculatedSetup ? "Recalculate" : "Calculate Setup"}</span>
            </Button>
          </div>

          {calculatedSetup && (
            <div className="p-3.5 rounded-xl bg-lime-950/20 border border-lime-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Rider: {riderWeight || 175} lbs</span>
                <span>Base: {calculatedSetup.basePsi.toFixed(1)} PSI</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-sans uppercase font-bold tracking-wider block">
                    Recommended Front
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-mono font-black text-white">
                      {calculatedSetup.frontPsi.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono font-bold text-lime-400">PSI</span>
                    {calculatedSetup.frontPsi === 15.0 && (
                      <span className="text-[9px] font-sans font-semibold text-amber-400 px-1 rounded bg-amber-950/60">
                        FLOOR
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-sans uppercase font-bold tracking-wider block">
                    Recommended Rear
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-mono font-black text-white">
                      {calculatedSetup.rearPsi.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono font-bold text-lime-400">PSI</span>
                    {calculatedSetup.rearPsi === 15.0 && (
                      <span className="text-[9px] font-sans font-semibold text-amber-400 px-1 rounded bg-amber-950/60">
                        FLOOR
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/50">
          <div>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(bike);
                }}
                className="text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-900 h-9 px-3 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Bike</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectActiveBike(bike.id);
                  onOpenChange(false);
                }}
                className="flex-1 sm:flex-none text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 h-9"
              >
                Set as Active
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(bike);
              }}
              className="flex-1 sm:flex-none flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold h-9 px-4 rounded-xl border-none"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Bike</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
