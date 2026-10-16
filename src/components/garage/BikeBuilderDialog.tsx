import { useState, useEffect, type FormEvent } from "react";
import { Camera } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Combobox } from "@/components/ui/combobox";
import { POPULAR_FORKS, POPULAR_SHOCKS } from "@/data/suspensionPresets";
import type {
  Bike,
  BikeCategory,
  WheelSize,
  TireCasing,
  TireSetup,
} from "@/types/cycling";

interface BikeBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikeToEdit: Bike | null;
  onSave: (bikeData: Omit<Bike, "id">) => void;
}

const POPULAR_BRANDS = [
  "Santa Cruz",
  "Specialized",
  "Trek",
  "Canyon",
  "Giant",
  "Yeti",
  "Cannondale",
  "Cervelo",
  "Pivot",
  "Orbea",
  "Custom",
];

const MODEL_YEARS = [
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
  "2014 & Older",
];

const WHEEL_SIZES: WheelSize[] = ["29\"", "27.5\"", "700c", "650b", "26\""];
const FRAME_SIZES = ["XS", "S", "M", "L", "XL", "S2", "S3", "S4", "S5", "52cm", "54cm", "56cm", "58cm", "60cm"];

const INCH_TIRE_WIDTHS = [
  "2.1\"",
  "2.2\"",
  "2.3\"",
  "2.4\"",
  "2.5\"",
  "2.5\" WT",
  "2.6\"",
  "2.8\"",
  "3.0\"",
  "3.8\"",
  "4.0\"",
  "4.5\"",
  "4.8\"",
];

const MM_TIRE_WIDTHS = [
  "25mm",
  "28mm",
  "30mm",
  "32mm",
  "35mm",
  "38mm",
  "40mm",
  "42mm",
  "45mm",
  "47mm",
  "50mm",
];

function getTireWidthsForWheelSize(wheelSize: WheelSize): string[] {
  if (wheelSize === "700c" || wheelSize === "650b") {
    return MM_TIRE_WIDTHS;
  }
  return INCH_TIRE_WIDTHS;
}

const DEFAULT_FRONT_TIRE: TireSetup = {
  wheelSize: "29\"",
  manufacturer: "Maxxis",
  model: "Assegai",
  width: "2.5\" WT",
  casing: "standard",
  hasInsert: false,
  isTubeless: true,
};

const DEFAULT_REAR_TIRE: TireSetup = {
  wheelSize: "29\"",
  manufacturer: "Maxxis",
  model: "Minion DHR II",
  width: "2.4\" WT",
  casing: "heavy",
  hasInsert: true,
  isTubeless: true,
};

export function BikeBuilderDialog({
  open,
  onOpenChange,
  bikeToEdit,
  onSave,
}: BikeBuilderDialogProps) {
  const [brand, setBrand] = useState("Santa Cruz");
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>("2024");
  const [frameSize, setFrameSize] = useState("L");
  const [category, setCategory] = useState<BikeCategory>("full_suspension");
  const [isEBike, setIsEBike] = useState(false);

  const [forkModel, setForkModel] = useState("Fox 38 Factory Grip2");
  const [forkTravel, setForkTravel] = useState(170);
  const [shockModel, setShockModel] = useState("Fox Float X2 Factory");

  const [frontTire, setFrontTire] = useState<TireSetup>(DEFAULT_FRONT_TIRE);
  const [rearTire, setRearTire] = useState<TireSetup>(DEFAULT_REAR_TIRE);

  useEffect(() => {
    if (bikeToEdit) {
      setBrand(bikeToEdit.brand);
      setCustomBrand(bikeToEdit.customBrand || "");
      setModel(bikeToEdit.model);
      setYear(String(bikeToEdit.year || "2024"));
      setFrameSize(bikeToEdit.frameSize || "L");
      setCategory(bikeToEdit.category);
      setIsEBike(bikeToEdit.isEBike);
      setForkModel(bikeToEdit.forkModel);
      setForkTravel(bikeToEdit.forkTravel);
      setShockModel(bikeToEdit.shockModel);
      setFrontTire(bikeToEdit.frontTire);
      setRearTire(bikeToEdit.rearTire);
    } else {
      setBrand("Santa Cruz");
      setCustomBrand("");
      setModel("");
      setYear("2024");
      setFrameSize("L");
      setCategory("full_suspension");
      setIsEBike(false);
      setForkModel("Fox 38 Factory Grip2");
      setForkTravel(170);
      setShockModel("Fox Float X2 Factory");
      setFrontTire(DEFAULT_FRONT_TIRE);
      setRearTire(DEFAULT_REAR_TIRE);
    }
  }, [bikeToEdit, open]);

  // Adjust defaults when category switches
  const handleCategoryChange = (newCat: BikeCategory) => {
    setCategory(newCat);
    if (newCat === "road") {
      setFrontTire((prev) => ({
        ...prev,
        wheelSize: "700c",
        width: "28mm",
        casing: "light",
      }));
      setRearTire((prev) => ({
        ...prev,
        wheelSize: "700c",
        width: "28mm",
        casing: "light",
      }));
      setForkTravel(0);
      setForkModel("Rigid Carbon Fork");
      setShockModel("Rigid Frame");
    } else if (newCat === "gravel") {
      setFrontTire((prev) => ({
        ...prev,
        wheelSize: "700c",
        width: "42mm",
        casing: "standard",
      }));
      setRearTire((prev) => ({
        ...prev,
        wheelSize: "700c",
        width: "42mm",
        casing: "standard",
      }));
      setForkTravel(0);
      setForkModel("Rigid Carbon Fork");
      setShockModel("Rigid Frame");
    } else if (newCat === "fat_bike") {
      setFrontTire((prev) => ({
        ...prev,
        wheelSize: "26\"",
        width: "4.5\"",
        casing: "light",
      }));
      setRearTire((prev) => ({
        ...prev,
        wheelSize: "26\"",
        width: "4.5\"",
        casing: "light",
      }));
      setForkTravel(0);
      setForkModel("Rigid Fat Fork");
      setShockModel("Rigid Frame");
    } else if (newCat === "hardtail") {
      setFrontTire((prev) => ({
        ...prev,
        wheelSize: "29\"",
        width: "2.4\"",
        casing: "standard",
      }));
      setRearTire((prev) => ({
        ...prev,
        wheelSize: "29\"",
        width: "2.4\"",
        casing: "standard",
      }));
      setForkTravel(130);
      setForkModel("RockShox Pike 130mm");
      setShockModel("Hardtail Frame");
    } else {
      // Full Suspension MTB
      setFrontTire((prev) => ({
        ...prev,
        wheelSize: "29\"",
        width: "2.5\" WT",
        casing: "standard",
      }));
      setRearTire((prev) => ({
        ...prev,
        wheelSize: "29\"",
        width: "2.4\" WT",
        casing: "heavy",
      }));
      setForkTravel(160);
      setForkModel("Fox 38 Factory 160mm");
      setShockModel("Fox Float X2");
    }
  };

  const handleFrontWheelSizeChange = (val: WheelSize) => {
    setFrontTire((prev) => {
      if (prev.wheelSize === val) return prev;
      return { ...prev, wheelSize: val, width: "" };
    });
  };

  const handleRearWheelSizeChange = (val: WheelSize) => {
    setRearTire((prev) => {
      if (prev.wheelSize === val) return prev;
      return { ...prev, wheelSize: val, width: "" };
    });
  };

  const frontWidthOptions = getTireWidthsForWheelSize(frontTire.wheelSize);
  const rearWidthOptions = getTireWidthsForWheelSize(rearTire.wheelSize);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!model.trim()) return;

    const resolvedFrontWidth =
      frontTire.width ||
      (frontTire.wheelSize === "700c" || frontTire.wheelSize === "650b" ? "40mm" : "2.4\"");
    const resolvedRearWidth =
      rearTire.width ||
      (rearTire.wheelSize === "700c" || rearTire.wheelSize === "650b" ? "40mm" : "2.4\"");

    onSave({
      brand,
      customBrand: brand === "Custom" ? customBrand.trim() : undefined,
      model: model.trim(),
      year,
      frameSize,
      category,
      isEBike,
      forkModel: forkModel.trim() || "Fork",
      forkTravel: Number(forkTravel) || 0,
      shockModel: category === "full_suspension" ? shockModel.trim() : "Rigid Frame",
      frontTire: {
        ...frontTire,
        width: resolvedFrontWidth,
      },
      rearTire: {
        ...rearTire,
        width: resolvedRearWidth,
      },
    });
    onOpenChange(false);
  };

  const hasSuspensionFork =
    category === "full_suspension" || category === "hardtail";
  const hasRearShock = category === "full_suspension";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#111111] border border-zinc-800/50 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-100">
              {bikeToEdit ? "Edit Bike Setup" : "Add Bike to Garage"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Define your bicycle hardware specs. Dialed uses these exact parameters to generate deterministic pressure recommendations.
            </DialogDescription>
          </DialogHeader>

          {/* Photo Upload Placeholder */}
          <div className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-center transition-colors bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer group">
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 group-hover:bg-zinc-800 flex items-center justify-center transition-colors">
                <Camera className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
              </div>
              <p className="text-xs font-semibold text-zinc-200 mt-1">Upload Bike Photo</p>
              <p className="text-[11px] text-zinc-400 font-sans">PNG, JPG, or WEBP up to 10MB (Coming soon)</p>
            </div>
          </div>

          {/* 1. Core Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              1. Core Details & Discipline
            </h4>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Bicycle Category</Label>
              <ToggleGroup
                type="single"
                value={category}
                onValueChange={(val) => {
                  if (val) handleCategoryChange(val as BikeCategory);
                }}
                className="w-full grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-zinc-900/80 rounded-xl ring-1 ring-white/5"
              >
                <ToggleGroupItem
                  value="full_suspension"
                  className="py-1.5 px-2 text-xs font-medium data-[state=on]:bg-zinc-800 data-[state=on]:text-zinc-100"
                >
                  Full Susp
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="hardtail"
                  className="py-1.5 px-2 text-xs font-medium data-[state=on]:bg-zinc-800 data-[state=on]:text-zinc-100"
                >
                  Hardtail
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="gravel"
                  className="py-1.5 px-2 text-xs font-medium data-[state=on]:bg-zinc-800 data-[state=on]:text-zinc-100"
                >
                  Gravel
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="road"
                  className="py-1.5 px-2 text-xs font-medium data-[state=on]:bg-zinc-800 data-[state=on]:text-zinc-100"
                >
                  Road
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="fat_bike"
                  className="py-1.5 px-2 text-xs font-medium data-[state=on]:bg-zinc-800 data-[state=on]:text-zinc-100"
                >
                  Fat Bike
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Brand, Custom Fallback, Model */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Brand</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="bg-zinc-900 ring-1 ring-white/10 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                    {POPULAR_BRANDS.map((b) => (
                      <SelectItem key={b} value={b} className="text-base md:text-sm">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {brand === "Custom" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="custom-brand" className="text-xs text-zinc-300">
                    Custom Brand Name
                  </Label>
                  <Input
                    id="custom-brand"
                    placeholder="e.g. Allied, Transition"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    required
                    className="bg-zinc-900 ring-1 ring-white/10 text-base md:text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="model-name" className="text-xs text-zinc-300">
                    Model
                  </Label>
                  <Input
                    id="model-name"
                    placeholder="e.g. Megatower, Grizl"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    className="bg-zinc-900 ring-1 ring-white/10 text-base md:text-sm"
                  />
                </div>
              )}

              {brand === "Custom" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="model-name-custom" className="text-xs text-zinc-300">
                    Model
                  </Label>
                  <Input
                    id="model-name-custom"
                    placeholder="e.g. Repeater"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    className="bg-zinc-900 ring-1 ring-white/10 text-base md:text-sm"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="bg-zinc-900 ring-1 ring-white/10 text-base md:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                        {MODEL_YEARS.map((y) => (
                          <SelectItem key={y} value={y} className="text-base md:text-sm">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Size</Label>
                    <Select value={frameSize} onValueChange={setFrameSize}>
                      <SelectTrigger className="bg-zinc-900 ring-1 ring-white/10 text-base md:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                        {FRAME_SIZES.map((s) => (
                          <SelectItem key={s} value={s} className="text-base md:text-sm">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* E-Bike Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="ebike-mode" className="text-xs text-zinc-200 cursor-pointer font-semibold">
                  E-Bike Motor & Battery
                </Label>
                <p className="text-[11px] text-zinc-500">
                  Adds a +2.5 PSI offset to accommodate motor and battery chassis mass.
                </p>
              </div>
              <Switch
                id="ebike-mode"
                checked={isEBike}
                onCheckedChange={setIsEBike}
              />
            </div>
          </div>

          {/* 2. Wheels & Tires (Independent Front & Rear) */}
          <div className="space-y-4 pt-3 border-t border-white/5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              2. Wheels & Tires (Independent Front / Rear)
            </h4>

            {/* Front Tire Setup */}
            <div className="p-4 rounded-xl bg-zinc-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Front Wheel & Tire
                </span>
                <span className="text-[10px] text-zinc-400 font-sans font-semibold tracking-wider uppercase">
                  {frontTire.isTubeless ? "TUBELESS" : "INNER TUBES (+5.0 PSI)"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Wheel Size</Label>
                  <Select
                    value={frontTire.wheelSize}
                    onValueChange={handleFrontWheelSizeChange}
                  >
                    <SelectTrigger className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                      {WHEEL_SIZES.map((w) => (
                        <SelectItem key={w} value={w} className="text-base md:text-sm">
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Tire Model</Label>
                  <Input
                    value={frontTire.model}
                    onChange={(e) =>
                      setFrontTire((prev) => ({ ...prev, model: e.target.value }))
                    }
                    placeholder="e.g. Assegai"
                    className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Tire Width</Label>
                  <Select
                    value={frontTire.width}
                    onValueChange={(val) =>
                      setFrontTire((prev) => ({ ...prev, width: val }))
                    }
                  >
                    <SelectTrigger className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm">
                      <SelectValue placeholder="Select width" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                      {frontWidthOptions.map((w) => (
                        <SelectItem key={w} value={w} className="text-base md:text-sm">
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Casing</Label>
                  <Select
                    value={frontTire.casing}
                    onValueChange={(val: TireCasing) =>
                      setFrontTire((prev) => ({ ...prev, casing: val }))
                    }
                  >
                    <SelectTrigger className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                      <SelectItem value="light" className="text-base md:text-sm">
                        Light (Trail/Road)
                      </SelectItem>
                      <SelectItem value="standard" className="text-base md:text-sm">
                        Standard (Enduro/All-Rd)
                      </SelectItem>
                      <SelectItem value="heavy" className="text-base md:text-sm">
                        Heavy / DH (DoubleDown)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Front Switches: Tubeless vs Tubes & Insert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 ring-1 ring-white/5">
                  <div className="space-y-0.5 pr-2">
                    <Label htmlFor="front-tubeless" className="text-[11px] text-zinc-300 cursor-pointer font-medium">
                      Tubeless Setup
                    </Label>
                    <p className="text-[10px] text-zinc-500">
                      {frontTire.isTubeless
                        ? "Optimal low pressure compliance"
                        : "Inner tubes (+5.0 PSI penalty applied)"}
                    </p>
                  </div>
                  <Switch
                    id="front-tubeless"
                    checked={frontTire.isTubeless}
                    onCheckedChange={(val) =>
                      setFrontTire((prev) => ({ ...prev, isTubeless: val }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 ring-1 ring-white/5">
                  <div className="space-y-0.5 pr-2">
                    <Label htmlFor="front-insert-switch" className="text-[11px] text-zinc-300 cursor-pointer font-medium">
                      Tire Insert (CushCore)
                    </Label>
                    <p className="text-[10px] text-zinc-500">
                      {frontTire.hasInsert
                        ? "-2.0 PSI rim defense active"
                        : "Standard casing volume"}
                    </p>
                  </div>
                  <Switch
                    id="front-insert-switch"
                    checked={frontTire.hasInsert}
                    onCheckedChange={(val) =>
                      setFrontTire((prev) => ({ ...prev, hasInsert: val }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Rear Tire Setup */}
            <div className="p-4 rounded-xl bg-zinc-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Rear Wheel & Tire
                </span>
                <span className="text-[10px] text-zinc-400 font-sans font-semibold tracking-wider uppercase">
                  {rearTire.isTubeless ? "TUBELESS" : "INNER TUBES (+5.0 PSI)"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Wheel Size</Label>
                  <Select
                    value={rearTire.wheelSize}
                    onValueChange={handleRearWheelSizeChange}
                  >
                    <SelectTrigger className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                      {WHEEL_SIZES.map((w) => (
                        <SelectItem key={w} value={w} className="text-base md:text-sm">
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Tire Model</Label>
                  <Input
                    value={rearTire.model}
                    onChange={(e) =>
                      setRearTire((prev) => ({ ...prev, model: e.target.value }))
                    }
                    placeholder="e.g. Minion DHR II"
                    className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Tire Width</Label>
                  <Select
                    value={rearTire.width}
                    onValueChange={(val) =>
                      setRearTire((prev) => ({ ...prev, width: val }))
                    }
                  >
                    <SelectTrigger className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm">
                      <SelectValue placeholder="Select width" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                      {rearWidthOptions.map((w) => (
                        <SelectItem key={w} value={w} className="text-base md:text-sm">
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Casing</Label>
                  <Select
                    value={rearTire.casing}
                    onValueChange={(val: TireCasing) =>
                      setRearTire((prev) => ({ ...prev, casing: val }))
                    }
                  >
                    <SelectTrigger className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                      <SelectItem value="light" className="text-base md:text-sm">
                        Light (Trail/Road)
                      </SelectItem>
                      <SelectItem value="standard" className="text-base md:text-sm">
                        Standard (Enduro/All-Rd)
                      </SelectItem>
                      <SelectItem value="heavy" className="text-base md:text-sm">
                        Heavy / DH (DoubleDown)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rear Switches: Tubeless vs Tubes & Insert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 ring-1 ring-white/5">
                  <div className="space-y-0.5 pr-2">
                    <Label htmlFor="rear-tubeless" className="text-[11px] text-zinc-300 cursor-pointer font-medium">
                      Tubeless Setup
                    </Label>
                    <p className="text-[10px] text-zinc-500">
                      {rearTire.isTubeless
                        ? "Optimal low pressure compliance"
                        : "Inner tubes (+5.0 PSI penalty applied)"}
                    </p>
                  </div>
                  <Switch
                    id="rear-tubeless"
                    checked={rearTire.isTubeless}
                    onCheckedChange={(val) =>
                      setRearTire((prev) => ({ ...prev, isTubeless: val }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 ring-1 ring-white/5">
                  <div className="space-y-0.5 pr-2">
                    <Label htmlFor="rear-insert-switch" className="text-[11px] text-zinc-300 cursor-pointer font-medium">
                      Tire Insert (CushCore)
                    </Label>
                    <p className="text-[10px] text-zinc-500">
                      {rearTire.hasInsert
                        ? "-2.0 PSI rim defense active"
                        : "Standard casing volume"}
                    </p>
                  </div>
                  <Switch
                    id="rear-insert-switch"
                    checked={rearTire.hasInsert}
                    onCheckedChange={(val) =>
                      setRearTire((prev) => ({ ...prev, hasInsert: val }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Suspension Components (Conditional) */}
          {hasSuspensionFork && (
            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                3. Suspension Setup
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Fork Model</Label>
                  <Combobox
                    value={forkModel}
                    onChange={setForkModel}
                    options={POPULAR_FORKS}
                    placeholder="e.g. Fox 38 Factory"
                    className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-zinc-400">Fork Travel</Label>
                  <Select
                    value={String(forkTravel)}
                    onValueChange={(val) => setForkTravel(Number(val))}
                  >
                    <SelectTrigger className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none ring-1 ring-white/10">
                      {[100, 110, 120, 130, 140, 150, 160, 170, 180, 200].map(
                        (t) => (
                          <SelectItem key={t} value={String(t)} className="text-base md:text-sm">
                            {t} mm
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {hasRearShock && (
                  <div className="space-y-1">
                    <Label className="text-[11px] text-zinc-400">Rear Shock</Label>
                    <Combobox
                      value={shockModel}
                      onChange={setShockModel}
                      options={POPULAR_SHOCKS}
                      placeholder="e.g. Fox Float X2"
                      className="h-9 bg-zinc-950 ring-1 ring-white/10 text-base md:text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs bg-zinc-900 text-zinc-300 hover:text-white border-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-xs bg-white text-black hover:bg-zinc-200 font-bold shadow-lg transition-colors border-none"
            >
              {bikeToEdit ? "Save Configuration" : "Add to Garage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
