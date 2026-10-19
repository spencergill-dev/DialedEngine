import { useState, useEffect } from "react";
import { TopNavHeader } from "./layout/TopNavHeader";
import { MobileBottomNav } from "./layout/MobileBottomNav";
import { ProfileView } from "./profile/ProfileView";
import { GarageView } from "./garage/GarageView";
import { RideSetupView } from "./setup/RideSetupView";
import { LoginView } from "./auth/LoginView";
import { OnboardingView } from "./onboarding/OnboardingView";
import { Toaster } from "@/components/ui/sonner";
import { useCyclingState } from "@/hooks/useCyclingState";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export function DialedEngine() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [mainView, setMainView] = useState<"setup" | "garage" | "profile">("garage");

  // Track Supabase Auth session & handle routing transitions
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setIsAuthLoading(false);
      if (session) {
        setMainView("garage");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setIsAuthLoading(false);
      if (newSession) {
        setIsGuestMode(false);
        setMainView("garage");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id || null;

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
    hasCompletedOnboarding,
    completeOnboarding,
    isSyncing,
  } = useCyclingState(userId);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    setSession(null);
    setIsGuestMode(false);
    setMainView("garage");
  };

  // 1. Initial Auth Check or Cloud Profile Verification Loading State
  if (isAuthLoading || (session && isSyncing && !hasCompletedOnboarding)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#111111] text-zinc-100 p-6 min-h-[100dvh]">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo.png"
            alt="Dialed"
            className="h-10 w-auto object-contain rounded-xl opacity-90 animate-pulse"
          />
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Loader2 className="w-4 h-4 text-lime-400 animate-spin" />
            <span>SYNCING SETUP OS...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Routing: Redirect to LoginView
  if (!session && !isGuestMode) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#111111]">
        <LoginView
          onSuccess={() => {
            setMainView("garage");
          }}
          onContinueAsGuest={() => {
            setIsGuestMode(true);
            setMainView("garage");
          }}
        />
        <Toaster position="bottom-right" richColors />
      </div>
    );
  }

  // 3. New Rider Onboarding Flow: Profile baseline setup before entering garage
  if (session && !isGuestMode && !hasCompletedOnboarding) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#111111]">
        <OnboardingView
          initialDisplayName={profile.displayName}
          onComplete={async (profileData) => {
            await completeOnboarding(profileData);
            setMainView("garage");
          }}
        />
        <Toaster position="bottom-right" richColors />
      </div>
    );
  }

  // 4. Authenticated Application OS (Defaulting to Garage upon login)
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
            onUpdateBike={updateBike}
            onAddBike={addBike}
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
            onSignOut={handleSignOut}
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
            {session && (
              <>
                <span>•</span>
                <button
                  onClick={handleSignOut}
                  className="text-zinc-500 hover:text-zinc-300 underline transition-colors cursor-pointer"
                >
                  Sign Out ({session.user?.email})
                </button>
              </>
            )}
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
