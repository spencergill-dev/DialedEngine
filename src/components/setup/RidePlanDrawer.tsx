import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  CloudRain,
  Cloud,
  Sun,
  Check,
  Thermometer,
  Sparkles,
  Navigation,
  Search,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import type { TrailCondition } from "@/types/cycling";
import {
  PRESET_TRAIL_LOCATIONS,
  searchLocations,
  type GeocodingResult,
  type LocationCoordinates,
} from "@/services/WeatherService";

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
    timeLabel: "Current Live Telemetry",
    temperature: 14,
    weatherDescription: "Overcast",
    pop: 20,
    weatherIcon: "cloud",
  },
  {
    id: "plus_2h",
    label: "+2 Hours",
    timeLabel: "Incoming Hourly Forecast",
    temperature: 9,
    weatherDescription: "Cold Rain",
    pop: 85,
    weatherIcon: "rain",
    autoSurfaceCondition: "wet_slippery",
  },
  {
    id: "afternoon",
    label: "This Afternoon",
    timeLabel: "Peak Thermal Forecast",
    temperature: 8,
    weatherDescription: "Squall Rain",
    pop: 95,
    weatherIcon: "rain",
    autoSurfaceCondition: "wet_slippery",
  },
  {
    id: "tomorrow_am",
    label: "Tomorrow Morning",
    timeLabel: "09:00 Alpine Air",
    temperature: 7,
    weatherDescription: "Clear & Crisp",
    pop: 10,
    weatherIcon: "sun",
    autoSurfaceCondition: "dry_fast",
  },
];

interface RidePlanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "location" | "time";
  selectedLocation: string;
  onSelectLocation: (loc: string, coords: LocationCoordinates) => void;
  selectedTimePlan: RideTimePlan;
  onSelectTimePlan: (plan: RideTimePlan, autoSetWet: boolean) => void;
  timePresets?: RideTimePlan[];
  isLoadingWeather?: boolean;
  onUseCurrentLocation: () => Promise<void>;
  isLocating?: boolean;
  locationError?: string | null;
}

export function RidePlanDrawer({
  open,
  onOpenChange,
  initialTab = "time",
  selectedLocation,
  onSelectLocation,
  selectedTimePlan,
  onSelectTimePlan,
  timePresets = TIME_PRESETS,
  isLoadingWeather = false,
  onUseCurrentLocation,
  isLocating = false,
  locationError = null,
}: RidePlanDrawerProps) {
  const [activeTab, setActiveTab] = useState<"location" | "time">(initialTab);
  const [customTemp, setCustomTemp] = useState<number>(selectedTimePlan.temperature);

  // Geocoding Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync tab when opened
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // Sync local slider when selected plan changes
  useEffect(() => {
    setCustomTemp(selectedTimePlan.temperature);
  }, [selectedTimePlan.temperature]);

  // Debounced geocoding search
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError(`No locations found for "${query}"`);
        }
      } catch {
        setSearchError("Failed to search locations. Check network.");
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handleSelectSearchResult = (result: GeocodingResult) => {
    onSelectLocation(result.label, {
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setSearchQuery("");
    setSearchResults([]);
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
            Select your destination and departure window to pull live Open-Meteo telemetry and auto-calibrate tire compliance.
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
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block">
                  Forecasted Departure Windows
                </span>
                {isLoadingWeather && (
                  <span className="flex items-center gap-1.5 text-[11px] text-lime-400 font-sans">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Syncing forecast...</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {timePresets.map((preset) => {
                  const isSelected = selectedTimePlan.id === preset.id;
                  const isCold = preset.temperature < 10;
                  const isRain =
                    preset.autoSurfaceCondition === "wet_slippery" ||
                    preset.pop >= 60;

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
                className="py-1 cursor-pointer"
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
            {/* Browser Geolocation Quick-Trigger */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                disabled={isLocating}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedLocation.startsWith("Current Location")
                    ? "bg-zinc-900 border-lime-400/50 ring-1 ring-lime-400/20 text-white"
                    : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20 flex items-center justify-center shrink-0">
                    {isLocating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                    ) : (
                      <Navigation className="w-4 h-4 text-lime-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      Use Device GPS Location
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {isLocating
                        ? "Requesting HTML5 browser coordinates..."
                        : "Detect exact latitude and longitude via browser"}
                    </span>
                  </div>
                </div>

                {selectedLocation.startsWith("Current Location") && (
                  <div className="w-5 h-5 rounded-full bg-lime-400 text-black flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {locationError && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>{locationError}</span>
                </div>
              )}
            </div>

            {/* Geocoding Location Search */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block">
                Search Destination (Open-Meteo Geocoding)
              </span>

              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type trail network or city (e.g. Whistler, Moab, Bend)..."
                  className="h-10 pl-9 pr-9 bg-zinc-900 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-500 rounded-xl"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Loading & Results List */}
              {isSearching && (
                <div className="p-3 text-center text-xs text-zinc-400 flex items-center justify-center gap-2 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-lime-400" />
                  <span>Searching global trail databases...</span>
                </div>
              )}

              {searchError && !isSearching && (
                <div className="p-3 text-center text-xs text-zinc-400 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
                  {searchError}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 max-h-48 overflow-y-auto">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800/80 transition-colors flex items-center justify-between text-xs group"
                    >
                      <div className="truncate">
                        <span className="font-semibold text-white group-hover:text-lime-400 block truncate">
                          {res.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate">
                          {[res.admin1, res.country].filter(Boolean).join(", ")} •{" "}
                          <span className="font-mono">
                            {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                          </span>
                        </span>
                      </div>
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 group-hover:text-lime-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved & Popular Trail Centers */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block">
                Popular Trail Centers
              </span>

              <div className="space-y-1.5">
                {PRESET_TRAIL_LOCATIONS.map((preset) => {
                  const isSelected = selectedLocation === preset.label;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        onSelectLocation(preset.label, {
                          latitude: preset.latitude,
                          longitude: preset.longitude,
                        })
                      }
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-zinc-900 border-lime-400/50 ring-1 ring-lime-400/20 text-white"
                          : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin
                          className={`w-4 h-4 ${
                            isSelected ? "text-lime-400" : "text-zinc-500"
                          }`}
                        />
                        <div>
                          <span className="text-xs font-medium block">
                            {preset.label}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {preset.latitude.toFixed(2)}° N,{" "}
                            {Math.abs(preset.longitude).toFixed(2)}° W
                          </span>
                        </div>
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
          </div>
        )}

        {/* Close Button / Bottom Action */}
        <div className="pt-4 border-t border-zinc-800/60 mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Apply Ride Plan
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
