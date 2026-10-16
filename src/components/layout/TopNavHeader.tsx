import { Wrench, Compass, Bike as BikeIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { RiderProfile, Bike } from "@/types/cycling";

interface TopNavHeaderProps {
  profile: RiderProfile;
  bikes: Bike[];
  activeBike: Bike | undefined;
  mainView: "setup" | "garage" | "profile";
  onSelectView: (view: "setup" | "garage" | "profile") => void;
  onSelectBike?: (bikeId: string) => void;
}

export function TopNavHeader({
  profile,
  bikes,
  activeBike,
  mainView,
  onSelectView,
  onSelectBike,
}: TopNavHeaderProps) {
  const displayName = profile.displayName?.trim() || "Spencer";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SP";

  const displayBrand =
    activeBike?.brand === "Custom"
      ? activeBike.customBrand || "Custom"
      : activeBike?.brand;

  return (
    <header className="flex-none z-50 w-full bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectView("setup")}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <img
              src="/logo.png"
              alt="Dialed Logo"
              className="h-8 w-auto object-contain rounded-lg shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white font-sans transition-colors">
                  DIALED
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                  PERFORMANCE OS
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium tracking-tight hidden md:block">
                PRE-RIDE TIRE & SUSPENSION ENGINE
              </p>
            </div>
          </button>
        </div>

        {/* Center: Quick-Swap Active Bike Selector Pill */}
        {bikes.length > 0 && (
          <div className="flex items-center justify-center min-w-0 max-w-[170px] xs:max-w-[210px] sm:max-w-[260px] md:max-w-xs">
            <Select
              value={activeBike?.id}
              onValueChange={(bikeId) => onSelectBike?.(bikeId)}
            >
              <SelectTrigger
                className="h-8 w-auto max-w-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/90 text-xs rounded-full px-2.5 sm:px-3 py-1 text-zinc-200 transition-all gap-1.5 focus:ring-lime-400/60 shadow-sm"
                title="Quick-Swap Active Bike"
              >
                <div className="flex items-center gap-1.5 truncate min-w-0">
                  <BikeIcon className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span className="font-semibold text-zinc-100 truncate text-[11px] sm:text-xs">
                    {activeBike ? `${displayBrand} ${activeBike.model}` : "Select Bike"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl shadow-2xl min-w-[220px]">
                {bikes.map((b) => {
                  const bBrand =
                    b.brand === "Custom" ? b.customBrand || "Custom" : b.brand;
                  const isSelected = b.id === activeBike?.id;
                  return (
                    <SelectItem
                      key={b.id}
                      value={b.id}
                      className="text-xs py-2 cursor-pointer focus:bg-zinc-800 focus:text-white"
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <span
                          className={`font-semibold truncate ${
                            isSelected ? "text-lime-400" : "text-zinc-200"
                          }`}
                        >
                          {bBrand} {b.model}
                        </span>
                        <span className="text-[10px] font-sans text-zinc-500 uppercase tracking-wider shrink-0">
                          {(b.discipline || b.category || "mountain").replace("_", " ")}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Right Navigation & Profile Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Main View Toggle Buttons (Hidden on mobile md:hidden, visible on desktop) */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-zinc-900/80">
            <button
              onClick={() => onSelectView("setup")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mainView === "setup"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Ride Setup"
            >
              <Compass className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Ride Setup</span>
            </button>

            <button
              onClick={() => onSelectView("garage")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mainView === "garage"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Garage Fleet"
            >
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Garage</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400">
                {bikes.length}
              </span>
            </button>
          </div>

          {/* User Profile Avatar Trigger (Sleek circle on the far right across ALL viewports) */}
          <button
            onClick={() => onSelectView("profile")}
            className={`flex items-center gap-2 p-1 sm:pl-2 rounded-full transition-all text-left group ${
              mainView === "profile"
                ? "bg-zinc-800 ring-1 ring-lime-400/80 shadow-sm"
                : "hover:bg-zinc-850"
            }`}
            title="Rider Profile"
            aria-label="User Profile"
          >
            <div className="hidden lg:block text-right pr-1">
              <span className="text-xs font-semibold text-zinc-200 block leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans block">
                <span className="font-mono">
                  {profile.heightInches
                    ? `${Math.floor(profile.heightInches / 12)}' ${profile.heightInches % 12}"`
                    : '71"'}
                </span>{" "}
                • <span className="font-mono">{profile.weight}</span> lbs
              </span>
            </div>
            <Avatar className="h-8 w-8 ring-1 ring-white/10 group-hover:ring-lime-400/60 transition-all shrink-0">
              <AvatarFallback className="bg-zinc-800 text-lime-400 font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  );
}
