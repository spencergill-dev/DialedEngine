import { useState } from "react";
import {
  MapPin,
  Clock,
  CloudRain,
  Cloud,
  Sun,
  Check,
  Thermometer,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import type { TrailCondition } from "@/types/cycling";

export interface RideTimePlan {
  id: "now" | "plus_2h" | "afternoon" | "tomorrow_am" | "custom";
  label: string;
  timeLabel: string;
  temperature: number; // in Celsius
  weatherDescription: string;
  pop: number; // Probability of precipitation %
  weatherIcon: "cloud" | "rain" | "sun";
  autoSurfaceCondition?: TrailCondition;
}

export const TIME_PRESETS: RideTimePlan[] = [
  {
    id: "now",
    label: "Riding Now",
    timeLabel: "Current Conditions",
    temperature: 14,
    weatherDescription: "Overcast",
    pop: 20,
    weatherIcon: "cloud",
  },
  {
    id: "plus_2h",
    label: "+2 Hours",
    timeLabel: "Incoming Weather Front",
    temperature: 9,
    weatherDescription: "Cold Rain",
    pop: 85,
    weatherIcon: "rain",
    autoSurfaceCondition: "wet_slippery",
  },
  {
    id: "afternoon",
    label: "This Afternoon",
    timeLabel: "14:00 • Heavy Squall",
    temperature: 8,
    weatherDescription: "Squall Rain",
    pop: 95,
    weatherIcon: "rain",
    autoSurfaceCondition: "wet_slippery",
  },
  {
    id: "tomorrow_am",
    label: "Tomorrow Morning",
    timeLabel: "09:00 • Crisp Alpine Air",
    temperature: 7,
    weatherDescription: "Clear & Crisp",
    pop: 10,
    weatherIcon: "sun",
    autoSurfaceCondition: "dry_fast",
  },
];

export const POPULAR_LOCATIONS = [
  "Current Location (Squamish, BC)",
  "Whistler Mountain Bike Park, BC",
  "North Shore (Mount Fromme), BC",
  "Galbraith Mountain (Bellingham, WA)",
  "Moab (Whole Enchilada), UT",
];

interface RidePlanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "location" | "time";
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  selectedTimePlan: RideTimePlan;
  onSelectTimePlan: (plan: RideTimePlan, autoSetWet: boolean) => void;
}

export function RidePlanDrawer({
  open,
  onOpenChange,
  initialTab = "time",
  selectedLocation,
  onSelectLocation,
  selectedTimePlan,
  onSelectTimePlan,
}: RidePlanDrawerProps) {
  const [activeTab, setActiveTab] = useState<"location" | "time">(initialTab);
  const [customTemp, setCustomTemp] = useState<number>(selectedTimePlan.temperature);

  const handlePresetSelect = (preset: RideTimePlan) => {
    setCustomTemp(preset.temperature);
    const willAutoSetWet = preset.autoSurfaceCondition === "wet_slippery";
    onSelectTimePlan(preset, willAutoSetWet);
  };

  const handleCustomTempChange = (val: number[]) => {
    const newTemp = val[0];
    setCustomTemp(newTemp);
    const updatedPlan: RideTimePlan = {
      ...selectedTimePlan,
      id: "custom",
      temperature: newTemp,
    };
    onSelectTimePlan(updatedPlan, false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] bg-[#111111] border-t border-zinc-800 text-zinc-100 p-6 sm:p-8 rounded-t-2xl overflow-y-auto max-w-2xl mx-auto inset-x-0"
      >
        {/* Subtle iOS grab handle */}
        <div className="w-12 h-1 bg-zinc-700/80 rounded-full mx-auto mb-4" />

        <SheetHeader className="text-left space-y-1.5 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)] shrink-0" />
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
              LIVE CONDITIONS & FORECASTING
            </span>
          </div>
          <SheetTitle className="text-xl font-black text-white font-sans tracking-tight">
            Configure Ride Plan
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-400">
            Adjust destination and departure window to calculate ambient temperature offsets and forecast-driven tire telemetry.
          </SheetDescription>
        </SheetHeader>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900 rounded-xl my-4">
          <button
            type="button"
            onClick={() => setActiveTab("time")}
            className={`py-2 px-3 text-xs font-sans font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "time"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time & Forecast</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("location")}
            className={`py-2 px-3 text-xs font-sans font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "location"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Location</span>
          </button>
        </div>

        {/* Tab 1: Time of Ride & Weather Forecast */}
        {activeTab === "time" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block">
                Forecasted Departure Windows
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TIME_PRESETS.map((preset) => {
                  const isSelected = selectedTimePlan.id === preset.id;
                  const isCold = preset.temperature < 10;
                  const isRain = preset.autoSurfaceCondition === "wet_slippery";

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "bg-zinc-900 border-lime-400/50 ring-1 ring-lime-400/20"
                          : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {preset.label}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {preset.timeLabel}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-lime-400 text-black flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs pt-1 border-t border-zinc-800/60 w-full">
                        {preset.weatherIcon === "rain" && (
                          <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                        {preset.weatherIcon === "cloud" && (
                          <Cloud className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        )}
                        {preset.weatherIcon === "sun" && (
                          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}

                        <span className="font-mono font-semibold text-zinc-200">
                          {preset.temperature}°C
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-[11px] text-zinc-400 truncate">
                          {preset.weatherDescription}
                        </span>

                        <span className="ml-auto text-[10px] font-mono text-zinc-400">
                          {preset.pop}% POP
                        </span>
                      </div>

                      {/* Smart Auto-Rule Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {isCold && (
                          <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Cold Air +1.0 PSI
                          </span>
                        )}
                        {isRain && (
                          <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Auto-set Wet
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Temperature Fine-Tuning */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Fine-Tune Ambient Temperature
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
                  {customTemp}°C ({(customTemp * 1.8 + 32).toFixed(0)}°F)
                </span>
              </div>

              <Slider
                value={[customTemp]}
                min={-5}
                max={35}
                step={1}
                onValueChange={handleCustomTempChange}
                className="py-1"
              />

              <div className="flex justify-between text-[10px] font-sans text-zinc-500">
                <span>-5°C (Freezing)</span>
                <span className={customTemp < 10 ? "text-amber-400 font-semibold" : ""}>
                  &lt;10°C triggers +1.0 PSI density compensation
                </span>
                <span>35°C (Hot)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Location Selector */}
        {activeTab === "location" && (
          <div className="space-y-4">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block">
              Saved & Popular Trail Centers
            </span>

            <div className="space-y-2">
              {POPULAR_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc;

                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => onSelectLocation(loc)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-zinc-900 border-lime-400/50 ring-1 ring-lime-400/20 text-white"
                        : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${isSelected ? "text-lime-400" : "text-zinc-500"}`} />
                      <span className="text-xs font-medium">{loc}</span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-lime-400 text-black flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Close Button / Bottom Action */}
        <div className="pt-4 border-t border-zinc-800/60 mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl transition-colors"
          >
            Apply Ride Plan
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
