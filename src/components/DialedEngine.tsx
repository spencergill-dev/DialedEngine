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
    <div className="bg-transparent text-zinc-100 font-sans selection:bg-lime-500/25 selection:text-lime-300 flex-1 flex flex-col relative z-10">
      {/* SaaS Sticky Top Navigation Header */}
      <TopNavHeader
        profile={profile}
        bikes={bikes}
        activeBike={activeBike}
        mainView={mainView}
        onSelectView={setMainView}
        onSelectBike={setActiveBikeId}
      />

      {/* Main View Area (with generous bottom clearance for mobile fixed tab bar) */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-28 sm:pb-32 md:pb-12 flex-1">
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
