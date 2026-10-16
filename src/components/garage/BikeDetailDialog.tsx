import { Bike as BikeIcon, Edit3, Trash2, Zap, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Bike } from "@/types/cycling";

interface BikeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: Bike | null;
  isActive: boolean;
  canDelete: boolean;
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
  onSelectActiveBike,
  onEdit,
  onDelete,
}: BikeDetailDialogProps) {
  if (!bike) return null;

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
                      Rear Shock
                    </span>
                    <span className="text-zinc-200 font-medium">
                      {bike.shockModel || "Air Shock"}
                    </span>
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
                <div className="flex justify-between">
                  <span>Width</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {bike.frontTire.width}&quot;
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Casing</span>
                  <span className="text-zinc-200 capitalize">
                    {bike.frontTire.casing.replace("_", " ")}
                  </span>
                </div>
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
                <div className="flex justify-between">
                  <span>Width</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {bike.rearTire.width}&quot;
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Casing</span>
                  <span className="text-zinc-200 capitalize">
                    {bike.rearTire.casing.replace("_", " ")}
                  </span>
                </div>
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
