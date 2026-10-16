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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#111111]/95 backdrop-blur-xl border-t border-zinc-800/60 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)]">
      <div className="grid grid-cols-3 w-full max-w-lg mx-auto py-1.5">
        {/* 1. Profile Tab (switches main view to ProfileView) */}
        <button
          onClick={() => onSelectView("profile")}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            mainView === "profile" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
          aria-label="Rider Profile"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Profile</span>
          {mainView === "profile" && (
            <motion.span
              layoutId="mobile-nav-dot"
              className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
        </button>

        {/* 2. Ride Setup Tab */}
        <button
          onClick={() => onSelectView("setup")}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            mainView === "setup" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
          aria-label="Ride Setup"
        >
          <div className="w-5 h-5 flex items-center justify-center relative">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Ride Setup</span>
          {mainView === "setup" && (
            <motion.span
              layoutId="mobile-nav-dot"
              className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
        </button>

        {/* 3. Garage Tab */}
        <button
          onClick={() => onSelectView("garage")}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            mainView === "garage" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
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
          <span className="text-[10px] font-medium tracking-tight mt-1">Garage</span>
          {mainView === "garage" && (
            <motion.span
              layoutId="mobile-nav-dot"
              className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
        </button>
      </div>
    </nav>
  );
}
