import { useState } from "react";
import { Plus, ArrowLeft, Bike as BikeIcon, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BikeBuilderDialog } from "./BikeBuilderDialog";
import { DeleteBikeDialog } from "./DeleteBikeDialog";
import { BikeDetailDialog } from "./BikeDetailDialog";
import { toast } from "@/components/ui/sonner";
import type { Bike, RiderProfile } from "@/types/cycling";

interface GarageViewProps {
  profile: RiderProfile;
  bikes: Bike[];
  activeBikeId: string;
  onSelectActiveBike: (id: string) => void;
  onAddBike: (bikeData: Omit<Bike, "id">) => void;
  onUpdateBike: (id: string, bikeData: Partial<Bike>) => void;
  onDeleteBike: (id: string) => void;
  onBackToSetup: () => void;
}

export function GarageView({
  profile,
  bikes,
  activeBikeId,
  onSelectActiveBike,
  onAddBike,
  onUpdateBike,
  onDeleteBike,
  onBackToSetup,
}: GarageViewProps) {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [bikeToEdit, setBikeToEdit] = useState<Bike | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState<Bike | null>(null);

  const handleOpenAdd = () => {
    setBikeToEdit(null);
    setBuilderOpen(true);
  };

  const handleRowClick = (bike: Bike) => {
    setSelectedBikeId(bike.id);
    setDetailOpen(true);
  };

  const handleOpenEdit = (bike: Bike) => {
    setBikeToEdit(bike);
    setBuilderOpen(true);
  };

  const handleOpenDelete = (bike: Bike) => {
    setBikeToDelete(bike);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    const bike = bikes.find((b) => b.id === id);
    const bikeName = bike
      ? `${bike.brand === "Custom" ? bike.customBrand || "Custom" : bike.brand} ${bike.model}`
      : "Bike";

    onDeleteBike(id);
    setDeleteDialogOpen(false);
    setBikeToDelete(null);
    if (selectedBikeId === id) {
      setSelectedBikeId(null);
      setDetailOpen(false);
    }

    toast.error("Bike removed from Garage", {
      description: `${bikeName} was deleted from your hardware fleet.`,
    });
  };

  const handleSave = (bikeData: Omit<Bike, "id">) => {
    const brandName =
      bikeData.brand === "Custom"
        ? bikeData.customBrand || "Custom"
        : bikeData.brand;
    const fullBikeName = `${brandName} ${bikeData.model}`;

    if (bikeToEdit) {
      onUpdateBike(bikeToEdit.id, bikeData);
      toast.success("Bike configuration updated", {
        description: `Saved changes to ${fullBikeName}.`,
      });
    } else {
      onAddBike(bikeData);
      toast.success("Bike added to Garage", {
        description: `${fullBikeName} is now active and ready to calibrate.`,
      });
    }
  };

  const ownerName = profile.displayName?.trim() || "Spencer";
  const activeDetailBike = bikes.find((b) => b.id === selectedBikeId) || null;

  return (
    <div className="space-y-8 pb-12">
      {/* Garage Header (Borderless) */}
      <section className="pb-6 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToSetup}
            className="h-9 px-2.5 gap-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-lime-400" />
            <span>Setup</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              {ownerName}&apos;s Garage
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {bikes.length} {bikes.length === 1 ? "bicycle" : "bicycles"} calibrated in hardware fleet
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold shadow-lg transition-colors border-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bike</span>
        </Button>
      </section>

      {/* Compact Scannable Garage Bike Lineup (Master View) */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {bikes.map((bike) => {
            const isActive = bike.id === activeBikeId;
            const displayBrand =
              bike.brand === "Custom" ? bike.customBrand || "Custom" : bike.brand;

            return (
              <motion.div
                key={bike.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  height: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  overflow: "hidden",
                  transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
                }}
                transition={{ layout: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } }}
                onClick={() => handleRowClick(bike)}
                className="group flex items-center justify-between p-3.5 -mx-3.5 rounded-2xl cursor-pointer hover:bg-zinc-900/60 transition-colors border-b border-zinc-800/40 last:border-b-0"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Left: Bike Avatar rounded square w-12 h-12 bg-zinc-900 with Lucide Bike icon */}
                  <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shrink-0 group-hover:border-zinc-700 transition-colors">
                    <BikeIcon className="w-5 h-5 text-zinc-300" />
                    {isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.9)]" />
                    )}
                  </div>

                  {/* Center: Brand & Model, Year & Category badge */}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {displayBrand} {bike.model}
                      </h3>
                      {isActive && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-lime-400">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="font-mono text-[11px]">{bike.year}</span>
                      <span>•</span>
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                        {bike.category.replace("_", " ")}
                      </span>
                      {bike.isEBike && (
                        <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-amber-300 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          E-Bike
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Chevron Icon */}
                <div className="flex items-center gap-2 pl-3 shrink-0">
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bike Details Dialog (Detail View) */}
      <BikeDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        bike={activeDetailBike}
        isActive={activeDetailBike?.id === activeBikeId}
        canDelete={bikes.length > 1}
        onSelectActiveBike={(id) => {
          onSelectActiveBike(id);
          toast.success("Active ride updated", {
            description: `${activeDetailBike?.brand === "Custom" ? activeDetailBike?.customBrand || "Custom" : activeDetailBike?.brand} ${activeDetailBike?.model} is now your active ride.`,
          });
        }}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Add / Edit Bike Builder */}
      <BikeBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        bikeToEdit={bikeToEdit}
        onSave={handleSave}
      />

      {/* Delete Confirmation Alert */}
      <DeleteBikeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        bike={bikeToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
