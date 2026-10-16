import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { POPULAR_FORKS, POPULAR_SHOCKS } from "@/data/suspensionPresets";
import type { Bike, TireSetup, TireCasing } from "@/types/mountainBike";

interface BikeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikeToEdit?: Bike | null;
  onSave: (bikeData: Omit<Bike, "id">) => void;
}

const DEFAULT_FRONT_TIRE: TireSetup = {
  manufacturer: "Maxxis",
  model: "Assegai",
  width: "2.5 WT",
  casing: "standard",
  hasInsert: false,
};

const DEFAULT_REAR_TIRE: TireSetup = {
  manufacturer: "Maxxis",
  model: "Minion DHR II",
  width: "2.4 WT",
  casing: "heavy",
  hasInsert: true,
};

const TIRE_MANUFACTURERS = [
  "Maxxis",
  "Schwalbe",
  "Continental",
  "Specialized",
  "Michelin",
  "Bontrager",
  "Pirelli",
  "WTB",
];

const TIRE_WIDTHS = ["2.3\"", "2.4\"", "2.5\" WT", "2.6\""];

export function BikeFormDialog({
  open,
  onOpenChange,
  bikeToEdit,
  onSave,
}: BikeFormDialogProps) {
  const [name, setName] = useState("");
  const [isEBike, setIsEBike] = useState(false);
  const [suspensionType, setSuspensionType] = useState<"Full Suspension" | "Hardtail">("Full Suspension");
  const [forkModel, setForkModel] = useState("Fox 38 Factory Grip2");
  const [forkTravel, setForkTravel] = useState(170);
  const [shockModel, setShockModel] = useState("Fox Float X2 Factory");

  const [frontTire, setFrontTire] = useState<TireSetup>(DEFAULT_FRONT_TIRE);
  const [rearTire, setRearTire] = useState<TireSetup>(DEFAULT_REAR_TIRE);

  useEffect(() => {
    if (bikeToEdit) {
      setName(bikeToEdit.name);
      setIsEBike(bikeToEdit.isEBike);
      setSuspensionType(bikeToEdit.suspensionType);
      setForkModel(bikeToEdit.forkModel);
      setForkTravel(bikeToEdit.forkTravel);
      setShockModel(bikeToEdit.shockModel);
      setFrontTire(bikeToEdit.frontTire);
      setRearTire(bikeToEdit.rearTire);
    } else {
      setName("");
      setIsEBike(false);
      setSuspensionType("Full Suspension");
      setForkModel("Fox 38 Factory Grip2");
      setForkTravel(170);
      setShockModel("Fox Float X2 Factory");
      setFrontTire(DEFAULT_FRONT_TIRE);
      setRearTire(DEFAULT_REAR_TIRE);
    }
  }, [bikeToEdit, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      isEBike,
      suspensionType,
      forkModel: forkModel.trim() || "Suspension Fork",
      forkTravel: Number(forkTravel) || 160,
      shockModel: suspensionType === "Hardtail" ? "N/A" : (shockModel.trim() || "Rear Shock"),
      frontTire,
      rearTire,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-100">
              {bikeToEdit ? "Edit Bike Setup" : "Add Bike to Garage"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure your bike specifications. The setup calculator will tailor exact tire and suspension pressures based on these components.
            </DialogDescription>
          </DialogHeader>

          {/* Core Bike Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bike-name" className="text-xs text-slate-300">
                  Bike Name
                </Label>
                <Input
                  id="bike-name"
                  placeholder="e.g. Santa Cruz Megatower C"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Suspension Type</Label>
                <Select
                  value={suspensionType}
                  onValueChange={(val: "Full Suspension" | "Hardtail") =>
                    setSuspensionType(val)
                  }
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="Full Suspension">Full Suspension</SelectItem>
                    <SelectItem value="Hardtail">Hardtail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* E-Bike Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="ebike-switch" className="text-xs text-slate-200 cursor-pointer">
                  E-Bike Motor & Battery
                </Label>
                <p className="text-[11px] text-slate-400">
                  Applies a +2.5 PSI tire pressure offset to support heavier frame and battery mass.
                </p>
              </div>
              <Switch
                id="ebike-switch"
                checked={isEBike}
                onCheckedChange={setIsEBike}
              />
            </div>
          </div>

          {/* Front Tire Setup */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Front Tire Setup
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Brand</Label>
                <Select
                  value={frontTire.manufacturer}
                  onValueChange={(val) =>
                    setFrontTire((prev) => ({ ...prev, manufacturer: val }))
                  }
                >
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {TIRE_MANUFACTURERS.map((m) => (
                      <SelectItem key={m} value={m} className="text-base md:text-sm">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Model</Label>
                <Input
                  value={frontTire.model}
                  onChange={(e) =>
                    setFrontTire((prev) => ({ ...prev, model: e.target.value }))
                  }
                  placeholder="e.g. Assegai"
                  className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Width</Label>
                <Select
                  value={frontTire.width}
                  onValueChange={(val) =>
                    setFrontTire((prev) => ({ ...prev, width: val }))
                  }
                >
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {TIRE_WIDTHS.map((w) => (
                      <SelectItem key={w} value={w} className="text-base md:text-sm">
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Casing</Label>
                <Select
                  value={frontTire.casing}
                  onValueChange={(val: TireCasing) =>
                    setFrontTire((prev) => ({ ...prev, casing: val }))
                  }
                >
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="light" className="text-base md:text-sm">
                      Light (EXO / Trail)
                    </SelectItem>
                    <SelectItem value="standard" className="text-base md:text-sm">
                      Standard (EXO+ / Enduro)
                    </SelectItem>
                    <SelectItem value="heavy" className="text-base md:text-sm">
                      Heavy / DH (DoubleDown)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <Label htmlFor="front-insert" className="text-xs text-slate-300 cursor-pointer">
                Front Tire Insert Installed (CushCore / Tubolight)
              </Label>
              <Switch
                id="front-insert"
                checked={frontTire.hasInsert}
                onCheckedChange={(val) =>
                  setFrontTire((prev) => ({ ...prev, hasInsert: val }))
                }
              />
            </div>
          </div>

          {/* Rear Tire Setup */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Rear Tire Setup
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Brand</Label>
                <Select
                  value={rearTire.manufacturer}
                  onValueChange={(val) =>
                    setRearTire((prev) => ({ ...prev, manufacturer: val }))
                  }
                >
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {TIRE_MANUFACTURERS.map((m) => (
                      <SelectItem key={m} value={m} className="text-base md:text-sm">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Model</Label>
                <Input
                  value={rearTire.model}
                  onChange={(e) =>
                    setRearTire((prev) => ({ ...prev, model: e.target.value }))
                  }
                  placeholder="e.g. Minion DHR II"
                  className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Width</Label>
                <Select
                  value={rearTire.width}
                  onValueChange={(val) =>
                    setRearTire((prev) => ({ ...prev, width: val }))
                  }
                >
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {TIRE_WIDTHS.map((w) => (
                      <SelectItem key={w} value={w} className="text-base md:text-sm">
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Casing</Label>
                <Select
                  value={rearTire.casing}
                  onValueChange={(val: TireCasing) =>
                    setRearTire((prev) => ({ ...prev, casing: val }))
                  }
                >
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="light" className="text-base md:text-sm">
                      Light (EXO / Trail)
                    </SelectItem>
                    <SelectItem value="standard" className="text-base md:text-sm">
                      Standard (EXO+ / Enduro)
                    </SelectItem>
                    <SelectItem value="heavy" className="text-base md:text-sm">
                      Heavy / DH (DoubleDown)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <Label htmlFor="rear-insert" className="text-xs text-slate-300 cursor-pointer">
                Rear Tire Insert Installed (CushCore / Tubolight)
              </Label>
              <Switch
                id="rear-insert"
                checked={rearTire.hasInsert}
                onCheckedChange={(val) =>
                  setRearTire((prev) => ({ ...prev, hasInsert: val }))
                }
              />
            </div>
          </div>

          {/* Suspension Setup */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Suspension Components
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Fork Model</Label>
                <Combobox
                  value={forkModel}
                  onChange={setForkModel}
                  options={POPULAR_FORKS}
                  placeholder="e.g. Fox 38 Factory"
                  className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Fork Travel</Label>
                <Select
                  value={String(forkTravel)}
                  onValueChange={(val) => setForkTravel(Number(val))}
                >
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {[120, 130, 140, 150, 160, 170, 180].map((t) => (
                      <SelectItem key={t} value={String(t)} className="text-base md:text-sm">
                        {t} mm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {suspensionType === "Full Suspension" && (
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400">Rear Shock Model</Label>
                  <Combobox
                    value={shockModel}
                    onChange={setShockModel}
                    options={POPULAR_SHOCKS}
                    placeholder="e.g. Fox Float X2"
                    className="h-9 bg-slate-950 border-slate-800 text-base md:text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs border-slate-800"
            >
              Cancel
            </Button>
            <Button type="submit" className="text-xs bg-slate-100 text-slate-900 hover:bg-slate-200">
              {bikeToEdit ? "Save Changes" : "Add Bike"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
