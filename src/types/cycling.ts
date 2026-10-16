export type RidingStyle = "smooth_light" | "neutral" | "aggressive_heavy";

export type BikeCategory =
  | "full_suspension"
  | "hardtail"
  | "gravel"
  | "road"
  | "fat_bike";

export type WheelSize = "29\"" | "27.5\"" | "700c" | "650b" | "26\"";

export type TireCasing = "light" | "standard" | "heavy";

export interface TireSetup {
  wheelSize: WheelSize;
  manufacturer: string;
  model: string;
  width: string;
  casing: TireCasing;
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
  category: BikeCategory;
  isEBike: boolean;
  forkModel: string;
  forkTravel: number; // 0 for rigid
  shockModel: string;
  frontTire: TireSetup;
  rearTire: TireSetup;
}

export interface RiderProfile {
  displayName: string;
  weight: number; // lbs
  heightInches: number; // in inches: 54 (4'6") to 82 (6'10")
  height?: string; // optional string display
  ridingStyle: RidingStyle;
}

export type TrailCondition =
  | "dry_fast"
  | "loam_dirt"
  | "wet_slippery"
  | "bike_park";

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
