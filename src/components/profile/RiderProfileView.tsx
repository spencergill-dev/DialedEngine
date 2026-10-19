import { Feather, Compass, Flame } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { RiderProfile, RidingStyle } from "@/types/cycling";

interface RiderProfileViewProps {
  profile: RiderProfile;
  onUpdateProfile: (partial: Partial<RiderProfile>) => void;
}

export function RiderProfileView({
  profile,
  onUpdateProfile,
}: RiderProfileViewProps) {
  const heightInches = profile.heightInches;
  const feet = heightInches ? Math.floor(heightInches / 12) : null;
  const inches = heightInches ? heightInches % 12 : null;
  const cm = heightInches ? Math.round(heightInches * 2.54) : null;

  return (
    <div className="space-y-6">
      <Card className="border-slate-800/60 bg-slate-900/60 shadow-lg">
        <CardHeader className="p-6 md:p-8 pb-4 border-b border-slate-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-200 font-semibold font-mono text-sm">
                {(profile.displayName || "Rider").charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-100">
                  Rider Profile
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Your biometric metrics and riding style calibrate vehicle spring rates and tire compliance.
                </CardDescription>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {profile.weight !== null ? profile.weight : "--"}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-1">LBS</span>
              <div className="text-[10px] text-slate-500 font-mono">
                {feet !== null && inches !== null ? `${feet}' ${inches}" (${cm} CM)` : "--"} •{" "}
                {profile.weight !== null ? `${(profile.weight * 0.453592).toFixed(1)} KG` : "--"}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Row 1: Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-xs font-medium text-slate-300">
              Rider Display Name
            </Label>
            <Input
              id="display-name"
              placeholder="Enter your name"
              value={profile.displayName}
              onChange={(e) =>
                onUpdateProfile({ displayName: e.target.value })
              }
              className="bg-slate-950 border-slate-800 max-w-md"
            />
            <p className="text-[11px] text-slate-500">
              Personalizes your garage, active fleet, and daily pre-ride greetings.
            </p>
          </div>

          {/* Row 2: Height Slider */}
          <div className="space-y-4 pt-4 border-t border-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-200">
                  Rider Height
                </Label>
                <p className="text-[11px] text-slate-500">
                  Adjust slider to match your height for cockpit ergonomics and reach balance
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold font-mono text-slate-100">
                  {feet}&apos; {inches}&quot;
                </span>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  ({cm} CM)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Slider
                min={54} // 4' 6"
                max={82} // 6' 10"
                step={1}
                value={[heightInches || 68]}
                onValueChange={(val) => onUpdateProfile({ heightInches: val[0] })}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                <span>4&apos; 6&quot; (137 CM)</span>
                <span className="text-slate-400">5&apos; 8&quot; (173 CM)</span>
                <span>6&apos; 10&quot; (208 CM)</span>
              </div>
            </div>
          </div>

          {/* Row 3: Weight Slider and Numeric Input */}
          <div className="space-y-4 pt-4 border-t border-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rider-weight" className="text-xs font-medium text-slate-200">
                  Total Riding Weight
                </Label>
                <p className="text-[11px] text-slate-500">
                  Body weight + typical riding apparel, helmet, shoes, and hydration pack
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  id="rider-weight"
                  type="number"
                  min={80}
                  max={280}
                  placeholder="e.g. 175"
                  value={profile.weight ?? ""}
                  onChange={(e) =>
                    onUpdateProfile({ weight: e.target.value === "" ? null : Number(e.target.value) })
                  }
                  className="w-24 h-9 text-right font-mono text-base md:text-sm bg-slate-950 border-slate-800"
                />
                <span className="text-xs text-slate-400 font-mono">LBS</span>
              </div>
            </div>

            <div className="pt-2">
              <Slider
                min={100}
                max={260}
                step={1}
                value={[profile.weight || 160]}
                onValueChange={(val) => onUpdateProfile({ weight: val[0] })}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                <span>100 LBS (LIGHT)</span>
                <span className="text-slate-400">180 LBS (MED)</span>
                <span>260 LBS (HEAVY)</span>
              </div>
            </div>
          </div>

          {/* Row 4: Riding Style Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-200">
                  Default Riding Style Dynamics
                </Label>
                <p className="text-[11px] text-slate-500">
                  Baseline style setting (can also be overridden per ride in the Ride Setup tab)
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 capitalize">
                {profile.ridingStyle.replace("_", " ")}
              </span>
            </div>

            <ToggleGroup
              type="single"
              value={profile.ridingStyle}
              onValueChange={(val) => {
                if (val) onUpdateProfile({ ridingStyle: val as RidingStyle });
              }}
              className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/60"
            >
              {/* Smooth / Light */}
              <ToggleGroupItem
                value="smooth_light"
                className="w-full h-auto py-3 px-3.5 flex flex-col items-start gap-1 text-left rounded-lg data-[state=on]:bg-slate-800 data-[state=on]:border-slate-700 data-[state=on]:text-slate-100"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Feather className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Smooth / Light</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal leading-tight">
                  Picks clean lines, lighter on hardware. (-1.0 PSI tires / -5% air spring)
                </p>
              </ToggleGroupItem>

              {/* Neutral */}
              <ToggleGroupItem
                value="neutral"
                className="w-full h-auto py-3 px-3.5 flex flex-col items-start gap-1 text-left rounded-lg data-[state=on]:bg-slate-800 data-[state=on]:border-slate-700 data-[state=on]:text-slate-100"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Neutral</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal leading-tight">
                  Balanced trail riding and all-around compliance. (Nominal baseline)
                </p>
              </ToggleGroupItem>

              {/* Aggressive / Heavy */}
              <ToggleGroupItem
                value="aggressive_heavy"
                className="w-full h-auto py-3 px-3.5 flex flex-col items-start gap-1 text-left rounded-lg data-[state=on]:bg-slate-800 data-[state=on]:border-slate-700 data-[state=on]:text-slate-100"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aggressive / Heavy</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal leading-tight">
                  Hard-charging, drops, harsh rock gardens. (+1.5 PSI tires / +5% air spring)
                </p>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
