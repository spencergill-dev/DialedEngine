import { useState, useEffect, useCallback } from "react";
import {
  Sun,
  CloudRain,
  CheckCircle2,
  Feather,
  Compass,
  Flame,
  RotateCw,
  MapPin,
  Clock,
  Cloud,
  ChevronRight,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { useDialedMath } from "@/hooks/useDialedMath";
import { CalculationBreakdownDialog } from "./CalculationBreakdownDialog";
import {
  RidePlanDrawer,
  TIME_PRESETS,
  type RideTimePlan,
} from "./RidePlanDrawer";
import {
  fetchLiveWeather,
  getCurrentPosition,
  reverseGeocode,
  PRESET_TRAIL_LOCATIONS,
  type LocationCoordinates,
} from "@/services/WeatherService";
import { DISCIPLINE_SURFACE_PRESETS } from "@/data/disciplinePresets";
import { BikeBuilderDialog } from "@/components/garage/BikeBuilderDialog";
import type {
  Bike,
  BikeDiscipline,
  RiderProfile,
  TrailCondition,
  RidingStyle,
} from "@/types/cycling";

interface RideSetupViewProps {
  bikes: Bike[];
  activeBikeId: string;
  onSelectBike?: (id: string) => void;
  profile: RiderProfile;
  onSwitchToGarage: () => void;
  onUpdateBike?: (id: string, updates: Partial<Bike>) => void;
}

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
  onSelectBike: _onSelectBike,
  profile,
  onSwitchToGarage,
  onUpdateBike,
}: RideSetupViewProps) {
  const [condition, setCondition] = useState<TrailCondition>("loam_dirt");
  const [rideStyle, setRideStyle] = useState<RidingStyle>(
    profile.ridingStyle || "neutral"
  );
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [breakdownTab, setBreakdownTab] = useState<"front" | "rear">("front");
  const [isEditBikeOpen, setIsEditBikeOpen] = useState(false);

  const currentBike = bikes.find((b) => b.id === activeBikeId) || bikes[0];

  const bikeDiscipline: BikeDiscipline =
    currentBike?.discipline ||
    (currentBike?.category === "road"
      ? "road"
      : currentBike?.category === "gravel"
      ? "gravel"
      : currentBike?.category === "fat_bike"
      ? "fat_bike"
      : currentBike?.category === "urban_commuter"
      ? "urban_commuter"
      : "mountain");

  const surfacePresets =
    DISCIPLINE_SURFACE_PRESETS[bikeDiscipline] ||
    DISCIPLINE_SURFACE_PRESETS.mountain;

  // Live Conditions & Forecasting State
  const [selectedLocation, setSelectedLocation] = useState<string>("Locating...");
  const [_currentCoords, setCurrentCoords] = useState<LocationCoordinates>({
    latitude: PRESET_TRAIL_LOCATIONS[0].latitude,
    longitude: PRESET_TRAIL_LOCATIONS[0].longitude,
  });
  const [isDeviceLocation, setIsDeviceLocation] = useState<boolean>(true);
  const [timePresets, setTimePresets] = useState<RideTimePlan[]>(TIME_PRESETS);
  const [selectedTimePlan, setSelectedTimePlan] = useState<RideTimePlan>(
    TIME_PRESETS[0]
  );
  const [isRidePlanOpen, setIsRidePlanOpen] = useState(false);
  const [ridePlanTab, setRidePlanTab] = useState<"location" | "time">("time");
  const [autoWetNote, setAutoWetNote] = useState<string | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const loadWeatherForCoords = useCallback(
    async (coords: LocationCoordinates) => {
      setIsLoadingWeather(true);
      try {
        const weather = await fetchLiveWeather(coords.latitude, coords.longitude);
        setTimePresets(weather.timePlans);
        setSelectedTimePlan((prev) => {
          const match =
            weather.timePlans.find((p) => p.id === prev.id) ||
            weather.timePlans[0];
          return match;
        });

        // Weather Auto-Toggle Logic:
        // If the weather indicates Rain, Drizzle, or Showers, automatically set local surfaceCondition to the discipline's wet preset
        const isRainWeather =
          weather.weatherIcon === "rain" ||
          weather.precipitation > 0 ||
          [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weather.weatherCode) ||
          /rain|drizzle|shower/i.test(weather.weatherDescription);

        if (isRainWeather) {
          const wetPreset =
            surfacePresets.find(
              (p) =>
                p.id.includes("wet") ||
                p.id.includes("rain") ||
                p.id.includes("mud") ||
                p.label.toLowerCase().includes("wet") ||
                p.label.toLowerCase().includes("mud")
            )?.id || surfacePresets[0].id;

          setCondition(wetPreset);
          const note = "Surface condition auto-set to Wet based on local weather.";
          setAutoWetNote(note);
          toast.info(note);
        }
      } catch (err) {
        console.error("Open-Meteo live weather fetch error:", err);
      } finally {
        setIsLoadingWeather(false);
      }
    },
    [surfacePresets]
  );

  // Initial load: Attempt automatic device geolocation & reverse geocoding on mount
  useEffect(() => {
    let isCancelled = false;

    const autoLocateAndFetch = async () => {
      setIsLocating(true);
      setLocationError(null);
      try {
        const pos = await getCurrentPosition();
        if (isCancelled) return;
        const coords: LocationCoordinates = {
          latitude: pos.latitude,
          longitude: pos.longitude,
        };
        setCurrentCoords(coords);
        setIsDeviceLocation(true);

        // Reverse geocode to resolve human-readable city name
        const cityName = await reverseGeocode(pos.latitude, pos.longitude);
        if (isCancelled) return;
        setSelectedLocation(cityName);

        // Fetch live weather telemetry for device coordinates
        await loadWeatherForCoords(coords);
      } catch (err: any) {
        if (isCancelled) return;
        console.warn("Auto-location failed or permission denied on mount:", err);
        setSelectedLocation("Set Location");
        setIsDeviceLocation(false);
        if (err?.code === 1) {
          setLocationError("Location permission denied. Please allow location access or choose a trail center.");
        } else {
          setLocationError("Location access unavailable. Tap to choose your location.");
        }
        // Load fallback trail weather so math engine has valid base temperature
        await loadWeatherForCoords({
          latitude: PRESET_TRAIL_LOCATIONS[0].latitude,
          longitude: PRESET_TRAIL_LOCATIONS[0].longitude,
        });
      } finally {
        if (!isCancelled) {
          setIsLocating(false);
        }
      }
    };

    autoLocateAndFetch();

    return () => {
      isCancelled = true;
    };
  }, [loadWeatherForCoords]);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const pos = await getCurrentPosition();
      const coords: LocationCoordinates = {
        latitude: pos.latitude,
        longitude: pos.longitude,
      };
      setCurrentCoords(coords);
      setIsDeviceLocation(true);

      const cityName = await reverseGeocode(pos.latitude, pos.longitude);
      setSelectedLocation(cityName);
      toast.success(`Location detected: ${cityName}`);
      await loadWeatherForCoords(coords);
    } catch (err: any) {
      console.warn("Geolocation acquisition failed:", err);
      if (err?.code === 1) {
        setLocationError("Location permission denied. Please allow location access or choose a trail center.");
        toast.warning("Location access denied. Please select a trail center.");
      } else {
        setLocationError("GPS signal unavailable. Please select or search a trail center.");
        toast.warning("GPS unavailable. Please select a trail center.");
      }
      if (selectedLocation === "Locating...") {
        setSelectedLocation("Set Location");
        setIsDeviceLocation(false);
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Sync condition if active bike discipline changes
  useEffect(() => {
    const exists = surfacePresets.some((p) => p.id === condition);
    if (!exists && surfacePresets.length > 0) {
      setCondition(surfacePresets[0].id);
    }
  }, [bikeDiscipline, surfacePresets, condition]);

  const setup = useDialedMath(
    currentBike,
    profile,
    condition,
    rideStyle,
    selectedTimePlan.temperature
  );

  const rawFrontDelta = setup.frontModifiers.reduce((acc, m) => acc + m.delta, 0);
  const frontNetAdjustment = Math.abs(rawFrontDelta) < 0.001 ? 0 : rawFrontDelta;

  const rawRearDelta = setup.rearModifiers.reduce((acc, m) => acc + m.delta, 0);
  const rearNetAdjustment = Math.abs(rawRearDelta) < 0.001 ? 0 : rawRearDelta;

  const handleSelectTimePlan = (plan: RideTimePlan, willAutoSetWet: boolean) => {
    setSelectedTimePlan(plan);
    if (willAutoSetWet) {
      const wetPreset =
        surfacePresets.find(
          (p) =>
            p.id.includes("wet") || p.id.includes("rain") || p.id.includes("mud")
        )?.id || surfacePresets[0].id;
      setCondition(wetPreset);
      setAutoWetNote("Surface condition auto-set based on forecasted precipitation");
      toast.info("Surface condition auto-set based on forecasted precipitation");
    } else {
      setAutoWetNote(null);
    }
  };

  const handleConditionSelect = (newCond: TrailCondition) => {
    setCondition(newCond);
    if (
      autoWetNote &&
      !newCond.includes("wet") &&
      !newCond.includes("rain") &&
      !newCond.includes("mud")
    ) {
      setAutoWetNote(null);
    }
  };

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
      {/* 1. Active Context & Live Conditions (Borderless Section) */}
      <section className="pb-8 border-b border-zinc-800/50">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)] shrink-0" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
                ACTIVE SETUP
              </span>
            </div>
            <div className="flex items-center gap-2 pl-3.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {displayBrand} {currentBike.model}
              </h1>
              <button
                type="button"
                onClick={() => setIsEditBikeOpen(true)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Edit bike setup"
                aria-label="Edit bike setup"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-3.5 sm:pl-0 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-200">
              <span className="font-mono">{profile.weight}</span> LBS
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300 capitalize">
              {bikeDiscipline.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Live Conditions & Forecasting Module (Compact, Borderless, Geist Sans) */}
        <div className="mt-4 pt-3 border-t border-zinc-800/40 space-y-1.5 font-sans">
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {/* Location Button */}
            <button
              type="button"
              onClick={() => {
                setRidePlanTab("location");
                setIsRidePlanOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors group cursor-pointer"
            >
              {isLocating || selectedLocation === "Locating..." ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-lime-400 shrink-0" />
                  <span className="font-medium text-zinc-300">Locating...</span>
                </>
              ) : selectedLocation === "Set Location" ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-medium text-amber-400 underline-offset-4 group-hover:underline">
                    Set Location
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span className="font-medium underline-offset-4 group-hover:underline">
                    {selectedLocation}
                  </span>
                </>
              )}
            </button>

            <span className="text-zinc-700">•</span>

            {/* Time of Ride Button */}
            <button
              type="button"
              onClick={() => {
                setRidePlanTab("time");
                setIsRidePlanOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors group cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-lime-400 shrink-0" />
              <span className="font-medium underline-offset-4 group-hover:underline">
                {selectedTimePlan.label}
              </span>
            </button>
          </div>

          {/* Forecasted Weather Readout */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
            {isLoadingWeather ? (
              <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-lime-400 shrink-0" />
                <span>Syncing live Open-Meteo telemetry...</span>
              </span>
            ) : (
              <>
                {selectedTimePlan.weatherIcon === "rain" ? (
                  <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                ) : selectedTimePlan.weatherIcon === "sun" ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
                <span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {selectedTimePlan.temperature}°C
                  </span>{" "}
                  • {selectedTimePlan.weatherDescription} •{" "}
                  <span className="font-mono">{selectedTimePlan.pop}%</span> POP
                </span>
                {selectedTimePlan.temperature < 10 && (
                  <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Cold Air +1.0 PSI
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pre-Ride Inputs: Surface Conditions & Ride Intensity (2-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Surface Conditions (Framer Motion Sliding Segment Pill) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400">
                Surface Conditions
              </Label>
              {(() => {
                const offset = surfacePresets.find((c) => c.id === condition)?.offset;
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

            {/* Simulated Live Weather Auto-Toggle Inline Note */}
            {autoWetNote && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-sans">
                <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-medium">{autoWetNote}</span>
              </div>
            )}

            <div className="relative flex items-center overflow-x-auto gap-2 no-scrollbar px-1 py-1 bg-zinc-900 rounded-xl">
              {surfacePresets.map((cond) => {
                const isSelected = condition === cond.id;
                const Icon = cond.icon;

                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => handleConditionSelect(cond.id)}
                    className={`relative z-10 shrink-0 whitespace-nowrap py-2 px-3 text-xs font-sans font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
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
                    <span>{cond.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ride Intensity (Framer Motion Sliding Segment Pill) */}
          <div className="space-y-2">
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

            {/* Under PSI: Information Scent Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setBreakdownTab("front");
                setIsBreakdownOpen(true);
              }}
              className="bg-zinc-900/50 hover:bg-zinc-800 rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors border border-zinc-800/80 group w-fit mt-1"
            >
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  frontNetAdjustment > 0
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : frontNetAdjustment < 0
                    ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                }`}
              >
                {frontNetAdjustment > 0
                  ? `+${frontNetAdjustment.toFixed(1)} PSI`
                  : `${frontNetAdjustment.toFixed(1)} PSI`}
              </span>
              <span className="text-xs text-zinc-400 font-sans font-medium group-hover:text-zinc-200 transition-colors">
                Net Setup Adjustment
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
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

            {/* Under PSI: Information Scent Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setBreakdownTab("rear");
                setIsBreakdownOpen(true);
              }}
              className="bg-zinc-900/50 hover:bg-zinc-800 rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors border border-zinc-800/80 group w-fit mt-1"
            >
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  rearNetAdjustment > 0
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : rearNetAdjustment < 0
                    ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                }`}
              >
                {rearNetAdjustment > 0
                  ? `+${rearNetAdjustment.toFixed(1)} PSI`
                  : `${rearNetAdjustment.toFixed(1)} PSI`}
              </span>
              <span className="text-xs text-zinc-400 font-sans font-medium group-hover:text-zinc-200 transition-colors">
                Net Setup Adjustment
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
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

      {/* Progressive Disclosure Math Breakdown Modal */}
      <CalculationBreakdownDialog
        open={isBreakdownOpen}
        onOpenChange={setIsBreakdownOpen}
        bike={currentBike}
        profile={profile}
        initialTab={breakdownTab}
        setup={setup}
        temperature={selectedTimePlan.temperature}
      />

      {/* Live Conditions & Ride Plan Drawer */}
      <RidePlanDrawer
        open={isRidePlanOpen}
        onOpenChange={setIsRidePlanOpen}
        initialTab={ridePlanTab}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc, coords) => {
          setSelectedLocation(loc);
          setCurrentCoords(coords);
          setIsDeviceLocation(false);
          loadWeatherForCoords(coords);
          setIsRidePlanOpen(false);
          toast.success(`Location calibrated: ${loc}`);
        }}
        selectedTimePlan={selectedTimePlan}
        onSelectTimePlan={(plan, autoSetWet) => {
          handleSelectTimePlan(plan, autoSetWet);
        }}
        timePresets={timePresets}
        isLoadingWeather={isLoadingWeather}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
        locationError={locationError}
        isDeviceLocation={isDeviceLocation}
      />

      {/* Quick Edit Bike Dialog */}
      {currentBike && (
        <BikeBuilderDialog
          open={isEditBikeOpen}
          onOpenChange={setIsEditBikeOpen}
          bikeToEdit={currentBike}
          onSave={(bikeData) => {
            if (onUpdateBike && currentBike) {
              onUpdateBike(currentBike.id, bikeData);
              toast.success(`${bikeData.brand || currentBike.brand} updated`);
            }
            setIsEditBikeOpen(false);
          }}
        />
      )}
    </div>
  );
}
