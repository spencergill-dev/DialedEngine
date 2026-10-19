import { useState, useEffect } from "react";
import {
  Edit3,
  Check,
  X,
  Feather,
  Compass,
  Flame,
  Camera,
  ArrowLeft,
  Cloud,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { supabase } from "@/lib/supabaseClient";
import type { RiderProfile, RidingStyle } from "@/types/cycling";

interface ProfileViewProps {
  profile: RiderProfile;
  isLoading?: boolean;
  onUpdateProfile: (partial: Partial<RiderProfile>) => void;
  onBackToSetup: () => void;
  onSignOut?: () => void;
}

export function ProfileView({
  profile,
  isLoading = false,
  onUpdateProfile,
  onBackToSetup,
  onSignOut,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Form draft state
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [weight, setWeight] = useState<number | "">(profile.weight ?? "");
  const [heightInches, setHeightInches] = useState<number | "">(profile.heightInches ?? "");
  const [ridingStyle, setRidingStyle] = useState<RidingStyle>(
    profile.ridingStyle || "neutral"
  );

  // Sync draft state with props whenever profile updates or edit mode opens
  useEffect(() => {
    setDisplayName(profile.displayName || "");
    setWeight(profile.weight ?? "");
    setHeightInches(profile.heightInches ?? "");
    setRidingStyle(profile.ridingStyle || "neutral");
  }, [profile, isEditing]);

  const handleSave = () => {
    const trimmedName = displayName.trim();
    const numWeight = typeof weight === "number" && weight > 0 ? weight : null;
    const numHeight = typeof heightInches === "number" && heightInches > 0 ? heightInches : null;
    let heightStr = "";
    if (numHeight) {
      const feet = Math.floor(numHeight / 12);
      const inches = numHeight % 12;
      const cm = Math.round(numHeight * 2.54);
      heightStr = `${feet}' ${inches}" (${cm} cm)`;
    }

    onUpdateProfile({
      displayName: trimmedName,
      weight: numWeight,
      heightInches: numHeight,
      height: heightStr,
      ridingStyle,
    });

    setIsEditing(false);
    toast.success("Profile successfully updated.", {
      description: numWeight
        ? `Rider mass set to ${numWeight} lbs with ${ridingStyle.replace("_", " ")} dynamics.`
        : "Profile updated.",
    });
  };

  const handleCancelEdit = () => {
    setDisplayName(profile.displayName || "");
    setWeight(profile.weight ?? "");
    setHeightInches(profile.heightInches ?? "");
    setRidingStyle(profile.ridingStyle || "neutral");
    setIsEditing(false);
  };

  const currentHeightInches = profile.heightInches;
  const viewFeet = currentHeightInches ? Math.floor(currentHeightInches / 12) : null;
  const viewInches = currentHeightInches ? currentHeightInches % 12 : null;
  const viewCm = currentHeightInches ? Math.round(currentHeightInches * 2.54) : null;

  const draftFeet = typeof heightInches === "number" ? Math.floor(heightInches / 12) : null;
  const draftInches = typeof heightInches === "number" ? heightInches % 12 : null;
  const draftCm = typeof heightInches === "number" ? Math.round(heightInches * 2.54) : null;

  const initials = (profile.displayName?.trim() || "R")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "R";

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header (Borderless Section) */}
      <section className="pb-6 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToSetup}
            className="h-9 px-2.5 gap-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-lime-400" />
            <span>Setup</span>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                Rider Profile
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 pl-4">
              Biometric metrics and riding dynamics calibrated for tire pressure and suspension physics
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold shadow-lg transition-colors border-none self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        )}
      </section>

      {/* Main Content: Seamless View Mode vs In-Place Edit Mode */}
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="view-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Profile Hero Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div
                  className="relative group cursor-pointer"
                  title="Upload profile photo (Coming soon)"
                >
                  <Avatar className="h-20 w-20 ring-2 ring-zinc-800">
                    <AvatarFallback className="bg-zinc-800 text-lime-400 text-2xl font-bold font-mono">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center border-2 border-[#111111] shadow-md group-hover:bg-zinc-700 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white font-sans">
                    {profile.displayName || "Rider"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Verified Rider • Dialed Performance OS
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                      PHYSICS CALIBRATED
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:self-center">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  className="h-9 px-3 text-xs text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Metrics</span>
                </Button>
              </div>
            </div>

            {/* Read-Only Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-2">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
                  Total Riding Weight (Rider + Gear)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-mono tracking-tight text-white">
                    {profile.weight !== null ? profile.weight : "--"}
                  </span>
                  <span className="text-sm font-sans font-bold text-zinc-400">
                    LBS
                  </span>
                </div>
                <p className="text-xs font-sans text-zinc-400">
                  {profile.weight !== null ? (
                    <>
                      <span className="font-mono">{(profile.weight * 0.453592).toFixed(1)}</span> KG total mass on bike
                    </>
                  ) : (
                    "Weight not configured"
                  )}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-2">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
                  Rider Height
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-mono tracking-tight text-white">
                    {viewFeet !== null && viewInches !== null ? `${viewFeet}' ${viewInches}"` : "--"}
                  </span>
                </div>
                <p className="text-xs font-sans text-zinc-400">
                  {viewCm !== null ? (
                    <>
                      <span className="font-mono">{viewCm}</span> CM standing height
                    </>
                  ) : (
                    "Height not specified"
                  )}
                </p>
              </div>
            </div>

            {/* Riding Style Dynamics Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400">
                  Default Riding Style Dynamics
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs font-sans font-semibold uppercase px-2.5 py-0.5 bg-zinc-800 text-zinc-200 border-none"
                >
                  {profile.ridingStyle.replace("_", " ")}
                </Badge>
              </div>

              <div className="text-sm text-zinc-300 leading-relaxed pt-1">
                {profile.ridingStyle === "aggressive_heavy" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40">
                    <Flame className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Hard-Charging & Heavy Impact</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Adds +1.5 PSI to tires for rim protection and +5% air spring firmness for bottom-out resistance on drops and rock gardens.
                      </p>
                    </div>
                  </div>
                )}
                {profile.ridingStyle === "smooth_light" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40">
                    <Feather className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Finesse & Clean Line Selection</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Drops 1.0 PSI for compliance and sets -5% air spring pressure for maximum traction and sensitive small-bump tracking.
                      </p>
                    </div>
                  </div>
                )}
                {profile.ridingStyle === "neutral" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40">
                    <Compass className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Balanced All-Around Trail Riding</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Uses standard baseline air pressures and factory recommended 25-30% sag for versatile trail performance.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cloud Sync & Auth Banner */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-lime-400" />
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-300">
                    DIALED CLOUD SYNC
                  </span>
                  <span className={`text-[9px] font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                    userEmail ? "bg-lime-400/10 text-lime-400 border border-lime-400/20" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {userEmail ? "CONNECTED" : "V2 PREVIEW"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {userEmail ? (
                    <>
                      Authenticated as <span className="text-zinc-200 font-medium">{userEmail}</span>. Your bikes and setups are synced to Supabase.
                    </>
                  ) : (
                    "Authenticate with Supabase to back up your fleet and sync setups across all your devices."
                  )}
                </p>
              </div>
              {userEmail ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (onSignOut) {
                      onSignOut();
                    } else {
                      await supabase.auth.signOut();
                    }
                    toast.success("Signed out successfully");
                  }}
                  className="h-9 px-4 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs rounded-xl shrink-0 gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="h-9 px-4 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-xl border-none shrink-0 shadow-sm"
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          /* IN-PLACE EDIT MODE */
          <motion.div
            key="edit-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 space-y-8"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Rider Profile</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Update biometric specs and riding dynamics in local state
                </p>
              </div>
              <span className="text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                EDIT MODE
              </span>
            </div>

            {/* Display Name Input */}
            <div className="space-y-2 max-w-md">
              <Label htmlFor="edit-name" className="text-xs font-semibold text-zinc-300">
                Display Name
              </Label>
              <Input
                id="edit-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="h-10 bg-zinc-900 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm"
              />
              <p className="text-[11px] text-zinc-400 font-sans">
                Used in garage titles, header greetings, and bike recommendations
              </p>
            </div>

            {/* Height Slider */}
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-zinc-300">
                  Rider Height
                </Label>
                <span className="text-sm font-black text-zinc-100 font-sans">
                  {draftFeet !== null && draftInches !== null ? (
                    <>
                      <span className="font-mono">{draftFeet}&apos; {draftInches}&quot;</span> (<span className="font-mono">{draftCm}</span> CM)
                    </>
                  ) : (
                    "--"
                  )}
                </span>
              </div>
              <Slider
                min={54}
                max={82}
                step={1}
                value={[typeof heightInches === "number" ? heightInches : 68]}
                onValueChange={(val) => setHeightInches(val[0])}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-sans text-zinc-400">
                <span>4&apos; 6&quot;</span>
                <span className="text-zinc-300">5&apos; 8&quot;</span>
                <span>6&apos; 10&quot;</span>
              </div>
            </div>

            {/* Weight Slider & Direct Number Input */}
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="edit-weight" className="text-xs font-semibold text-zinc-300">
                    Total Riding Weight (Rider + Apparel + Gear)
                  </Label>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Includes helmet, shoes, hydration pack, and protective gear
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="edit-weight"
                    type="number"
                    min={80}
                    max={280}
                    placeholder="e.g. 175"
                    value={weight}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWeight(val === "" ? "" : Number(val));
                    }}
                    className="w-20 h-9 text-right font-mono text-base md:text-sm font-bold bg-zinc-900 border-none ring-1 ring-white/10"
                  />
                  <span className="text-xs font-sans font-bold text-zinc-400">LBS</span>
                </div>
              </div>
              <Slider
                min={100}
                max={260}
                step={1}
                value={[typeof weight === "number" ? weight : 160]}
                onValueChange={(val) => setWeight(val[0])}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-sans text-zinc-400">
                <span>100 LBS</span>
                <span className="text-zinc-300">180 LBS</span>
                <span>260 LBS</span>
              </div>
            </div>

            {/* Riding Style Dynamics with Framer Motion Sliding Pill */}
            <div className="space-y-3 max-w-xl">
              <Label className="text-xs font-semibold text-zinc-300">
                Default Riding Style Dynamics
              </Label>
              <div className="relative grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-900 rounded-xl">
                {[
                  { id: "smooth_light", label: "Smooth / Finesse", icon: Feather },
                  { id: "neutral", label: "Neutral / Trail", icon: Compass },
                  { id: "aggressive_heavy", label: "Aggro / Hard", icon: Flame },
                ].map((style) => {
                  const isSelected = ridingStyle === style.id;
                  const Icon = style.icon;

                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setRidingStyle(style.id as RidingStyle)}
                      className={`relative z-10 py-3 px-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1.5 transition-colors ${
                        isSelected ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="profile-edit-style-pill"
                          className="absolute inset-0 bg-zinc-800 rounded-lg shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-semibold">{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50 max-w-xl">
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
                className="flex-1 h-11 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-850 text-xs border-none font-semibold"
              >
                <X className="w-4 h-4 mr-1.5" />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 h-11 bg-white text-black hover:bg-zinc-200 font-bold text-xs shadow-lg transition-colors border-none"
              >
                <Check className="w-4 h-4 mr-1.5" />
                <span>Save Profile</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          if (user.name) {
            onUpdateProfile({ displayName: user.name });
          }
        }}
      />
    </div>
  );
}
