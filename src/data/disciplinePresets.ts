import {
  Sun,
  Leaf,
  CloudRain,
  Mountain,
  Snowflake,
  CloudSnow,
  Waves,
  Compass,
  TreePine,
} from "lucide-react";
import type { BikeDiscipline, TrailCondition } from "@/types/cycling";

export interface SurfaceConditionPreset {
  id: TrailCondition;
  label: string;
  icon: typeof Sun;
  offset: string;
}

export const DISCIPLINE_SURFACE_PRESETS: Record<
  BikeDiscipline,
  SurfaceConditionPreset[]
> = {
  mountain: [
    { id: "dry_hardpack", label: "Dry / Hardpack", icon: Sun, offset: "0.0 PSI" },
    { id: "loam_dirt", label: "Loam", icon: Leaf, offset: "0.0 PSI" },
    { id: "wet_mud", label: "Wet / Mud", icon: CloudRain, offset: "-1.5 PSI" },
    { id: "snow_ice", label: "Snow / Ice", icon: Snowflake, offset: "-2.0 PSI" },
    { id: "bike_park", label: "Bike Park", icon: Mountain, offset: "+2.0 PSI" },
  ],
  fat_bike: [
    { id: "dry_dirt", label: "Dry / Dirt", icon: Sun, offset: "0.0 PSI" },
    { id: "packed_snow", label: "Packed Snow", icon: Snowflake, offset: "-1.0 PSI" },
    { id: "deep_snow", label: "Deep Snow", icon: CloudSnow, offset: "-2.5 PSI" },
    { id: "sand", label: "Sand", icon: Waves, offset: "-2.0 PSI" },
    { id: "fat_mud", label: "Mud", icon: CloudRain, offset: "-1.5 PSI" },
  ],
  gravel: [
    { id: "gravel_hardpack", label: "Hardpack", icon: Compass, offset: "+1.5 PSI" },
    { id: "deep_gravel", label: "Deep Gravel", icon: Mountain, offset: "-2.0 PSI" },
    { id: "gravel_wet", label: "Wet", icon: CloudRain, offset: "-2.5 PSI" },
    { id: "singletrack", label: "Singletrack", icon: TreePine, offset: "-1.5 PSI" },
    { id: "snow_ice", label: "Snow / Ice", icon: Snowflake, offset: "-2.0 PSI" },
  ],
  road: [
    { id: "smooth_asphalt", label: "Pristine", icon: Sun, offset: "+3.0 PSI" },
    { id: "rough_chipseal", label: "Rough", icon: Compass, offset: "-3.0 PSI" },
    { id: "wet_tarmac", label: "Wet", icon: CloudRain, offset: "-5.0 PSI" },
    { id: "cobblestones", label: "Cobbles", icon: Mountain, offset: "-6.0 PSI" },
  ],
  urban_commuter: [
    { id: "dry_pavement", label: "Dry Pavement", icon: Sun, offset: "0.0 PSI" },
    { id: "wet_rain", label: "Wet / Rain", icon: CloudRain, offset: "-3.0 PSI" },
    { id: "rough_potholes", label: "Potholes / Rough", icon: Compass, offset: "-2.0 PSI" },
    { id: "winter_slush", label: "Winter / Slush", icon: Snowflake, offset: "-4.0 PSI" },
  ],
};
