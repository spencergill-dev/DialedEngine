import { useState, useEffect, lazy, Suspense } from "react";
import { TopNavHeader } from "./layout/TopNavHeader";
import { MobileBottomNav } from "./layout/MobileBottomNav";
import { GarageSkeleton } from "./garage/GarageSkeleton";
import { ProfileSkeleton } from "./profile/ProfileSkeleton";
import { RideSetupSkeleton } from "./setup/RideSetupSkeleton";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreen } from "./common/SplashScreen";
import { useCyclingState } from "@/hooks/useCyclingState";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { clearAllLocalUserData } from "@/lib/accountService";
import type { Session } from "@supabase/supabase-js";

// React.lazy dynamic code-splitting for heavy views to minimize initial bundle size
const GarageView = lazy(() =>
  import("./garage/GarageView").then((m) => ({ default: m.GarageView }))
);
const RideSetupView = lazy(() =>
  import("./setup/RideSetupView").then((m) => ({ default: m.RideSetupView }))
);
const ProfileView = lazy(() =>
  import("./profile/ProfileView").then((m) => ({ default: m.ProfileView }))
);
const LoginView = lazy(() =>
  import("./auth/LoginView").then((m) => ({ default: m.LoginView }))
);
const OnboardingView = lazy(() =>
  import("./onboarding/OnboardingView").then((m) => ({ default: m.OnboardingView }))
);

export function DialedEngine() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isSplashDismissed, setIsSplashDismissed] = useState(false);
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

  const handleAccountDeleted = async () => {
    const uid = session?.user?.id;
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch {}
    clearAllLocalUserData(uid);
    setSession(null);
    setIsGuestMode(false);
    setMainView("garage");
  };

  const isHydrating = Boolean(isAuthLoading || (session && isSyncing && !hasCompletedOnboarding));

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-hidden relative">
      {/* Native App Launch Screen Overlay */}
      {!isSplashDismissed && (
        <SplashScreen
          isHydrating={isHydrating}
          onFinish={() => setIsSplashDismissed(true)}
        />
      )}

      {/* 1. Unauthenticated Routing: Redirect to LoginView */}
      {!session && !isGuestMode ? (
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-full bg-[#111111]">
          <Suspense fallback={null}>
            <LoginView
              onSuccess={() => {
                setMainView("garage");
              }}
              onContinueAsGuest={() => {
                setIsGuestMode(true);
                setMainView("garage");
              }}
            />
          </Suspense>
          <Toaster position="bottom-right" richColors />
        </div>
      ) : session && !isGuestMode && !hasCompletedOnboarding ? (
        /* 2. New Rider Onboarding Flow: Profile baseline setup before entering garage */
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-full bg-[#111111]">
          <Suspense fallback={null}>
            <OnboardingView
              initialDisplayName={profile.displayName}
              onComplete={async (profileData) => {
                await completeOnboarding(profileData);
                setMainView("garage");
              }}
            />
          </Suspense>
          <Toaster position="bottom-right" richColors />
        </div>
      ) : (
        /* 3. Authenticated Application OS (Defaulting to Garage upon login) */
        <div className="bg-transparent text-zinc-100 font-sans selection:bg-lime-500/25 selection:text-lime-300 flex-1 flex flex-col min-h-0 relative z-10 overflow-x-hidden overflow-y-hidden w-full max-w-full">
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
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
            <Suspense
              fallback={
                mainView === "garage" ? (
                  <GarageSkeleton />
                ) : mainView === "profile" ? (
                  <ProfileSkeleton />
                ) : (
                  <RideSetupSkeleton />
                )
              }
            >
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
                  isLoading={isSyncing}
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
                  isLoading={isSyncing}
                  onUpdateProfile={updateProfile}
                  onBackToSetup={() => setMainView("setup")}
                  onSignOut={handleSignOut}
                  onAccountDeleted={handleAccountDeleted}
                />
              )}
            </Suspense>

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
      )}
    </div>
  );
}

export default DialedEngine;
