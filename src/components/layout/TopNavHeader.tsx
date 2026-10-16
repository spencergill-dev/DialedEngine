import { Wrench, Compass } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { RiderProfile, Bike } from "@/types/cycling";

interface TopNavHeaderProps {
  profile: RiderProfile;
  bikes: Bike[];
  activeBike: Bike | undefined;
  mainView: "setup" | "garage" | "profile";
  onSelectView: (view: "setup" | "garage" | "profile") => void;
}

export function TopNavHeader({
  profile,
  bikes,
  activeBike,
  mainView,
  onSelectView,
}: TopNavHeaderProps) {
  const displayName = profile.displayName?.trim() || "Spencer";
  const initials = displayName
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
    <header className="sticky top-0 z-40 w-full bg-[#111111]/90 backdrop-blur-xl border-b border-zinc-800/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-3">
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

        {/* Center/Active Bike Pill (Visible on lg+) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 text-xs text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.6)]" />
          <span className="text-zinc-500">Active Ride:</span>
          <span className="text-zinc-200 font-medium">
            {displayBrand} {activeBike?.model || "Bike"}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 font-sans text-[11px]"><span className="font-mono">{profile.weight}</span> LBS</span>
        </div>

        {/* Right Navigation & Profile Controls (Hidden on mobile md:hidden, visible on md+) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {/* Main View Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/80">
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

          {/* Profile Trigger Button */}
          <button
            onClick={() => onSelectView("profile")}
            className={`flex items-center gap-2 p-1 pl-1.5 sm:pl-2 rounded-full transition-all text-left ${
              mainView === "profile"
                ? "bg-zinc-800 ring-1 ring-lime-400/60 shadow-sm"
                : "bg-zinc-900/60 hover:bg-zinc-800/80"
            }`}
            title="Rider Profile"
          >
            <div className="hidden lg:block text-right pr-1">
              <span className="text-xs font-semibold text-zinc-200 block leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans block">
                <span className="font-mono">{profile.heightInches ? `${Math.floor(profile.heightInches / 12)}' ${profile.heightInches % 12}"` : "71\""}</span> • <span className="font-mono">{profile.weight}</span> lbs
              </span>
            </div>
            <Avatar className="h-8 w-8">
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
