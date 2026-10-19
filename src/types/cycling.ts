export type RidingStyle = "smooth_light" | "neutral" | "aggressive_heavy";

export type BikeDiscipline =
  | "mountain"
  | "gravel"
  | "road"
  | "fat_bike"
  | "urban_commuter";

export type SuspensionLayout =
  | "rigid"
  | "front_suspension"
  | "full_suspension";

export type BikeCategory =
  | "full_suspension"
  | "hardtail"
  | "gravel"
  | "road"
  | "fat_bike"
  | "urban_commuter";

export type WheelSize = "29\"" | "27.5\"" | "700c" | "650b" | "26\"";

export type TireCasing = "light" | "standard" | "heavy" | (string & {});

export interface TireSetup {
  wheelSize: WheelSize;
  manufacturer: string;
  model: string;
  width: string;
  casing: TireCasing;
  compound?: string | null;
  hasInsert: boolean;
  isTubeless: boolean;
}

export interface Bike {
  id: string;
  brand: string;
  customBrand?: string;
  model: string;
  year: number | string;
  frameSize: string;
  discipline: BikeDiscipline;
  suspensionLayout: SuspensionLayout;
  category?: BikeCategory;
  isEBike: boolean;
  forkModel: string;
  forkTravel: number; // 0 for rigid
  shockModel: string;
  rearShockStroke?: number | null; // mm
  rearWheelTravel?: number | null; // mm
  frontTire: TireSetup;
  rearTire: TireSetup;
}

export interface RiderProfile {
  displayName: string;
  weight: number | null; // lbs
  heightInches: number | null; // in inches: 54 (4'6") to 82 (6'10")
  height?: string; // optional string display
  ridingStyle: RidingStyle;
}

export type SurfaceCondition =
  // Mountain
  | "dry_hardpack"
  | "loam_dirt"
  | "wet_mud"
  | "snow_ice"
  | "bike_park"
  // Fat Bike
  | "dry_dirt"
  | "packed_snow"
  | "deep_snow"
  | "sand"
  | "fat_mud"
  // Gravel
  | "gravel_hardpack"
  | "deep_gravel"
  | "gravel_wet"
  | "singletrack"
  | "gravel_singletrack"
  | "hardpack_pavement"
  | "packed_gravel"
  | "loose_chunky"
  // Road
  | "smooth_asphalt"
  | "rough_chipseal"
  | "wet_tarmac"
  | "cobblestones"
  // Urban / Commuter
  | "dry_pavement"
  | "wet_rain"
  | "rough_potholes"
  | "winter_slush"
  // Legacy aliases
  | "dry_fast"
  | "wet_slippery";

export type TrailCondition = SurfaceCondition;

export interface ModifierItem {
  label: string;
  delta: number;
  description: string;
}

export interface SetupCalculationOutput {
  frontPsi: number;
  rearPsi: number;
  forkPsi: number | null;
  shockPsi: number | null;
  reboundClicks: number | null;
  hasForkSuspension: boolean;
  hasRearSuspension: boolean;
  frontModifiers: ModifierItem[];
  rearModifiers: ModifierItem[];
  suspensionNotes: string[];
}
