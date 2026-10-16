export type TireCasing = "light" | "standard" | "heavy";

export interface TireSetup {
  manufacturer: string;
  model: string;
  width: string;
  casing: TireCasing;
  hasInsert: boolean;
}

export interface Bike {
  id: string;
  name: string;
  isEBike: boolean;
  suspensionType: "Full Suspension" | "Hardtail";
  forkModel: string;
  forkTravel: number; // in mm
  shockModel: string;
  frontTire: TireSetup;
  rearTire: TireSetup;
}

export interface RiderProfile {
  baseWeight: number; // rider body weight in lbs
  gearWeight: number; // riding kit, shoes, pack in lbs
}

export type TrailCondition =
  | "dry_fast"
  | "loam_dirt"
  | "wet_slippery"
  | "bike_park";

export interface ModifierNote {
  label: string;
  deltaPsi: number;
  description: string;
}

export interface BikeSetupOutput {
  totalRidingWeight: number;
  frontPsi: number;
  rearPsi: number;
  forkPsi: number;
  shockPsi: number;
  reboundClicks: number;
  frontModifiers: ModifierNote[];
  rearModifiers: ModifierNote[];
  suspensionNotes: string[];
}
