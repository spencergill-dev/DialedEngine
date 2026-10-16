import { User, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import type { RiderProfile } from "@/types/mountainBike";

interface RiderProfileCardProps {
  profile: RiderProfile;
  onUpdate: (partial: Partial<RiderProfile>) => void;
}

export function RiderProfileCard({ profile, onUpdate }: RiderProfileCardProps) {
  const totalWeight = profile.baseWeight + profile.gearWeight;

  return (
    <Card className="border-slate-800/60 bg-slate-900/60 shadow-lg">
      <CardHeader className="p-6 pb-4 border-b border-slate-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-slate-300" />
            <div>
              <CardTitle className="text-base font-semibold text-slate-100">
                Rider Profile
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Your body weight and riding gear determine baseline air spring and tire pressures.
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {totalWeight}
            </span>
            <span className="text-xs text-slate-400 font-mono ml-1">LBS</span>
            <div className="text-[10px] text-slate-500 font-mono">
              TOTAL RIDING WEIGHT
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Body Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="base-weight" className="text-xs text-slate-300">
                Rider Body Weight (No Gear)
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="base-weight"
                  type="number"
                  min={90}
                  max={280}
                  value={profile.baseWeight}
                  onChange={(e) =>
                    onUpdate({ baseWeight: Number(e.target.value) || 160 })
                  }
                  className="w-20 h-8 text-right font-mono text-base md:text-sm bg-slate-950 border-slate-800"
                />
                <span className="text-xs text-slate-400 font-mono">LBS</span>
              </div>
            </div>

            <Slider
              min={100}
              max={260}
              step={1}
              value={[profile.baseWeight]}
              onValueChange={(val) => onUpdate({ baseWeight: val[0] })}
              className="py-1"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>100 LBS</span>
              <span>180 LBS</span>
              <span>260 LBS</span>
            </div>
          </div>

          {/* Riding Gear Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <Label htmlFor="gear-weight" className="text-xs text-slate-300">
                  Gear & Protection Weight
                </Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  id="gear-weight"
                  type="number"
                  min={0}
                  max={40}
                  value={profile.gearWeight}
                  onChange={(e) =>
                    onUpdate({ gearWeight: Number(e.target.value) || 0 })
                  }
                  className="w-20 h-8 text-right font-mono text-base md:text-sm bg-slate-950 border-slate-800"
                />
                <span className="text-xs text-slate-400 font-mono">LBS</span>
              </div>
            </div>

            <Slider
              min={0}
              max={30}
              step={1}
              value={[profile.gearWeight]}
              onValueChange={(val) => onUpdate({ gearWeight: val[0] })}
              className="py-1"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 LBS (Minimal)</span>
              <span>10 LBS (Helmet, Pack, Pads)</span>
              <span>30 LBS (Heavy Kit)</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center justify-between text-xs text-slate-400">
          <span>
            Combined: <strong className="text-slate-200">{profile.baseWeight} lbs</strong> body + <strong className="text-slate-200">{profile.gearWeight} lbs</strong> gear
          </span>
          <span className="font-mono text-slate-300">
            = {totalWeight} lbs ({(totalWeight * 0.453592).toFixed(1)} kg)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
