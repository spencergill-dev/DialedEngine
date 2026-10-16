import { Compass, Wrench, User } from "lucide-react";
import { motion } from "framer-motion";

interface MobileBottomNavProps {
  mainView: "setup" | "garage" | "profile";
  onSelectView: (view: "setup" | "garage" | "profile") => void;
  bikesCount: number;
}

export function MobileBottomNav({
  mainView,
  onSelectView,
  bikesCount,
}: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-950/85 backdrop-blur-md border-t border-zinc-800 shadow-[0_-4px_24px_rgba(0,0,0,0.6)] pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)]">
      <div className="grid grid-cols-3 w-full max-w-lg mx-auto py-1.5">
        {/* 1. Profile Tab */}
        <button
          onClick={() => onSelectView("profile")}
          className={`flex flex-col items-center justify-center py-1.5 transition-colors relative ${
            mainView === "profile"
              ? "text-lime-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          aria-label="Rider Profile"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 transition-colors ${
              mainView === "profile"
                ? "text-white font-bold"
                : "text-zinc-400 font-medium"
            }`}
          >
            Profile
          </span>
          {mainView === "profile" && (
            <motion.span
              layoutId="mobile-nav-dot"
              className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.9)]"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
        </button>

        {/* 2. Ride Setup Tab */}
        <button
          onClick={() => onSelectView("setup")}
          className={`flex flex-col items-center justify-center py-1.5 transition-colors relative ${
            mainView === "setup"
              ? "text-lime-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          aria-label="Ride Setup"
        >
          <div className="w-5 h-5 flex items-center justify-center relative">
            <Compass className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 transition-colors ${
              mainView === "setup"
                ? "text-white font-bold"
                : "text-zinc-400 font-medium"
            }`}
          >
            Ride Setup
          </span>
          {mainView === "setup" && (
            <motion.span
              layoutId="mobile-nav-dot"
              className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.9)]"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
        </button>

        {/* 3. Garage Tab */}
        <button
          onClick={() => onSelectView("garage")}
          className={`flex flex-col items-center justify-center py-1.5 transition-colors relative ${
            mainView === "garage"
              ? "text-lime-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          aria-label="Garage Fleet"
        >
          <div className="w-5 h-5 flex items-center justify-center relative">
            <Wrench className="w-5 h-5" />
            {bikesCount > 0 && (
              <span className="absolute -top-1 -right-3 min-w-[14px] h-3.5 px-1 rounded-full bg-zinc-800 text-[9px] font-mono font-bold text-zinc-300 flex items-center justify-center">
                {bikesCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 transition-colors ${
              mainView === "garage"
                ? "text-white font-bold"
                : "text-zinc-400 font-medium"
            }`}
          >
            Garage
          </span>
          {mainView === "garage" && (
            <motion.span
              layoutId="mobile-nav-dot"
              className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.9)]"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
        </button>
      </div>
    </nav>
  );
}
