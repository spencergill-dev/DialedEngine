import { useState } from "react";
import { Plus, Edit3, Trash2, Check, Zap } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BikeFormDialog } from "./BikeFormDialog";
import type { Bike } from "@/types/mountainBike";

interface BikeListProps {
  bikes: Bike[];
  activeBikeId: string;
  onSelectActiveBike: (id: string) => void;
  onAddBike: (bikeData: Omit<Bike, "id">) => void;
  onUpdateBike: (id: string, bikeData: Partial<Bike>) => void;
  onDeleteBike: (id: string) => void;
}

export function BikeList({
  bikes,
  activeBikeId,
  onSelectActiveBike,
  onAddBike,
  onUpdateBike,
  onDeleteBike,
}: BikeListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);

  const handleOpenAdd = () => {
    setEditingBike(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (bike: Bike) => {
    setEditingBike(bike);
    setDialogOpen(true);
  };

  const handleSave = (bikeData: Omit<Bike, "id">) => {
    if (editingBike) {
      onUpdateBike(editingBike.id, bikeData);
    } else {
      onAddBike(bikeData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Saved Bikes</h3>
          <p className="text-xs text-slate-400">
            {bikes.length} {bikes.length === 1 ? "bike" : "bikes"} in your garage lineup
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          size="sm"
          className="flex items-center gap-1.5 bg-slate-100 text-slate-900 hover:bg-slate-200 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Bike</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bikes.map((bike) => {
          const isActive = bike.id === activeBikeId;

          return (
            <Card
              key={bike.id}
              className={`border transition-all duration-200 ${
                isActive
                  ? "border-slate-600 bg-slate-900/80 shadow-md ring-1 ring-slate-600/40"
                  : "border-slate-800/60 bg-slate-900/40 hover:border-slate-700/60"
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-semibold text-slate-100">
                        {bike.name}
                      </CardTitle>
                      {bike.isEBike ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-slate-800 text-slate-300 border-slate-700 flex items-center gap-1 font-mono"
                        >
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          E-BIKE
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-slate-400 border-slate-800 font-mono"
                        >
                          ANALOG
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[10px] text-slate-400 border-slate-800 font-mono"
                      >
                        {bike.suspensionType}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-400">
                      {bike.forkModel} ({bike.forkTravel}mm)
                      {bike.suspensionType === "Full Suspension" &&
                        ` • ${bike.shockModel}`}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <Badge className="bg-slate-800 text-slate-200 border-slate-700 text-xs px-2.5 py-1 flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Active Bike
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectActiveBike(bike.id)}
                        className="text-xs border-slate-800 hover:bg-slate-800 text-slate-300"
                      >
                        Select for Ride
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(bike)}
                      className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      title="Edit Bike"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>

                    {bikes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteBike(bike.id)}
                        className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-slate-800"
                        title="Delete Bike"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/40 text-xs">
                  {/* Front Tire Summary */}
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/40 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>FRONT TIRE</span>
                      {bike.frontTire.hasInsert && (
                        <span className="text-[10px] text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          Insert Installed
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-slate-200">
                      {bike.frontTire.manufacturer} {bike.frontTire.model} {bike.frontTire.width}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {bike.frontTire.casing} Casing
                    </div>
                  </div>

                  {/* Rear Tire Summary */}
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/40 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>REAR TIRE</span>
                      {bike.rearTire.hasInsert && (
                        <span className="text-[10px] text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          Insert Installed
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-slate-200">
                      {bike.rearTire.manufacturer} {bike.rearTire.model} {bike.rearTire.width}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {bike.rearTire.casing} Casing
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BikeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bikeToEdit={editingBike}
        onSave={handleSave}
      />
    </div>
  );
}
