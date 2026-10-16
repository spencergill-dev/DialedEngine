import { useState, useEffect } from "react";
import { Edit3, Check, X, Feather, Compass, Flame, User, Camera } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import type { RiderProfile, RidingStyle } from "@/types/cycling";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: RiderProfile;
  onUpdateProfile: (partial: Partial<RiderProfile>) => void;
}

export function ProfileDrawer({
  open,
  onOpenChange,
  profile,
  onUpdateProfile,
}: ProfileDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Form draft state
  const [displayName, setDisplayName] = useState(profile.displayName || "Spencer");
  const [weight, setWeight] = useState(profile.weight || 175);
  const [heightInches, setHeightInches] = useState(profile.heightInches || 71);
  const [ridingStyle, setRidingStyle] = useState<RidingStyle>(
    profile.ridingStyle || "neutral"
  );

  // Sync draft state with props whenever drawer opens
  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName || "Spencer");
      setWeight(profile.weight || 175);
      setHeightInches(profile.heightInches || 71);
      setRidingStyle(profile.ridingStyle || "neutral");
      setIsEditing(false);
    }
  }, [open, profile]);

  const handleSave = () => {
    const trimmedName = displayName.trim() || "Spencer";
    const feet = Math.floor(heightInches / 12);
    const inches = heightInches % 12;
    const cm = Math.round(heightInches * 2.54);

    onUpdateProfile({
      displayName: trimmedName,
      weight,
      heightInches,
      height: `${feet}' ${inches}" (${cm} cm)`,
      ridingStyle,
    });

    setIsEditing(false);
    toast.success("Profile successfully updated.", {
      description: `Rider mass set to ${weight} lbs with ${ridingStyle.replace("_", " ")} dynamics.`,
    });
  };

  const handleCancelEdit = () => {
    setDisplayName(profile.displayName || "Spencer");
    setWeight(profile.weight || 175);
    setHeightInches(profile.heightInches || 71);
    setRidingStyle(profile.ridingStyle || "neutral");
    setIsEditing(false);
  };

  const currentHeightInches = profile.heightInches || 71;
  const viewFeet = Math.floor(currentHeightInches / 12);
  const viewInches = currentHeightInches % 12;
  const viewCm = Math.round(currentHeightInches * 2.54);

  const draftFeet = Math.floor(heightInches / 12);
  const draftInches = heightInches % 12;
  const draftCm = Math.round(heightInches * 2.54);

  const initials = (profile.displayName || "Spencer")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-[#111111] border-l border-zinc-800/50 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6">
          <SheetHeader className="text-left space-y-1.5 pb-4 border-b border-zinc-800/50">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-lime-400" />
                <span>Rider Profile</span>
              </SheetTitle>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                {isEditing ? "EDIT MODE" : "VERIFIED RIDER"}
              </span>
            </div>
            <SheetDescription className="text-xs text-zinc-400">
              {isEditing
                ? "Adjust your biometric metrics and riding style to recalibrate tire and suspension physics."
                : "Your personal metrics and default riding style dynamics stored in local memory."}
            </SheetDescription>
          </SheetHeader>

          {/* VIEW MODE (Default) */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Profile Hero Card */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 flex items-center gap-4">
                <div className="relative group cursor-pointer" title="Upload profile photo (Coming soon)">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-zinc-800 text-lime-400 text-xl font-bold font-mono">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center border-2 border-[#111111] shadow-md group-hover:bg-zinc-700 transition-colors">
                    <Camera className="w-3 h-3 text-zinc-300" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-sans">
                    {profile.displayName || "Spencer"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Active Rider • Dialed Performance
                  </p>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                      SYSTEM CALIBRATED
                    </span>
                  </div>
                </div>
              </div>

              {/* Read-Only Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    TOTAL RIDING WEIGHT
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-zinc-100">
                      {profile.weight}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      LBS
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    {(profile.weight * 0.453592).toFixed(1)} KG with gear
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    RIDER HEIGHT
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono tracking-tight text-zinc-100">
                      {viewFeet}&apos; {viewInches}&quot;
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    {viewCm} CM standing
                  </span>
                </div>
              </div>

              {/* Riding Style Read-Only Card */}
              <div className="p-4 rounded-xl bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    RIDING STYLE DYNAMICS
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-200"
                  >
                    {profile.ridingStyle.replace("_", " ")}
                  </Badge>
                </div>

                <div className="text-xs text-zinc-300 leading-relaxed pt-1">
                  {profile.ridingStyle === "aggressive_heavy" && (
                    <p className="flex items-start gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>
                        Hard-charging & heavy impact. Adds +1.5 PSI to tires and +5% air spring firmness for bottom-out resistance.
                      </span>
                    </p>
                  )}
                  {profile.ridingStyle === "smooth_light" && (
                    <p className="flex items-start gap-2">
                      <Feather className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span>
                        Finesse & clean line selection. Drops 1.0 PSI for compliance and sets -5% air spring for sensitive tracking.
                      </span>
                    </p>
                  )}
                  {profile.ridingStyle === "neutral" && (
                    <p className="flex items-start gap-2">
                      <Compass className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>
                        Balanced all-around trail riding. Uses nominal baseline air pressures and recommended 25-30% sag.
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Prominent Edit Profile Trigger */}
              <div className="pt-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-bold border-none flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Display Name Input */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-zinc-300">
                  Display Name
                </Label>
                <Input
                  id="edit-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Spencer"
                  className="bg-zinc-900 border-none ring-1 ring-white/10 focus-visible:ring-lime-400"
                />
              </div>

              {/* Height Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-300">
                    Rider Height
                  </Label>
                  <span className="text-sm font-black font-mono text-zinc-100">
                    {draftFeet}&apos; {draftInches}&quot; ({draftCm} CM)
                  </span>
                </div>
                <Slider
                  min={54}
                  max={82}
                  step={1}
                  value={[heightInches]}
                  onValueChange={(val) => setHeightInches(val[0])}
                  className="py-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>4&apos; 6&quot;</span>
                  <span className="text-zinc-400">5&apos; 8&quot;</span>
                  <span>6&apos; 10&quot;</span>
                </div>
              </div>

              {/* Weight Slider & Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-weight" className="text-xs font-semibold text-zinc-300">
                    Total Riding Weight (LBS)
                  </Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    min={80}
                    max={280}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value) || 160)}
                    className="w-20 h-8 text-right font-mono text-xs bg-zinc-900 border-none ring-1 ring-white/10"
                  />
                </div>
                <Slider
                  min={100}
                  max={260}
                  step={1}
                  value={[weight]}
                  onValueChange={(val) => setWeight(val[0])}
                  className="py-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>100 LBS</span>
                  <span className="text-zinc-400">180 LBS</span>
                  <span>260 LBS</span>
                </div>
              </div>

              {/* Riding Style Dynamics with Framer Motion Sliding Pill */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-300">
                  Riding Style Dynamics
                </Label>
                <div className="relative grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-xl">
                  {[
                    { id: "smooth_light", label: "Smooth", icon: Feather },
                    { id: "neutral", label: "Neutral", icon: Compass },
                    { id: "aggressive_heavy", label: "Aggro", icon: Flame },
                  ].map((style) => {
                    const isSelected = ridingStyle === style.id;
                    const Icon = style.icon;

                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setRidingStyle(style.id as RidingStyle)}
                        className={`relative z-10 py-2.5 px-1 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-colors ${
                          isSelected ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="profile-style-pill"
                            className="absolute inset-0 bg-zinc-800 rounded-lg shadow-sm -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <Icon className="w-3.5 h-3.5" />
                        <span>{style.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edit Mode Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="ghost"
                  className="flex-1 h-10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-850 text-xs border-none"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 h-10 bg-white text-black hover:bg-zinc-200 font-bold text-xs shadow-lg transition-colors border-none"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="pt-6 border-t border-white/5 mt-6">
          <p className="text-[11px] text-zinc-500 font-mono text-center w-full">
            DIALED PROFILE SYNC // LOCAL PERSISTENCE ACTIVE
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
