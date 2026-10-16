import { useState } from "react";
import { TopNavHeader } from "./layout/TopNavHeader";
import { MobileBottomNav } from "./layout/MobileBottomNav";
import { ProfileView } from "./profile/ProfileView";
import { GarageView } from "./garage/GarageView";
import { RideSetupView } from "./setup/RideSetupView";
import { Toaster } from "@/components/ui/sonner";
import { useCyclingState } from "@/hooks/useCyclingState";

export function DialedEngine() {
  const [mainView, setMainView] = useState<"setup" | "garage" | "profile">("setup");

  const {
    profile,
    updateProfile,
    bikes,
    activeBikeId,
    setActiveBikeId,
    activeBike,
    addBike,
    updateBike,
    deleteBike,
  } = useCyclingState();

  return (
    <div className="bg-transparent text-zinc-100 font-sans selection:bg-lime-500/25 selection:text-lime-300 flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
      {/* Fixed Sibling Header */}
      <TopNavHeader
        profile={profile}
        bikes={bikes}
        activeBike={activeBike}
        mainView={mainView}
        onSelectView={setMainView}
        onSelectBike={setActiveBikeId}
      />

      {/* Direct Sibling: Scrolling Content Flex Child */}
      <main className="flex-1 overflow-y-auto pb-24 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
        {mainView === "setup" && (
          <RideSetupView
            bikes={bikes}
            activeBikeId={activeBikeId}
            onSelectBike={setActiveBikeId}
            profile={profile}
            onSwitchToGarage={() => setMainView("garage")}
          />
        )}

        {mainView === "garage" && (
          <GarageView
            profile={profile}
            bikes={bikes}
            activeBikeId={activeBikeId}
            onSelectActiveBike={setActiveBikeId}
            onAddBike={addBike}
            onUpdateBike={updateBike}
            onDeleteBike={deleteBike}
            onBackToSetup={() => setMainView("setup")}
          />
        )}

        {mainView === "profile" && (
          <ProfileView
            profile={profile}
            onUpdateProfile={updateProfile}
            onBackToSetup={() => setMainView("setup")}
          />
        )}

        {/* Desktop Footer (Inside scrollable container) */}
        <footer className="hidden md:block mt-12 py-8 text-center text-xs text-zinc-400 border-t border-zinc-800/50 font-sans">
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-zinc-300">DIALED</span>
            <span>•</span>
            <span>High-Performance Cycling Setup OS</span>
            <span>•</span>
            <span>SRAM AXS & Strava Calibrated</span>
          </div>
        </footer>
      </main>

      {/* iOS-Style Fixed Mobile Bottom Tab Bar */}
      <MobileBottomNav
        mainView={mainView}
        onSelectView={setMainView}
        bikesCount={bikes.length}
      />

      {/* App-wide Sonner Toaster Notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default DialedEngine;
